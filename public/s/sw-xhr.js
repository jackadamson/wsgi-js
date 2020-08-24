function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var XMLHttpRequestPolyfillBase = (function () {
    function XMLHttpRequestPolyfillBase() {
        this.DONE = 4;
        this.HEADERS_RECEIVED = 2;
        this.LOADING = 3;
        this.OPENED = 1;
        this.UNSENT = 0;
        this.readyState = this.UNSENT;
        this.responseText = '';
        this.responseType = '';
        this.responseURL = '';
        this.responseXML = null;
        this.status = -1;
        this.statusText = '';
        this.timeout = -1;
        this.upload = null;
        this.withCredentials = false;
    }
    return XMLHttpRequestPolyfillBase;
}());

var XMLHttpRequestPolyfilleEvents = (function (_super) {
    __extends(XMLHttpRequestPolyfilleEvents, _super);
    function XMLHttpRequestPolyfilleEvents() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.events = {
            abort: [],
            error: [],
            load: [],
            loadend: [],
            loadstart: [],
            progress: [],
            readystatechange: [],
            timeout: [],
        };
        return _this;
    }
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onabort", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('abort', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onerror", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('error', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onload", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('load', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onloadend", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('loadend', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onloadstart", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('loadstart', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onprogress", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('progress', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "onreadystatechange", {
        get: function () {
            return this.dispatchEvent.bind(this);
        },
        set: function (listener) {
            this.addEventListener('readystatechange', listener);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(XMLHttpRequestPolyfilleEvents.prototype, "ontimeout", {
        set: function (listener) {
            this.addEventListener('readystatechange', listener);
        },
        enumerable: true,
        configurable: true
    });
    XMLHttpRequestPolyfilleEvents.prototype.addEventListener = function (type, listener, options) {
        switch (type) {
            case 'readystatechange':
                this.events.readystatechange.push(listener.bind(this));
                break;
            case 'abort':
                this.events.abort.push(listener.bind(this));
                break;
            case 'error':
                this.events.error.push(listener.bind(this));
                break;
            case 'load':
                this.events.load.push(listener.bind(this));
                break;
            case 'loadend':
                this.events.loadend.push(listener.bind(this));
                break;
            case 'loadstart':
                this.events.loadstart.push(listener.bind(this));
                break;
            case 'progress':
                this.events.progress.push(listener.bind(this));
                break;
            case 'timeout':
                this.events.timeout.push(listener.bind(this));
                break;
            default:
                var never = type;
                throw Error("Listener type " + never + " is not supported.");
        }
    };
    XMLHttpRequestPolyfilleEvents.prototype.dispatchEvent = function (evt) {
        var type = evt.type;
        var eventQueue = this.events[type];
        for (var _i = 0, eventQueue_1 = eventQueue; _i < eventQueue_1.length; _i++) {
            var listener = eventQueue_1[_i];
            listener.call(this, evt);
        }
        return true;
    };
    XMLHttpRequestPolyfilleEvents.prototype.removeEventListener = function (type, listener, options) {
        switch (type) {
            case 'readystatechange':
                this.events.readystatechange = this.events.readystatechange.filter(function (e) { return e !== listener; });
                break;
            case 'abort':
                this.events.abort = this.events.abort.filter(function (e) { return e !== listener; });
                break;
            case 'error':
                this.events.error = this.events.error.filter(function (e) { return e !== listener; });
                break;
            case 'load':
                this.events.load = this.events.load.filter(function (e) { return e !== listener; });
                break;
            case 'loadend':
                this.events.loadend = this.events.loadend.filter(function (e) { return e !== listener; });
                break;
            case 'loadstart':
                this.events.loadstart = this.events.loadstart.filter(function (e) { return e !== listener; });
                break;
            case 'progress':
                this.events.progress = this.events.progress.filter(function (e) { return e !== listener; });
                break;
            case 'timeout':
                this.events.timeout = this.events.timeout.filter(function (e) { return e !== listener; });
                break;
            default:
                var never = type;
                throw Error("Listener type " + never + " is not supported.");
        }
    };
    return XMLHttpRequestPolyfilleEvents;
}(XMLHttpRequestPolyfillBase));

var XMLHttpRequestPolyfill = (function (_super) {
    __extends(XMLHttpRequestPolyfill, _super);
    function XMLHttpRequestPolyfill() {
        console.error("Someone used XHR")
        throw new Error("Someone used XHR!@");
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.aborted = false;
        return _this;
    }
    XMLHttpRequestPolyfill.prototype.abort = function () {
        this.aborted = true;
    };
    XMLHttpRequestPolyfill.prototype.getAllResponseHeaders = function () {
        var result = '';
        if (this.responseHeaders) {
            this.responseHeaders.forEach(function (value, name) {
                result += name + ": " + value;
            });
        }
        return result;
    };
    XMLHttpRequestPolyfill.prototype.getResponseHeader = function (header) {
        if (this.responseHeaders && this.responseHeaders.has(header)) {
            return this.responseHeaders.get(header);
        }
        return null;
    };
    XMLHttpRequestPolyfill.prototype.msCachingEnabled = function () {
        throw Error('not implemented');
    };
    XMLHttpRequestPolyfill.prototype.open = function (method, url, async, user, password) {
        this.request = new Request(url, {
            method: method,
        });
        this.readyState = this.OPENED;
        this.onreadystatechange(new Event('readystatechange'));
    };
    XMLHttpRequestPolyfill.prototype.overrideMimeType = function (mime) {
        throw Error('not implemented');
    };
    XMLHttpRequestPolyfill.prototype.setRequestHeader = function (header, value) {
        if (!this.request) {
            throw Error();
        }
        this.request.headers.append(header, value);
    };
    XMLHttpRequestPolyfill.prototype.send = function (data) {
        var _this = this;
        if (!this.request) {
            throw Error();
        }
        if (data) {
            this.request = new Request(this.request, {
                body: data,
            });
        }
        this.readyState = this.LOADING;
        this.onreadystatechange(new Event('readystatechange'));
        fetch(this.request)
            .then(function (response) {
            if (_this.aborted) {
                return '';
            }
            _this.readyState = _this.HEADERS_RECEIVED;
            _this.onreadystatechange(new Event('readystatechange'));
            _this.status = response.status;
            _this.statusText = response.statusText;
            _this.responseHeaders = response.headers;
            return response.text();
        })
            .then(function (text) {
            if (_this.aborted) {
                return;
            }
            _this.responseText = text;
            _this.readyState = _this.DONE;
            _this.onreadystatechange(new Event('readystatechange'));
        });
    };
    return XMLHttpRequestPolyfill;
}(XMLHttpRequestPolyfilleEvents));

XMLHttpRequest = XMLHttpRequestPolyfill;
