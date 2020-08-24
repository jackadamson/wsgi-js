var Module = typeof pyodide._module !== "undefined" ? pyodide._module : {};
Module.checkABI(1);
if (!Module.expectedDataFileDownloads) {
    Module.expectedDataFileDownloads = 0;
    Module.finishedDataFileDownloads = 0
}
Module.expectedDataFileDownloads++;
(function () {
    var loadPackage = function (metadata) {
        var PACKAGE_PATH;
        if (typeof window === "object") {
            PACKAGE_PATH = window["encodeURIComponent"](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf("/")) + "/")
        } else if (typeof location !== "undefined") {
            PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf("/")) + "/")
        } else {
            throw"using preloaded data can only be done on a web page or in a web worker"
        }
        var PACKAGE_NAME = "micropip.data";
        var REMOTE_PACKAGE_BASE = "micropip.data";
        if (typeof Module["locateFilePackage"] === "function" && !Module["locateFile"]) {
            Module["locateFile"] = Module["locateFilePackage"];
            err("warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)")
        }
        var REMOTE_PACKAGE_NAME = Module["locateFile"] ? Module["locateFile"](REMOTE_PACKAGE_BASE, "") : REMOTE_PACKAGE_BASE;
        var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
        var PACKAGE_UUID = metadata.package_uuid;

        function fetchRemotePackage(packageName, packageSize, callback, errback) {
            fetch(packageName)
                .catch(e => {
                    throw new Error("Network error: " + e)
                })
                .then(response => response.arrayBuffer())
                .then(callback)
        }

        function handleError(error) {
            console.error("package error:", error)
        }

        var fetchedCallback = null;
        var fetched = Module["getPreloadedPackage"] ? Module["getPreloadedPackage"](REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE) : null;
        if (!fetched) fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, function (data) {
            if (fetchedCallback) {
                fetchedCallback(data);
                fetchedCallback = null
            } else {
                fetched = data
            }
        }, handleError);

        function runWithFS() {
            function assert(check, msg) {
                if (!check) throw msg + (new Error).stack
            }

            Module["FS_createPath"]("/", "lib", true, true);
            Module["FS_createPath"]("/lib", "python3.7", true, true);
            Module["FS_createPath"]("/lib/python3.7", "site-packages", true, true);

            function DataRequest(start, end, audio) {
                this.start = start;
                this.end = end;
                this.audio = audio
            }

            DataRequest.prototype = {
                requests: {}, open: function (mode, name) {
                    this.name = name;
                    this.requests[name] = this;
                    Module["addRunDependency"]("fp " + this.name)
                }, send: function () {
                }, onload: function () {
                    var byteArray = this.byteArray.subarray(this.start, this.end);
                    this.finish(byteArray)
                }, finish: function (byteArray) {
                    var that = this;
                    Module["FS_createPreloadedFile"](this.name, null, byteArray, true, true, function () {
                        Module["removeRunDependency"]("fp " + that.name)
                    }, function () {
                        if (that.audio) {
                            Module["removeRunDependency"]("fp " + that.name)
                        } else {
                            err("Preloading file " + that.name + " failed")
                        }
                    }, false, true);
                    this.requests[this.name] = null
                }
            };

            function processPackageData(arrayBuffer) {
                Module.finishedDataFileDownloads++;
                assert(arrayBuffer, "Loading data file failed.");
                assert(arrayBuffer instanceof ArrayBuffer, "bad input to processPackageData");
                var byteArray = new Uint8Array(arrayBuffer);
                var curr;
                var compressedData = {
                    data: null,
                    cachedOffset: 5448,
                    cachedIndexes: [-1, -1],
                    cachedChunks: [null, null],
                    offsets: [0, 1372, 2737, 3730, 4846],
                    sizes: [1372, 1365, 993, 1116, 602],
                    successes: [1, 1, 1, 1, 1]
                };
                compressedData.data = byteArray;
                assert(typeof Module.LZ4 === "object", "LZ4 not present - was your app build with  -s LZ4=1  ?");
                Module.LZ4.loadPackage({metadata: metadata, compressedData: compressedData});
                Module["removeRunDependency"]("datafile_micropip.data")
            }

            Module["addRunDependency"]("datafile_micropip.data");
            if (!Module.preloadResults) Module.preloadResults = {};
            Module.preloadResults[PACKAGE_NAME] = {fromCache: false};
            if (fetched) {
                processPackageData(fetched);
                fetched = null
            } else {
                fetchedCallback = processPackageData
            }
        }

        if (Module["calledRun"]) {
            runWithFS()
        } else {
            if (!Module["preRun"]) Module["preRun"] = [];
            Module["preRun"].push(runWithFS)
        }
    };
    loadPackage({
        files: [{
            filename: "/lib/python3.7/site-packages/micropip-0.1-py3.7.egg-info",
            start: 0,
            end: 279,
            audio: 0
        }, {filename: "/lib/python3.7/site-packages/micropip.py", start: 279, end: 9004, audio: 0}],
        remote_package_size: 9544,
        package_uuid: "d9b3ceda-a5e4-4d4c-b1b2-5ed802599a72"
    })
})();