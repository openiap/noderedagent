"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.openiap_storage = exports.noderednpmrc = void 0;
var fs = require("fs");
var path = require("path");
var nodered = require("node-red");
var nodeapi_1 = require("@openiap/nodeapi");
var info = nodeapi_1.config.info, warn = nodeapi_1.config.warn, err = nodeapi_1.config.err;
var child_process = require("child_process");
var noderednpmrc = /** @class */ (function () {
    function noderednpmrc() {
        this._type = "npmrc";
        this.catalogues = [];
    }
    return noderednpmrc;
}());
exports.noderednpmrc = noderednpmrc;
var openiap_storage = /** @class */ (function () {
    function openiap_storage(client) {
        this.client = client;
        this.settings = null;
        this.nodered_id = "";
        this.watchid = "";
        this.RED = null;
        this._flows = null;
        this._credentials = null;
        this._settings = null;
        this.npmrc = null;
        this.firstrun = true;
        this.bussy = false;
        this.versions = {};
        this.nodered_id = process.env.nodered_id;
        this.RED = nodered;
        this.getFlows = (this._getFlows.bind(this));
        this.saveFlows = (this._saveFlows.bind(this));
        this.getCredentials = (this._getCredentials.bind(this));
        this.saveCredentials = (this._saveCredentials.bind(this));
        this.getSettings = (this._getSettings.bind(this));
        this.saveSettings = (this._saveSettings.bind(this));
        this.getSessions = (this._getSessions.bind(this));
        this.saveSessions = (this._saveSessions.bind(this));
        this.getLibraryEntry = (this._getLibraryEntry.bind(this));
        this.saveLibraryEntry = (this._saveLibraryEntry.bind(this));
        if (this.client.signedin) {
            this.registerWatch();
        }
        this.client.on("signedin", this.registerWatch.bind(this));
    }
    openiap_storage.prototype.registerWatch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, this.client.Watch({ collectionname: "nodered", paths: ["$."] }, this.onupdate.bind(this))];
                    case 1:
                        _a.watchid = _b.sent();
                        info("Register watch with id " + this.watchid);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        setTimeout(this.CheckUpdates.bind(this), 30000);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype.scanDirForNodesModules = function (dir) {
        var _this = this;
        var results = [];
        try {
            var files = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true });
            files.sort();
            files.forEach(function (fn) {
                try {
                    var stats = fs.statSync(path.join(dir, fn.name));
                    if (stats.isFile()) {
                    }
                    else if (stats.isDirectory()) {
                        if (fn.name == "node_modules") {
                            results = results.concat(_this.scanDirForNodesModules(path.join(dir, fn.name)));
                        }
                        else {
                            var pkgfn = path.join(dir, fn.name, "package.json");
                            if (fs.existsSync(pkgfn)) {
                                var pkg = require(pkgfn);
                                // var moduleDir = path.join(dir, fn);
                                // results.push({ dir: moduleDir, package: pkg });
                                results.push(pkg);
                            }
                        }
                    }
                }
                catch (error) {
                }
            });
        }
        catch (error) {
        }
        return results;
    };
    openiap_storage.prototype.GetMissingModules = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var currentmodules, globaldir, keys, modules, _loop_1, i, _loop_2, i;
            return __generator(this, function (_a) {
                currentmodules = this.scanDirForNodesModules(this.settings.userDir);
                globaldir = "";
                try {
                    globaldir = child_process.execSync('npm root -g').toString();
                    if (globaldir.indexOf('\n')) {
                        if (globaldir.endsWith('\n'))
                            globaldir = globaldir.substr(0, globaldir.length - 1);
                        globaldir = globaldir.substr(globaldir.lastIndexOf('\n') + 1);
                    }
                    if (globaldir != null && globaldir != "")
                        currentmodules = currentmodules.concat(this.scanDirForNodesModules(globaldir));
                }
                catch (error) {
                    console.error(error);
                }
                modules = "";
                if (settings == null)
                    return [2 /*return*/, modules];
                if (settings.nodes != null) {
                    keys = Object.keys(settings.nodes);
                    _loop_1 = function (i) {
                        var key = keys[i];
                        if (key == "node-red" || key == "node-red-node-rbe" || key == "node-red-node-tail")
                            return "continue";
                        var val = settings.nodes[key];
                        var version = (val.pending_version ? val.pending_version : val.version);
                        var pcks = currentmodules.filter(function (x) { return x.name == key && x.version == version; });
                        if (pcks.length != 1) {
                            modules += (" " + key + "@" + version);
                        }
                        else {
                            info("Skipping " + key + "@" + version + " found locally or " + globaldir);
                        }
                    };
                    for (i = 0; i < keys.length; i++) {
                        _loop_1(i);
                    }
                }
                if (settings.modules != null) {
                    keys = Object.keys(settings.modules);
                    _loop_2 = function (i) {
                        var key = keys[i];
                        var val = settings.modules[key];
                        if (val.builtin || val.known)
                            return "continue";
                        var pcks = currentmodules.filter(function (x) { return x.name == key; });
                        if (pcks.length != 1) {
                            modules += (" " + key);
                        }
                        else {
                            info("Skipping " + key + " found locally or " + globaldir);
                        }
                    };
                    for (i = 0; i < keys.length; i++) {
                        _loop_2(i);
                    }
                }
                return [2 /*return*/, modules.trim()];
            });
        });
    };
    // key + "@" + version
    openiap_storage.prototype.installNPMPackage = function (pck) {
        try {
            info("Installing " + pck);
            child_process.execSync("npm install " + pck, { stdio: [0, 1, 2], cwd: this.settings.userDir });
        }
        catch (error) {
            err(new Error("npm install error"));
            if (error.status)
                warn("npm install status: " + error.status);
            if (error.message)
                warn("npm install message: " + error.message);
            if (error.stderr)
                warn("npm install stderr: " + error.stderr);
            if (error.stdout)
                warn("npm install stdout: " + error.stdout);
        }
    };
    openiap_storage.prototype.DiffObjects = function (o1, o2) {
        // choose a map() impl.
        var map = Array.prototype.map ?
            function (a) { return Array.prototype.map.apply(a, Array.prototype.slice.call(arguments, 1)); } :
            function (a, f) {
                var ret = new Array(a.length);
                for (var i = 0, length_1 = a.length; i < length_1; i++)
                    ret[i] = f(a[i], i);
                return ret.concat();
            };
        // shorthand for push impl.
        var push = Array.prototype.push;
        // check for null/undefined values
        if ((o1 == null) || (o2 == null)) {
            if (o1 != o2)
                return [["", "null", o1 != null, o2 != null]];
            return undefined; // both null
        }
        // compare types
        if ((o1.constructor != o2.constructor) ||
            (typeof o1 != typeof o2)) {
            return [["", "type", Object.prototype.toString.call(o1), Object.prototype.toString.call(o2)]]; // different type
        }
        // compare arrays
        if (Object.prototype.toString.call(o1) == "[object Array]") {
            if (o1.length != o2.length) {
                return [["", "length", o1.length, o2.length]]; // different length
            }
            var diff = [];
            var _loop_3 = function (i) {
                // per element nested diff
                var innerDiff = this_1.DiffObjects(o1[i], o2[i]);
                if (innerDiff) { // o1[i] != o2[i]
                    // merge diff array into parent's while including parent object name ([i])
                    push.apply(diff, map(innerDiff, function (o, j) { o[0] = "[" + i + "]" + o[0]; return o; }));
                }
            };
            var this_1 = this;
            for (var i = 0; i < o1.length; i++) {
                _loop_3(i);
            }
            // if any differences were found, return them
            if (diff.length)
                return diff;
            // return nothing if arrays equal
            return undefined;
        }
        // compare object trees
        if (Object.prototype.toString.call(o1) == "[object Object]") {
            var diff = [];
            var _loop_4 = function (prop) {
                if (prop == "nodes")
                    return { value: undefined };
                // the double check in o1 is because in V8 objects remember keys set to undefined 
                if ((typeof o2[prop] == "undefined") && (typeof o1[prop] != "undefined")) {
                    // prop exists in o1 but not in o2
                    diff.push(["[" + prop + "]", "undefined", o1[prop], undefined]); // prop exists in o1 but not in o2
                }
                else {
                    // per element nested diff
                    var innerDiff = this_2.DiffObjects(o1[prop], o2[prop]);
                    if (innerDiff) { // o1[prop] != o2[prop]
                        // merge diff array into parent's while including parent object name ([prop])
                        push.apply(diff, map(innerDiff, function (o, j) { o[0] = "[" + prop + "]" + o[0]; return o; }));
                    }
                }
            };
            var this_2 = this;
            // check all props in o1
            for (var prop in o1) {
                var state_1 = _loop_4(prop);
                if (typeof state_1 === "object")
                    return state_1.value;
            }
            for (var prop in o2) {
                // the double check in o2 is because in V8 objects remember keys set to undefined 
                if ((typeof o1[prop] == "undefined") && (typeof o2[prop] != "undefined")) {
                    // prop exists in o2 but not in o1
                    diff.push(["[" + prop + "]", "undefined", undefined, o2[prop]]); // prop exists in o2 but not in o1
                }
            }
            // if any differences were found, return them
            if (diff.length)
                return diff;
            // return nothing if objects equal
            return undefined;
        }
        // if same type and not null or objects or arrays
        // perform primitive value comparison
        if (o1 != o2)
            return [["", "value", o1, o2]];
        // return nothing if values are equal
        return undefined;
    };
    openiap_storage.prototype.CheckUpdates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldsettings, oldflows, oldcredentials, update, donpm, flows, credentials, settings, _a, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 8, , 9]);
                        oldsettings = null;
                        if (this._settings != null)
                            oldsettings = JSON.parse(JSON.stringify(this._settings));
                        oldflows = null;
                        if (this._flows != null)
                            oldflows = JSON.parse(JSON.stringify(this._flows));
                        oldcredentials = null;
                        if (this._credentials != null)
                            oldcredentials = JSON.parse(JSON.stringify(this._credentials));
                        update = false;
                        donpm = false;
                        return [4 /*yield*/, this._getFlows()];
                    case 1:
                        flows = _b.sent();
                        if (oldflows != null) {
                            if (flows.length != this._flows.length) {
                                update = true;
                            }
                            else {
                                if (this.DiffObjects(flows, oldflows)) {
                                    update = true;
                                }
                            }
                        }
                        else {
                            this._flows = flows;
                        }
                        return [4 /*yield*/, this._getCredentials()];
                    case 2:
                        credentials = _b.sent();
                        if (oldcredentials != null) {
                            if (credentials.length != this._credentials.length) {
                                update = true;
                            }
                            else {
                                if (this.DiffObjects(credentials, oldcredentials)) {
                                    update = true;
                                }
                            }
                        }
                        else {
                            this._credentials = credentials;
                        }
                        return [4 /*yield*/, this.getSettings()];
                    case 3:
                        settings = _b.sent();
                        if (oldsettings != null) {
                            if (this.DiffObjects(settings, oldsettings)) {
                                update = true;
                                donpm = true;
                            }
                        }
                        else {
                            this._settings = settings;
                        }
                        if (!donpm) return [3 /*break*/, 5];
                        this._settings = null;
                        _a = this;
                        return [4 /*yield*/, this.getSettings()];
                    case 4:
                        _a._settings = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!update) return [3 /*break*/, 7];
                        this._flows = flows;
                        this._settings = settings;
                        return [4 /*yield*/, this.RED.nodes.loadFlows(true)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_2 = _b.sent();
                        err(error_2);
                        return [3 /*break*/, 9];
                    case 9:
                        if (this.watchid == "") {
                            setTimeout(this.CheckUpdates.bind(this), 30000);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype.init = function (settings) {
        return __awaiter(this, void 0, void 0, function () {
            var packageFile, defaultPackage;
            return __generator(this, function (_a) {
                this.settings = settings;
                packageFile = path.join(this.settings.userDir, "package.json");
                try {
                    if (!fs.existsSync(this.settings.userDir)) {
                        fs.mkdirSync(this.settings.userDir);
                    }
                    fs.statSync(packageFile);
                    process.chdir(this.settings.userDir);
                    info(packageFile + " exists.");
                }
                catch (err) {
                }
                defaultPackage = {
                    "name": "openflow-project",
                    "license": "MPL-2.0",
                    "description": "A OpenFlow Node-RED Project",
                    "version": "0.0.1",
                    "dependencies": {},
                    "repository": {
                        "type": "git",
                        "url": "git+https://github.com/open-rpa/openflow.git"
                    }
                };
                // Let's not !
                if (!fs.existsSync(packageFile)) {
                    info("creating new packageFile " + packageFile);
                    fs.writeFileSync(packageFile, JSON.stringify(defaultPackage, null, 4));
                }
                // const dbsettings = await this._getSettings();
                // spawn gettings, so it starts installing
                return [2 /*return*/, true];
            });
        });
    };
    openiap_storage.prototype._getnpmrc = function () {
        return __awaiter(this, void 0, void 0, function () {
            var array;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.Query({
                            collectionname: "nodered", query: { _type: "npmrc", "$or": [{ nodered_id: this.nodered_id }, { nodered_id: { "$exists": false } }] }, top: 2
                        })];
                    case 1:
                        array = _a.sent();
                        if (array.length === 0) {
                            return [2 /*return*/, null];
                        }
                        if (array.length > 1) {
                            this.npmrc = array.filter(function (x) { return x.nodered_id === _this.nodered_id; })[0];
                        }
                        else {
                            this.npmrc = array[0];
                        }
                        if (this.npmrc != null) {
                            if (this.npmrc.catalogues && this.npmrc.catalogues.length > 0) {
                                info("using catalogues: " + JSON.stringify(this.npmrc.catalogues));
                            }
                            if (this.npmrc.content != null) {
                                info("set npmrc: \n" + this.npmrc.content);
                            }
                        }
                        return [2 /*return*/, this.npmrc];
                }
            });
        });
    };
    openiap_storage.prototype._setnpmrc = function (npmrc) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        this.npmrc = npmrc;
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "npmrc", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (!(result.length === 0)) return [3 /*break*/, 3];
                        npmrc.name = "npmrc for " + this.nodered_id;
                        npmrc.nodered_id = this.nodered_id;
                        npmrc._type = "npmrc";
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "nodered", item: npmrc })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        npmrc._id = result[0]._id;
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "nodered", item: npmrc })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_3 = _a.sent();
                        err(error_3);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._getFlows = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, array, flows, i, arr;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        result = [];
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "flow", "$or": [{ nodered_id: this.nodered_id }, { shared: true }] }, top: 5 })];
                    case 1:
                        array = _a.sent();
                        if (array.length === 0) {
                            return [2 /*return*/, []];
                        }
                        flows = [];
                        for (i = 0; i < array.length; i++) {
                            this.versions[array[i]._id] = array[i]._version;
                            if (array[i].shared == true) {
                                arr = JSON.parse(array[i].flows);
                                if (!arr[0].env)
                                    arr[0].env = [];
                                arr[0].env = arr[0].env.filter(function (x) { return x.name != "_id"; });
                                arr[0].env.push({ name: '_id', type: 'str', value: array[i]._id });
                                console.log("* subflow id: " + array[i]._id + " version: " + array[i]._version);
                                flows = flows.concat(arr);
                            }
                            else {
                                console.log("* mainflow id: " + array[i]._id + " version: " + array[i]._version);
                                flows = flows.concat(JSON.parse(array[i].flows));
                            }
                        }
                        this._flows = flows;
                        result = this._flows;
                        return [2 /*return*/, result];
                }
            });
        });
    };
    openiap_storage.prototype._saveFlows = function (flows, user) {
        return __awaiter(this, void 0, void 0, function () {
            var mainflow, sharedflows, ids, i, node, _id, i, node, result, item, iresult, uresult, update, keys, i_1, key, arr, node_1, result2, _id, item, iresult, uresult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mainflow = [];
                        sharedflows = {};
                        ids = [];
                        for (i = 0; i < flows.length; i++) {
                            node = flows[i];
                            if (node.type == "tab" || node.type == "subflow") {
                                _id = null;
                                if (node.env)
                                    _id = node.env.filter(function (x) { return x.name == "_id"; });
                                if (node.label && node.label.startsWith("__")) {
                                    ids.push(node.id);
                                    if (!sharedflows[node.id])
                                        sharedflows[node.id] = [];
                                }
                                else if (_id && _id.length > 0) {
                                    ids.push(node.id);
                                    if (!sharedflows[node.id])
                                        sharedflows[node.id] = [];
                                }
                            }
                        }
                        for (i = 0; i < flows.length; i++) {
                            node = flows[i];
                            if (ids.indexOf(node.id) > -1) {
                                sharedflows[node.id].push(node);
                            }
                            else if (node.z && ids.indexOf(node.z) > -1) {
                                sharedflows[node.z].push(node);
                            }
                            else {
                                mainflow.push(node);
                            }
                        }
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "flow", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (!(result.length === 0)) return [3 /*break*/, 3];
                        item = {
                            name: "flows for " + this.nodered_id,
                            flows: JSON.stringify(mainflow), _type: "flow", nodered_id: this.nodered_id
                        };
                        if (user != null) {
                            item.deployedby = user.username;
                            item.deployedbyid = user.sub;
                        }
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "nodered", item: item })];
                    case 2:
                        iresult = _a.sent();
                        this.versions[iresult._id] = iresult._version;
                        return [3 /*break*/, 5];
                    case 3:
                        result[0].flows = JSON.stringify(mainflow);
                        if (user != null) {
                            result[0].deployedby = user.username;
                            result[0].deployedbyid = user.sub;
                        }
                        this.versions[result[0]._id] = result[0]._version + 1;
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "nodered", item: result[0] })];
                    case 4:
                        uresult = _a.sent();
                        this.versions[uresult._id] = uresult._version;
                        _a.label = 5;
                    case 5:
                        update = false;
                        keys = Object.keys(sharedflows);
                        if (!(keys.length > 0)) return [3 /*break*/, 13];
                        console.log("******************************");
                        i_1 = 0;
                        _a.label = 6;
                    case 6:
                        if (!(i_1 < keys.length)) return [3 /*break*/, 13];
                        key = keys[i_1];
                        arr = sharedflows[key];
                        node_1 = arr[0];
                        result2 = [];
                        _id = null;
                        if (node_1.env)
                            _id = node_1.env.filter(function (x) { return x.name == "_id"; });
                        if (!(_id && _id.length > 0)) return [3 /*break*/, 8];
                        console.log("* query id: " + _id[0].value);
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "flow", _id: _id[0].value }, top: 1 })];
                    case 7:
                        result2 = _a.sent();
                        _a.label = 8;
                    case 8:
                        if (!(result2.length === 0)) return [3 /*break*/, 10];
                        update = true;
                        item = {
                            name: "shared flows: " + node_1.label,
                            flows: JSON.stringify(arr), _type: "flow", shared: true
                        };
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "nodered", item: item })];
                    case 9:
                        iresult = _a.sent();
                        if (iresult != null) {
                            this.versions[iresult._id] = iresult._version;
                            console.log("* updated id: " + _id[0].value + " version: " + iresult._version);
                        }
                        else {
                            this.RED.log.error("Failed updating flow!");
                        }
                        return [3 /*break*/, 12];
                    case 10:
                        result2[0].flows = JSON.stringify(arr);
                        result2[0].name = "shared flows: " + node_1.label;
                        this.versions[_id[0].value] = result2[0]._version + 1; // bump version before saving, some times the change stream is faster than UpdateOne
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "nodered", item: result2[0] })];
                    case 11:
                        uresult = _a.sent();
                        if (uresult != null) {
                            this.versions[uresult._id] = uresult._version;
                            console.log("* new id: " + uresult._id + " version: " + uresult._version);
                        }
                        else {
                            this.RED.log.error("Failed adding new flow!");
                        }
                        _a.label = 12;
                    case 12:
                        i_1++;
                        return [3 /*break*/, 6];
                    case 13:
                        if (!(update == true)) return [3 /*break*/, 15];
                        // reload flows to add the _id
                        return [4 /*yield*/, this.RED.nodes.loadFlows(true)];
                    case 14:
                        // reload flows to add the _id
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        this._flows = flows;
                        return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._getCredentials = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cred, result, arr, i, key, value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cred = [];
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "credential", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, []];
                        }
                        cred = result[0].credentials;
                        arr = result[0].credentialsarray;
                        if (arr !== null && arr !== undefined) {
                            cred = {};
                            for (i = 0; i < arr.length; i++) {
                                key = arr[i].key;
                                value = arr[i].value;
                                cred[key] = value;
                            }
                        }
                        this._credentials = cred;
                        return [2 /*return*/, cred];
                }
            });
        });
    };
    openiap_storage.prototype._saveCredentials = function (credentials, user) {
        return __awaiter(this, void 0, void 0, function () {
            var credentialsarray, result, orgkeys, i, key, value, obj, item, subresult, item, subresult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        credentialsarray = [];
                        result = [];
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "credential", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        orgkeys = Object.keys(credentials);
                        for (i = 0; i < orgkeys.length; i++) {
                            key = orgkeys[i];
                            value = credentials[key];
                            obj = { key: key, value: value };
                            credentialsarray.push(obj);
                        }
                        if (!credentials) return [3 /*break*/, 6];
                        if (!(result != null && result.length === 0)) return [3 /*break*/, 3];
                        item = {
                            name: "credentials for " + this.nodered_id,
                            credentials: credentials, credentialsarray: credentialsarray, _type: "credential", nodered_id: this.nodered_id,
                            _encrypt: ["credentials", "credentialsarray"]
                        };
                        if (user != null) {
                            item.deployedby = user.username;
                            item.deployedbyid = user.sub;
                        }
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "nodered", item: item })];
                    case 2:
                        subresult = _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        item = result[0];
                        item.credentials = credentials;
                        item.credentialsarray = credentialsarray;
                        item._encrypt = ["credentials", "credentialsarray"];
                        if (user != null) {
                            item.deployedby = user.username;
                            item.deployedbyid = user.sub;
                        }
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "nodered", item: item })];
                    case 4:
                        subresult = _a.sent();
                        _a.label = 5;
                    case 5:
                        this._credentials = credentials;
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._getSettings = function () {
        return __awaiter(this, void 0, void 0, function () {
            var settings, result, npmrc, npmrcFile, HTTP_PROXY, HTTPS_PROXY, NO_PROXY, npmrc_1, modules, hadErrors, arr, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        settings = null;
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "setting", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, {}];
                        }
                        this.versions[result[0]._id] = result[0]._version;
                        settings = JSON.parse(result[0].settings);
                        return [4 /*yield*/, this._getnpmrc()];
                    case 2:
                        npmrc = _a.sent();
                        npmrcFile = path.join(this.settings.userDir, ".npmrc");
                        HTTP_PROXY = process.env.HTTP_PROXY;
                        HTTPS_PROXY = process.env.HTTPS_PROXY;
                        NO_PROXY = process.env.NO_PROXY;
                        if (HTTP_PROXY == null || HTTP_PROXY == "" || HTTP_PROXY == "undefined" || HTTP_PROXY == "null")
                            HTTP_PROXY = "";
                        if (HTTPS_PROXY == null || HTTPS_PROXY == "" || HTTPS_PROXY == "undefined" || HTTPS_PROXY == "null")
                            HTTPS_PROXY = "";
                        if (NO_PROXY == null || NO_PROXY == "" || NO_PROXY == "undefined" || NO_PROXY == "null")
                            NO_PROXY = "";
                        if (npmrc != null && npmrc.content != null) {
                            fs.writeFileSync(npmrcFile, npmrc.content);
                        }
                        else if (HTTP_PROXY != "" || HTTPS_PROXY != "") {
                            npmrc_1 = new noderednpmrc();
                            npmrc_1.content = "proxy=" + HTTP_PROXY + "\n" + "https-proxy=" + HTTPS_PROXY;
                            if (NO_PROXY != "") {
                                npmrc_1.content += "\n" + "noproxy=" + NO_PROXY;
                            }
                            npmrc_1.content += "\n" + "registry=http://registry.npmjs.org/";
                            fs.writeFileSync(npmrcFile, npmrc_1.content);
                        }
                        else {
                            if (fs.existsSync(npmrcFile)) {
                                fs.unlinkSync(npmrcFile);
                            }
                        }
                        if (!(settings == null)) return [3 /*break*/, 3];
                        settings = {};
                        return [3 /*break*/, 10];
                    case 3:
                        if (!(this._settings == null)) return [3 /*break*/, 9];
                        this._settings = settings;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, , 9]);
                        return [4 /*yield*/, this.GetMissingModules(settings)];
                    case 5:
                        modules = _a.sent();
                        if (!(modules != null)) return [3 /*break*/, 7];
                        hadErrors = false;
                        try {
                            this.installNPMPackage(modules);
                            hadErrors = false;
                        }
                        catch (error) {
                            hadErrors = true;
                        }
                        if (!hadErrors) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.GetMissingModules(settings)];
                    case 6:
                        modules = _a.sent();
                        arr = modules.split(" ");
                        arr.forEach(function (pck) {
                            try {
                                _this.installNPMPackage(pck);
                            }
                            catch (error) {
                            }
                        });
                        _a.label = 7;
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        error_4 = _a.sent();
                        err(error_4);
                        settings = {};
                        return [3 /*break*/, 9];
                    case 9:
                        this._settings = settings;
                        _a.label = 10;
                    case 10: return [2 /*return*/, settings];
                }
            });
        });
    };
    openiap_storage.prototype.onupdate = function (operation, document) {
        return __awaiter(this, void 0, void 0, function () {
            var update, cred, arr, i, key, value, oldsettings, exitprocess, newsettings, keys, i, key, val, version, oldversion, result, error_5, message, i, key, val, version, oldversion, result, result, error_6, message, error_7, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 29, , 30]);
                        if (this.bussy) {
                            return [2 /*return*/];
                        }
                        update = false;
                        info(document._type + " - " + new Date().toLocaleTimeString());
                        if (document._type != "setting" && document._type != "flow" && document._type != "credential") {
                            info(document._type + " - skipped " + new Date().toLocaleTimeString());
                            return [2 /*return*/];
                        }
                        if (!(document._type == "flow")) return [3 /*break*/, 1];
                        if (!document.shared && document.nodered_id != this.nodered_id)
                            return [2 /*return*/];
                        if (this.versions[document._id] && this.versions[document._id] == document._version && operation != "delete") {
                            info(document._type + ", skip " + document._id + " is same version " + document._version);
                            return [2 /*return*/];
                        }
                        else {
                            info(document._type + ", " + document._id + " got " + document._version + " up from " + this.versions[document._id]);
                        }
                        update = true;
                        return [3 /*break*/, 25];
                    case 1:
                        if (!(document._type == "credential")) return [3 /*break*/, 2];
                        if (!document.shared && document.nodered_id != this.nodered_id)
                            return [2 /*return*/];
                        if (operation == "delete") {
                            return [2 /*return*/];
                        }
                        if (this._credentials != null) {
                            cred = document.credentials;
                            arr = document.credentialsarray;
                            if (arr !== null && arr !== undefined) {
                                cred = {};
                                for (i = 0; i < arr.length; i++) {
                                    key = arr[i].key;
                                    value = arr[i].value;
                                    cred[key] = value;
                                }
                            }
                            if (this.DiffObjects(this._credentials, cred)) {
                                update = true;
                            }
                        }
                        return [3 /*break*/, 25];
                    case 2:
                        if (!(document._type == "setting")) return [3 /*break*/, 25];
                        if (!document.shared && document.nodered_id != this.nodered_id)
                            return [2 /*return*/];
                        if (this.versions[document._id] && this.versions[document._id] == document._version && operation != "delete") {
                            info(document._type + ", skip " + document._id + " is same version " + document._version);
                            return [2 /*return*/];
                        }
                        else {
                            info(document._type + ", " + document._id + " got " + document._version + " up from " + this.versions[document._id]);
                        }
                        oldsettings = null;
                        exitprocess = false;
                        if (!(this._settings != null)) return [3 /*break*/, 24];
                        this.bussy = true;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 22, , 23]);
                        info("parse settings " + new Date().toLocaleTimeString());
                        oldsettings = JSON.parse(JSON.stringify(this._settings));
                        newsettings = document.settings;
                        newsettings = JSON.parse(newsettings);
                        info("parse oldsettings " + new Date().toLocaleTimeString());
                        keys = Object.keys(oldsettings.nodes);
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < keys.length)) return [3 /*break*/, 12];
                        key = keys[i];
                        info("key " + key + " " + new Date().toLocaleTimeString());
                        if (!(key != "node-red")) return [3 /*break*/, 11];
                        val = oldsettings.nodes[key];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 10, , 11]);
                        version = val.version;
                        if (val != null && val.pending_version) {
                            version = val.pending_version;
                        }
                        oldversion = null;
                        if (oldsettings != null && oldsettings.nodes[key] != null) {
                            oldversion = oldsettings.nodes[key].version;
                            if (oldsettings.nodes[key].pending_version) {
                                oldversion = oldsettings.nodes[key].pending_version;
                            }
                        }
                        if (!(newsettings.nodes[key] == null)) return [3 /*break*/, 7];
                        info("Remove module " + key + "@" + version);
                        this.RED.log.warn("Remove module " + key + "@" + version);
                        return [4 /*yield*/, this.RED.runtime.nodes.removeModule({ user: "admin", module: key, version: version })];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 7:
                        if (!(version != oldversion)) return [3 /*break*/, 9];
                        info("Install module " + key + "@" + version + " up from " + oldversion);
                        this.RED.log.warn("Install module " + key + "@" + version + " up from " + oldversion);
                        return [4 /*yield*/, this.RED.runtime.nodes.addModule({ user: "admin", module: key, version: version })];
                    case 8:
                        result = _a.sent();
                        if (result != null && result.pending_version != null && result.pending_version != result.version) {
                            info(key + " now has pending_version " + result.pending_version + " request process exit");
                            this.RED.log.warn(key + " now has pending_version " + result.pending_version + " request process exit");
                            exitprocess = true;
                        }
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_5 = _a.sent();
                        message = (error_5.message ? error_5.message : error_5);
                        err(error_5);
                        if (message == "Uninstall failed") {
                            info("Uninstall failed, request process exit");
                            this.RED.log.error("Uninstall failed, request process exit");
                            exitprocess = true;
                        }
                        if (message == "Install failed") {
                            info("Install failed, request process exit");
                            this.RED.log.error("Install failed, request process exit");
                            exitprocess = true;
                        }
                        if (message == "Module already loaded") {
                            // info("Install failed, Module already loaded");
                        }
                        return [3 /*break*/, 11];
                    case 11:
                        i++;
                        return [3 /*break*/, 4];
                    case 12:
                        info("parse newsettings " + new Date().toLocaleTimeString());
                        keys = Object.keys(newsettings.nodes);
                        i = 0;
                        _a.label = 13;
                    case 13:
                        if (!(i < keys.length)) return [3 /*break*/, 21];
                        key = keys[i];
                        if (!(key != "node-red")) return [3 /*break*/, 20];
                        val = newsettings.nodes[key];
                        if (val == null) {
                            info("val == null at " + key + " ???");
                            return [3 /*break*/, 20];
                        }
                        version = val.version;
                        if (val.pending_version) {
                            version = val.pending_version;
                        }
                        oldversion = null;
                        if (oldsettings != null && oldsettings.nodes[key] != null) {
                            oldversion = oldsettings.nodes[key].version;
                            if (oldsettings.nodes[key].pending_version) {
                                oldversion = oldsettings.nodes[key].pending_version;
                            }
                        }
                        _a.label = 14;
                    case 14:
                        _a.trys.push([14, 19, , 20]);
                        if (!(oldsettings.nodes[key] == null)) return [3 /*break*/, 16];
                        info("Install new module " + key + "@" + version);
                        this.RED.log.warn("Install new module " + key + "@" + version);
                        return [4 /*yield*/, this.RED.runtime.nodes.addModule({ user: "admin", module: key, version: version })];
                    case 15:
                        result = _a.sent();
                        if (result != null && result.pending_version != null && result.pending_version != result.version) {
                            info(key + " now has pending_version " + result.pending_version + " request process exit");
                            this.RED.log.warn(key + " now has pending_version " + result.pending_version + " request process exit");
                            exitprocess = true;
                        }
                        return [3 /*break*/, 18];
                    case 16:
                        if (!(version != oldversion)) return [3 /*break*/, 18];
                        info("Install module " + key + "@" + version + " up from " + oldversion);
                        this.RED.log.warn("Install module " + key + "@" + version + " up from " + oldversion);
                        return [4 /*yield*/, this.RED.runtime.nodes.addModule({ user: "admin", module: key, version: version })];
                    case 17:
                        result = _a.sent();
                        if (result != null && result.pending_version != null && result.pending_version != result.version) {
                            info(key + " now has pending_version " + result.pending_version + " request process exit");
                            this.RED.log.warn(key + " now has pending_version " + result.pending_version + " request process exit");
                            exitprocess = true;
                        }
                        _a.label = 18;
                    case 18: return [3 /*break*/, 20];
                    case 19:
                        error_6 = _a.sent();
                        message = (error_6.message ? error_6.message : error_6);
                        err(error_6);
                        if (message == "Uninstall failed") {
                            info("Uninstall failed, request process exit");
                            this.RED.log.error("Uninstall failed, request process exit");
                            exitprocess = true;
                        }
                        if (message == "Install failed") {
                            info("Install failed, request process exit");
                            this.RED.log.error("Install failed, request process exit");
                            exitprocess = true;
                        }
                        if (message == "Module already loaded") {
                            // info("Install failed, Module already loaded");
                        }
                        return [3 /*break*/, 20];
                    case 20:
                        i++;
                        return [3 /*break*/, 13];
                    case 21:
                        info("noderedcontribopenflowstorage::onupdate DiffObjects " + new Date().toLocaleTimeString());
                        if (this.DiffObjects(newsettings, oldsettings)) {
                            update = true;
                        }
                        this._settings = newsettings;
                        return [3 /*break*/, 23];
                    case 22:
                        error_7 = _a.sent();
                        err(error_7);
                        return [3 /*break*/, 23];
                    case 23:
                        this.bussy = false;
                        _a.label = 24;
                    case 24:
                        info("check for exit exitprocess: " + exitprocess + " update: " + update + " " + new Date().toLocaleTimeString());
                        if (exitprocess) {
                            info("Running as docker, just quit process, kubernetes will start a new version");
                            this.RED.log.warn("noderedcontribopenflowstorage::onupdate: Running as docker, just quit process, kubernetes will start a new version");
                            process.exit(1);
                        }
                        else if (!exitprocess) {
                            info("Restart not needed");
                            // this.RED.log.warn("noderedcontribopenflowstorage::onupdate: Restart not needed");
                        }
                        _a.label = 25;
                    case 25:
                        if (!(update == true)) return [3 /*break*/, 27];
                        info("**************************************************");
                        info("* " + document._type + " was updated, reloading NodeRED flows");
                        info("**************************************************");
                        this.RED.log.warn("Reloading flows");
                        return [4 /*yield*/, this.RED.nodes.loadFlows(true)];
                    case 26:
                        _a.sent();
                        return [3 /*break*/, 28];
                    case 27:
                        info(document._type + " - COMPLETE !! " + new Date().toLocaleTimeString());
                        _a.label = 28;
                    case 28: return [3 /*break*/, 30];
                    case 29:
                        error_8 = _a.sent();
                        err(error_8);
                        return [3 /*break*/, 30];
                    case 30: return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._saveSettings = function (settings, user) {
        return __awaiter(this, void 0, void 0, function () {
            var filename, result, item_1, iresult, item, uresult, exitprocess, keys, i, key, val;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        info(new Date().toLocaleTimeString());
                        filename = this.nodered_id + "_settings";
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "setting", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (!(result.length === 0)) return [3 /*break*/, 3];
                        item_1 = {
                            name: "settings for " + this.nodered_id,
                            settings: JSON.stringify(settings), _type: "setting", nodered_id: this.nodered_id
                        };
                        if (user != null) {
                            item_1.deployedby = user.username;
                            item_1.deployedbyid = user.sub;
                        }
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "nodered", item: item_1 })];
                    case 2:
                        iresult = _a.sent();
                        if (iresult != null)
                            this.versions[iresult._id] = iresult._version;
                        return [3 /*break*/, 5];
                    case 3:
                        item = JSON.parse(JSON.stringify(result[0]));
                        item.settings = JSON.stringify(settings);
                        if (user != null) {
                            item.deployedby = user.username;
                            item.deployedbyid = user.sub;
                        }
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "nodered", item: item })];
                    case 4:
                        uresult = _a.sent();
                        if (uresult != null)
                            this.versions[uresult._id] = uresult._version;
                        _a.label = 5;
                    case 5:
                        this._settings = settings;
                        exitprocess = false;
                        keys = Object.keys(settings.nodes);
                        for (i = 0; i < keys.length; i++) {
                            key = keys[i];
                            if (key != "node-red") {
                                val = settings.nodes[key];
                                if (val == null) {
                                    info("key " + key + " is null ? ");
                                    continue;
                                }
                                else if (val.pending_version) {
                                    info("key " + key + " has a pending_version " + val.pending_version);
                                    exitprocess = true;
                                }
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._getSessions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var item, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = [];
                        return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "session", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, []];
                        }
                        item = JSON.parse(result[0].sessions);
                        return [2 /*return*/, item];
                }
            });
        });
    };
    openiap_storage.prototype._saveSessions = function (sessions) {
        return __awaiter(this, void 0, void 0, function () {
            var result, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "session", nodered_id: this.nodered_id }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (!(result.length === 0)) return [3 /*break*/, 3];
                        item = {
                            name: "sessions for " + this.nodered_id,
                            sessions: JSON.stringify(sessions), _type: "session", nodered_id: this.nodered_id
                        };
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "nodered", item: item })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        result[0].sessions = JSON.stringify(sessions);
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "nodered", item: result[0] })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._saveLibraryEntry = function (type, path, meta, body) {
        return __awaiter(this, void 0, void 0, function () {
            var item, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        item = { type: type, path: path, meta: meta, body: body, _type: "library", nodered_id: this.nodered_id };
                        return [4 /*yield*/, this.client.InsertOrUpdateOne({ collectionname: "nodered", item: item, uniqeness: "_type,nodered_id,type,path" })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    openiap_storage.prototype._getLibraryEntry = function (type, path) {
        return __awaiter(this, void 0, void 0, function () {
            var result, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.Query({ collectionname: "nodered", query: { _type: "library", nodered_id: this.nodered_id, type: type, path: path }, top: 1 })];
                    case 1:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, null];
                        }
                        item = JSON.parse(result[0].sessions);
                        return [2 /*return*/, item.body];
                }
            });
        });
    };
    return openiap_storage;
}());
exports.openiap_storage = openiap_storage;
//# sourceMappingURL=openiap_storage.js.map