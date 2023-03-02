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
exports.deleteworkitem = exports.popworkitem = exports.updateworkitem = exports.addworkitems = exports.addworkitem = exports.workitemqueue_config = void 0;
var RED = require("node-red");
var Util_1 = require("./Util");
var pako = require('pako');
var fs = require('fs');
var path = require("path");
var workitemqueue_config = /** @class */ (function () {
    function workitemqueue_config(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.wiq = "";
        this.wiqid = "";
        RED.nodes.createNode(this, config);
        this.node = this;
        this.credentials = this.node.credentials;
        if (this.node.credentials && this.node.credentials.hasOwnProperty("wiq")) {
            this.wiq = this.node.credentials.wiq;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("wiqid")) {
            this.wiqid = this.node.credentials.wiqid;
        }
        this.name = (config.name || this.wiq) || this.wiqid;
    }
    return workitemqueue_config;
}());
exports.workitemqueue_config = workitemqueue_config;
var addworkitem = /** @class */ (function () {
    function addworkitem(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null)
                this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    addworkitem.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var payload, files, topic, nextrun, wipriority, success_wiq, failed_wiq, _a, wiq, wiqid, i, file, result, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "payload")];
                    case 1:
                        payload = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "files")];
                    case 2:
                        files = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "topic")];
                    case 3:
                        topic = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "nextrun")];
                    case 4:
                        nextrun = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "priority")];
                    case 5:
                        wipriority = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "success_wiq")];
                    case 6:
                        success_wiq = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "failed_wiq")];
                    case 7:
                        failed_wiq = _b.sent();
                        _a = this.workitemqueue_config, wiq = _a.wiq, wiqid = _a.wiqid;
                        if (!Util_1.Util.IsNullUndefinded(files)) {
                            for (i = 0; i < files.length; i++) {
                                file = files[i];
                                if (file.file && (Array.isArray(file.file) || Buffer.isBuffer(file.file))) {
                                    if (Util_1.Util.IsNullEmpty(file.filename))
                                        throw new Error("filename is mandatory for each file");
                                    file.compressed = true;
                                    file.file = Buffer.from(pako.deflate(file.file));
                                }
                                else if (!Util_1.Util.IsNullEmpty(file.filename)) {
                                    if (fs.existsSync(file.filename)) {
                                        file.compressed = true;
                                        file.file = Buffer.from(pako.deflate(fs.readFileSync(file.filename, null)));
                                        file.filename = path.basename(file.filename);
                                    }
                                    else {
                                        throw new Error("File not found " + file.filename);
                                    }
                                }
                            }
                        }
                        return [4 /*yield*/, this.client.PushWorkitem({ payload: payload, files: files, wiqid: wiqid, wiq: wiq, name: topic, nextrun: nextrun, priority: wipriority, success_wiq: success_wiq, failed_wiq: failed_wiq })];
                    case 8:
                        result = _b.sent();
                        if (!Util_1.Util.IsNullEmpty(this.config.payload)) {
                            Util_1.Util.SetMessageProperty(msg, this.config.payload, result);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 10];
                    case 9:
                        error_1 = _b.sent();
                        Util_1.Util.HandleError(this, error_1, msg);
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    addworkitem.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, null);
                }
                if (done != null)
                    done();
                return [2 /*return*/];
            });
        });
    };
    return addworkitem;
}());
exports.addworkitem = addworkitem;
var addworkitems = /** @class */ (function () {
    function addworkitems(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null)
                this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    addworkitems.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var items, nextrun_1, wipriority_1, success_wiq, failed_wiq, _a, wiq, wiqid, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 7, , 8]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "workitems")];
                    case 1:
                        items = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "nextrun")];
                    case 2:
                        nextrun_1 = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "priority")];
                    case 3:
                        wipriority_1 = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "success_wiq")];
                    case 4:
                        success_wiq = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "failed_wiq")];
                    case 5:
                        failed_wiq = _b.sent();
                        _a = this.workitemqueue_config, wiq = _a.wiq, wiqid = _a.wiqid;
                        if (!Array.isArray(items))
                            throw new Error("workitems must be an array of Workitems");
                        items.forEach(function (item) {
                            if (!Util_1.Util.IsNullEmpty(nextrun_1))
                                item.nextrun = nextrun_1;
                            if (!Util_1.Util.IsNullEmpty(wipriority_1))
                                item.priority = wipriority_1;
                            if (!Util_1.Util.IsNullUndefinded(item.files)) {
                                for (var i = 0; i < item.files.length; i++) {
                                    var file = item.files[i];
                                    if (file.file && Array.isArray(file.file)) {
                                        file.compressed = true;
                                        file.file = Buffer.from(pako.deflate(file.file));
                                    }
                                    else if (Util_1.Util.IsNullEmpty(file.filename)) {
                                        if (fs.existsSync(file.filename)) {
                                            file.compressed = true;
                                            file.file = Buffer.from(pako.deflate(fs.readFileSync(file.filename, null)));
                                            file.filename = path.basename(file.filename);
                                        }
                                    }
                                }
                            }
                        });
                        return [4 /*yield*/, this.client.PushWorkitems({ items: items, wiqid: wiqid, wiq: wiq, success_wiq: success_wiq, failed_wiq: failed_wiq })];
                    case 6:
                        _b.sent();
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _b.sent();
                        Util_1.Util.HandleError(this, error_2, msg);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    addworkitems.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, null);
                }
                if (done != null)
                    done();
                return [2 /*return*/];
            });
        });
    };
    return addworkitems;
}());
exports.addworkitems = addworkitems;
var updateworkitem = /** @class */ (function () {
    function updateworkitem(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    updateworkitem.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var workitem_1, files, state, wipriority, _errormessage, ignoremaxretries, success_wiq, failed_wiq, _nextrun, nextrun, errorsource, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 11, , 12]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "workitem")];
                    case 1:
                        workitem_1 = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "files")];
                    case 2:
                        files = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "state")];
                    case 3:
                        state = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "priority")];
                    case 4:
                        wipriority = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "error")];
                    case 5:
                        _errormessage = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "ignoremaxretries")];
                    case 6:
                        ignoremaxretries = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "success_wiq")];
                    case 7:
                        success_wiq = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "failed_wiq")];
                    case 8:
                        failed_wiq = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "nextrun")];
                    case 9:
                        _nextrun = _a.sent();
                        nextrun = undefined;
                        try {
                            if (!Util_1.Util.IsNullEmpty(_nextrun))
                                nextrun = new Date(_nextrun);
                        }
                        catch (error) {
                            nextrun = undefined;
                        }
                        errorsource = "";
                        if (!Util_1.Util.IsNullEmpty(msg.error) && (Util_1.Util.IsNullUndefinded(workitem_1) || Util_1.Util.IsNullEmpty(workitem_1._id))) {
                            this.node.status({ fill: "blue", shape: "dot", text: "Ignore missing workitem" });
                            return [2 /*return*/];
                        }
                        // let { _id, name, payload, errortype, errormessage } = workitem;
                        if (!Util_1.Util.IsNullEmpty(_errormessage) && Util_1.Util.IsNullEmpty(workitem_1.errormessage)) {
                            workitem_1.errormessage = _errormessage.toString();
                        }
                        if (!Util_1.Util.IsNullEmpty(this.config.state)) {
                            workitem_1.state = this.config.state;
                        }
                        if (wipriority > 0 && workitem_1.priority == 0) {
                            workitem_1.priority = wipriority;
                        }
                        if (!Util_1.Util.IsNullEmpty(success_wiq)) {
                            workitem_1.success_wiq = success_wiq;
                        }
                        if (!Util_1.Util.IsNullEmpty(failed_wiq)) {
                            workitem_1.failed_wiq = failed_wiq;
                        }
                        if (!Util_1.Util.IsNullEmpty(nextrun)) {
                            workitem_1.nextrun = nextrun;
                        }
                        if (files != null && files.length > 0) {
                            if (workitem_1.files == null)
                                workitem_1.files = [];
                            files.forEach(function (file) {
                                workitem_1.files.push(file);
                            });
                        }
                        return [4 /*yield*/, this.client.UpdateWorkitem({ workitem: workitem_1, ignoremaxretries: ignoremaxretries })];
                    case 10:
                        result = _a.sent();
                        if (!Util_1.Util.IsNullEmpty(this.config.workitem)) {
                            Util_1.Util.SetMessageProperty(msg, this.config.workitem, result);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 12];
                    case 11:
                        error_3 = _a.sent();
                        Util_1.Util.HandleError(this, error_3, msg);
                        return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    updateworkitem.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, null);
                }
                if (done != null)
                    done();
                return [2 /*return*/];
            });
        });
    };
    return updateworkitem;
}());
exports.updateworkitem = updateworkitem;
var popworkitem = /** @class */ (function () {
    function popworkitem(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null)
                this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    popworkitem.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, wiq, wiqid, download, result, files, i, file, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        _a = this.workitemqueue_config, wiq = _a.wiq, wiqid = _a.wiqid;
                        download = this.config.download;
                        if (Util_1.Util.IsNullEmpty(download))
                            download = false;
                        return [4 /*yield*/, this.client.PopWorkitem({ wiqid: wiqid, wiq: wiq, includefiles: download, compressed: false })];
                    case 1:
                        result = _b.sent();
                        files = null;
                        if (result != null) {
                            files = [];
                            if (download && result.files && result.files.length > 0) {
                                for (i = 0; i < result.files.length; i++) {
                                    file = result.files[i];
                                    if (!Util_1.Util.IsNullEmpty(file._id)) {
                                        files.push(file);
                                        // var down = await this.client.GetFile({ id: file._id, compress: true });
                                        // // (file as any).file = Buffer.from(down.file, 'base64');
                                        // var data = Buffer.from(down.file, 'base64');
                                        // (file as any).file = Buffer.from(pako.inflate(data));
                                        // files.push(file);
                                    }
                                }
                            }
                            if (!Util_1.Util.IsNullEmpty(this.config.workitem)) {
                                Util_1.Util.SetMessageProperty(msg, this.config.workitem, result);
                            }
                            if (!Util_1.Util.IsNullEmpty(this.config.files) && result) {
                                Util_1.Util.SetMessageProperty(msg, this.config.files, files);
                            }
                            this.node.send(msg);
                            this.node.status({ fill: "green", shape: "dot", text: "successfully popped a Workitem" });
                        }
                        else {
                            this.node.send([null, msg]);
                            this.node.status({ fill: "green", shape: "dot", text: "No more workitems" });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        Util_1.Util.HandleError(this, error_4, msg);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    popworkitem.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, null);
                }
                if (done != null)
                    done();
                return [2 /*return*/];
            });
        });
    };
    return popworkitem;
}());
exports.popworkitem = popworkitem;
var deleteworkitem = /** @class */ (function () {
    function deleteworkitem(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null)
                this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    deleteworkitem.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var workitem, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "workitem")];
                    case 1:
                        workitem = _a.sent();
                        if (!(!Util_1.Util.IsNullUndefinded(workitem) && !Util_1.Util.IsNullEmpty(workitem._id))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client.DeleteWorkitem({ _id: workitem._id })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3: throw new Error("workitem missing, or workitem is missing _id");
                    case 4:
                        this.node.send(msg);
                        return [3 /*break*/, 6];
                    case 5:
                        error_5 = _a.sent();
                        Util_1.Util.HandleError(this, error_5, msg);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    deleteworkitem.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, null);
                }
                if (done != null)
                    done();
                return [2 /*return*/];
            });
        });
    };
    return deleteworkitem;
}());
exports.deleteworkitem = deleteworkitem;
//# sourceMappingURL=workitem_nodes.js.map