importScripts('/s/browserfs.min.js');
importScripts('/s/sw-xhr.js');
self.languagePluginUrl = '/s/pyodide/';
importScripts('/s/pyodide/pyodide.js');


var onmessage = function (e) { // eslint-disable-line no-unused-vars
    console.log("Received message!")
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

        self.pyodide.runPythonAsync(data.python, () => {
        })
            .then((results) => {
                self.postMessage({results});
            })
            .catch((err) => {
                // if you prefer messages with the error
                self.postMessage({error: err.message});
                // if you prefer onerror events
                // setTimeout(() => { throw err; });
            });
    });
}
languagePluginLoader.then(() => {
    console.log("Loaded pyodide!");
}).catch(e => {console.error(e)});

self.addEventListener('install', function (event) {
    console.log("Started Service Worker Installation...");
    const initPromise = fetch('/o/resources.zip')
        .then(function (response) {
            return response.arrayBuffer();
        })
        .then(function (zipData) {
            console.log("Creating FS from zip")
            var Buffer = BrowserFS.BFSRequire('buffer').Buffer;
            return new Promise((resolve, reject) => {
                BrowserFS.configure({
                    fs: "ZipFS",
                    options: {zipData: Buffer.from(zipData)}
                }, function (e) {
                    if (e) {
                        console.error("Failed to initialize FS", e);
                        reject(e);
                    } else {
                        console.log("Successfully initialized FS");
                        resolve();
                    }
                });
            });
        })
        .then(function () {
            return new Promise(r => setTimeout(r, 2000));
        })
        .then(function () {
            console.log("Waiting for languagePluginLoader", languagePluginLoader);
            return languagePluginLoader
        })
        .then(() => {
            console.log("Language plugin loaded")
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
            console.log("Starting to load packages")
            let origin = self.location.origin;
            self.pyodide.runPython(`
import sys
import os.path
import zipfile
import io
import json
import importlib
from pathlib import Path

WHEEL_BASE = Path("/lib/python3.7/site-packages")

sys.path.append('/data')
for x in os.listdir('/data/wheels'):
  whl_path = f"/data/wheels/{x}"
  print(f"Installing {whl_path}")
  with open(whl_path, 'rb') as f:
    with zipfile.ZipFile(f) as zf:
      zf.extractall(WHEEL_BASE)
print(os.listdir("/lib/python3.7/site-packages"))
importlib.invalidate_caches()
import flask
print("Finished loading packages")
    `);
            console.log("Loading python app...");
            self.pyodide.runPython(`
from app import app

base_environ = {
    **os.environ,
    "SERVER_NAME": "unholyabomination",
    "SERVER_PORT": "80",
    "SCRIPT_NAME": "",
    "wsgi.version": (1, 0),
    "wsgi.multithread": False,
    "wsgi.multiprocess": True,
    "wsgi.url_scheme": "http",
    "wsgi.run_once": False,
    "wsgi.errors": sys.stderr,
}

def get_response(req):
    method, requestbody, headers, path, querystring = json.loads(req)
    headers_set = []
    headers_sent = []
    request_io = io.StringIO(requestbody)
    header_vars = {f"HTTP_{k.upper()}": v for k, v in headers.items()}
    environ = { **base_environ, "wsgi.input": request_io, **header_vars, "PATH_INFO": path, "QUERY_STRING": querystring, "REQUEST_METHOD": method }
    resp_body = b""

    def write(data):
        print(f"WRITE: {data!r}\\n\\n")
        nonlocal resp_body
        if not headers_set:
            raise AssertionError("write() before start_response()")

        elif not headers_sent:
            # Before the first output, send the stored headers
            status, response_headers = headers_sent[:] = headers_set

            resp_body += (b'Status: %s\\r\\n' % status)
            for header in response_headers:
                resp_body += (b'%s: %s\\r\\n' % header)

        resp_body += data

    def start_response(status, response_headers, exc_info=None):
        if exc_info:
            try:
                if headers_sent:
                    # Re-raise original exception if headers sent
                    raise ValueError("Headers already sent")
            finally:
                exc_info = None     # avoid dangling circular ref
        elif headers_set:
            raise AssertionError("Headers already set!")

        headers_set[:] = [status, response_headers]
        return write

    result = app(environ, start_response)
    resp_data = b''.join(result)
    status, headers = headers_set
    status_code = int(status[:3])
    status_text = status[4:]
    print("headers_set:", headers_set)
    print("resp_body:", repr(resp_data))
    return {
        "status": status_code,
        "statusText": status_text,
        "headers": headers,
        "body": resp_data.decode(),
    }
`);
            console.log("Python app loaded!");
        });
    event.waitUntil(initPromise);
})

self.addEventListener('fetch', async (event) => {
    console.log(event);
    const url = new URL(event.request.url);
    const path = url.pathname;
    const querystring = url.searchParams.toString();
    const method = event.request.method;
    const reqBody = '';
    let headers = { ...event.request.headers };
    const req = JSON.stringify([method, reqBody, headers, path, querystring]);
    try {
        const resp = await pyodide.runPythonAsync(`get_response('${req}')`);
        console.log(JSON.stringify(resp));
        const { status, statusText, headers, body } = resp;
        event.respondWith(
            new Response(body, { status, statusText, headers })
        );
    } catch (e) {
        console.error("Failed to get response", e);
        event.respondWith(
            new Response(`Server Error: ${e}`, { status: 500 })
        );

    }
})