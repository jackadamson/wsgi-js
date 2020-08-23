importScripts('/s/browserfs.min.js');
self.languagePluginUrl = '/s/pyodide/';
importScripts('/s/pyodide/pyodide.js');

BrowserFS.configure({
  fs: "HTTPRequest",
  options: {index: "/app/index.json", preferXHR: false}
}, function (e) {
    if (e) {
        console.error("Failed to initialize FS", e);
    } else {
        console.log("Successfully initialized FS");
    }
});

languagePluginLoader.then(() => {
    var fs = BrowserFS.BFSRequire('fs');
    let FS = pyodide._module.FS;
    let PATH = pyodide._module.PATH;
// Create an Emscripten interface for the BrowserFS
    var BFS = new BrowserFS.EmscriptenFS(FS, PATH);
    // Create mount point in Emscripten FS
    FS.createFolder(FS.root, 'data', true, true);
    // Mount BrowserFS into Emscripten FS
    FS.mount(BFS, {root: '/'}, '/data');

    return pyodide.loadPackage('micropip');
}).then(() => {
    let origin = self.location.origin;
    self.pyodide.runPython(`
import sys
import os.path
import micropip
sys.path.append('/data')
for x in os.listdir('/data/wheels'):
  whl_path = f"${origin}/app/wheels/{x}"
  print(f"Installing {whl_path}")
  micropip.install(whl_path)    
print("Finished loading packages")
    `);
});

var onmessage = function(e) { // eslint-disable-line no-unused-vars

    languagePluginLoader.then(() => {
      // Existing code
      const data = e.data;
      const keys = Object.keys(data);
      for (let key of keys) {
        if (key !== 'python') {
          // Keys other than python must be arguments for the python script.
          // Set them on self, so that `from js import key` works.
          self[key] = data[key];
        }
      }

      self.pyodide.runPythonAsync(data.python, () => {})
          .then((results) => { self.postMessage({results}); })
          .catch((err) => {
            // if you prefer messages with the error
            self.postMessage({error : err.message});
            // if you prefer onerror events
            // setTimeout(() => { throw err; });
          });
    });
}
