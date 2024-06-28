"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpa_killworkflows_node = exports.rpa_workflow_node = exports.rpa_detector_node = void 0;
exports.get_rpa_detectors = get_rpa_detectors;
exports.get_rpa_robots_roles = get_rpa_robots_roles;
exports.get_rpa_robots = get_rpa_robots;
exports.get_rpa_workflows = get_rpa_workflows;
var nodeapi_1 = require("@openiap/nodeapi");
var nodeapi_2 = require("@openiap/nodeapi");
var info = nodeapi_2.config.info, warn = nodeapi_2.config.warn, err = nodeapi_2.config.err;
var RED = require("node-red");
var Util_1 = require("./Util");
var Logger_1 = require("../Logger");
var rpa_detector_node = /** @class */ (function () {
    function rpa_detector_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        this.detector = null;
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            this.node = this;
            this.name = config.name;
            this.node.status({});
            this.node.on("close", this.onclose);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
                this.connect();
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    rpa_detector_node.prototype.onsignedin = function () {
        this.connect();
    };
    rpa_detector_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    rpa_detector_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, _a, _b, error_1;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        return [4 /*yield*/, this.client.Query({
                                collectionname: 'openrpa', query: { _type: "detector", _id: this.config.queue },
                                top: 1
                            })];
                    case 1:
                        result = _c.sent();
                        if (result.length == 0) {
                            this.node.status({ fill: "red", shape: "dot", text: "Failed locating detector" });
                            return [2 /*return*/];
                        }
                        this.detector = result[0];
                        if (!(this.detector.detectortype == "exchange")) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterExchange({
                                exchangename: this.config.queue, algorithm: "fanout"
                            }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 2:
                        _a.localqueue = _c.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "Connected as exchange" });
                        return [3 /*break*/, 5];
                    case 3:
                        _b = this;
                        return [4 /*yield*/, this.client.RegisterQueue({
                                queuename: this.config.queue
                            }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 4:
                        _b.localqueue = _c.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "Connected as queue" });
                        _c.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_1 = _c.sent();
                        this.localqueue = "";
                        Util_1.Util.HandleError(this, error_1, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    rpa_detector_node.prototype.OnMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var _msgid, result;
            return __generator(this, function (_a) {
                try {
                    _msgid = Util_1.Util.GetUniqueIdentifier();
                    result = {
                        _msgid: _msgid,
                        payload: payload,
                        jwt: jwt,
                        user: user
                    };
                    this.node.send(result);
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, msg);
                }
                return [2 /*return*/];
            });
        });
    };
    rpa_detector_node.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!Util_1.Util.IsNullEmpty(this.localqueue)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.UnRegisterQueue({ queuename: this.localqueue })];
                    case 1:
                        _a.sent();
                        this.localqueue = "";
                        _a.label = 2;
                    case 2:
                        this.client.removeListener("onsignedin", this._onsignedin);
                        this.client.removeListener("onclose", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    return rpa_detector_node;
}());
exports.rpa_detector_node = rpa_detector_node;
var rpa_workflow_node = /** @class */ (function () {
    function rpa_workflow_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
        try {
            this.node = this;
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            // this.uid = Util.GetUniqueIdentifier();
            this.node.status({});
            this.name = config.name;
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
                this.connect();
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    rpa_workflow_node.prototype.onsignedin = function () {
        this.connect();
    };
    rpa_workflow_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    rpa_workflow_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        // this.localqueue = this.uid;
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterQueue({
                                queuename: this.config.queuename
                            }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 1:
                        // this.localqueue = this.uid;
                        _a.localqueue = _b.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        this.localqueue = "";
                        Util_1.Util.HandleError(this, error_2, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    rpa_workflow_node.prototype.OnMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var result, correlationId, command;
            return __generator(this, function (_a) {
                try {
                    result = { payload: payload, user: user, jwt: jwt };
                    correlationId = msg.correlationId;
                    command = payload.command;
                    if (correlationId != null && rpa_workflow_node.messages[correlationId] != null) {
                        result = __assign({}, rpa_workflow_node.messages[correlationId]);
                        if (command == "invokecompleted" || command == "invokefailed" || command == "invokeaborted" || command == "error" || command == "timeout") {
                            delete rpa_workflow_node.messages[correlationId];
                        }
                    }
                    if (!Util_1.Util.IsNullEmpty(command) && command.indexOf("invoke") > -1)
                        command = command.substring(6);
                    result.command = command;
                    // result._msgid = Util.GetUniqueIdentifier();
                    if (command == "completed") {
                        if (result.payload == null) {
                            result.payload = {};
                        }
                        if (payload.data == null) {
                            payload.data = {};
                        }
                        result.payload = Object.assign(result.payload, payload.data);
                        this.node.status({ fill: "green", shape: "dot", text: command + "  " + this.localqueue });
                        result.id = correlationId;
                        this.node.send([result, result]);
                    }
                    else if (command == "failed" || command == "aborted" || command == "error" || command == "timeout") {
                        result.error = payload;
                        if (command == "timeout") {
                            result.error = "request timed out, no robot picked up the message in a timely fashion";
                        }
                        if (result.error != null && result.error.Message != null && result.error.Message != "") {
                            result.error = result.error.Message;
                        }
                        if (result.payload == null || result.payload == undefined) {
                            result.payload = {};
                        }
                        this.node.status({ fill: "red", shape: "dot", text: command + "  " + this.localqueue });
                        result.id = correlationId;
                        this.node.send([null, result, result]);
                    }
                    else {
                        if (command != "output")
                            this.node.status({ fill: "blue", shape: "dot", text: command + "  " + this.localqueue });
                        if (result.payload == null || result.payload == undefined) {
                            result.payload = {};
                        }
                        result.id = correlationId;
                        this.node.send([null, result]);
                    }
                }
                catch (error) {
                    this.node.status({});
                    Util_1.Util.HandleError(this, error, msg);
                }
                return [2 /*return*/];
            });
        });
    };
    rpa_workflow_node.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var logmsg;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                logmsg = (_a = Logger_1.Logger.log_message) === null || _a === void 0 ? void 0 : _a.log_messages[msg._msgid];
                nodeapi_1.apiinstrumentation.With("api invoke rpa", logmsg === null || logmsg === void 0 ? void 0 : logmsg.traceId, logmsg === null || logmsg === void 0 ? void 0 : logmsg.spanId, undefined, function (span) { return __awaiter(_this, void 0, void 0, function () {
                    var queue, workflowid, killexisting, killallexisting, priority, correlationId, rpacommand, expiration, error_3;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, 3, 4]);
                                this.node.status({});
                                if (this.client == null || !this.client.signedin) {
                                    throw new Error("Not connected to openflow");
                                }
                                if (Util_1.Util.IsNullEmpty(this.localqueue)) {
                                    throw new Error("Queue not registered yet");
                                }
                                queue = this.config.queue;
                                workflowid = this.config.workflow;
                                killexisting = this.config.killexisting;
                                killallexisting = this.config.killallexisting;
                                priority = 1;
                                if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                                    priority = msg.priority;
                                }
                                if (queue == "none")
                                    queue = "";
                                if (queue == "from msg.targetid")
                                    queue = "";
                                if (workflowid == "none")
                                    workflowid = "";
                                if (workflowid == "from msg.workflowid")
                                    workflowid = "";
                                if (Util_1.Util.IsNullEmpty(queue) && !Util_1.Util.IsNullEmpty(msg.targetid)) {
                                    queue = msg.targetid;
                                }
                                if (Util_1.Util.IsNullEmpty(workflowid) && !Util_1.Util.IsNullEmpty(msg.workflowid)) {
                                    workflowid = msg.workflowid;
                                }
                                if (!Util_1.Util.IsNullEmpty(msg.killexisting)) {
                                    killexisting = msg.killexisting;
                                }
                                if (!Util_1.Util.IsNullEmpty(msg.killallexisting)) {
                                    killallexisting = msg.killallexisting;
                                }
                                correlationId = msg._msgid || Util_1.Util.GetUniqueIdentifier();
                                rpa_workflow_node.messages[correlationId] = msg;
                                if (msg.payload == null || typeof msg.payload == "string" || typeof msg.payload == "number") {
                                    msg.payload = { "data": msg.payload };
                                }
                                if (Util_1.Util.IsNullEmpty(queue)) {
                                    this.node.status({ fill: "red", shape: "dot", text: "robot is mandatory" });
                                    return [2 /*return*/];
                                }
                                if (Util_1.Util.IsNullEmpty(workflowid)) {
                                    this.node.status({ fill: "red", shape: "dot", text: "workflow is mandatory" });
                                    return [2 /*return*/];
                                }
                                rpacommand = {
                                    command: "invoke",
                                    workflowid: workflowid,
                                    killexisting: killexisting,
                                    killallexisting: killallexisting,
                                    jwt: msg.jwt,
                                    _msgid: msg._msgid,
                                    // Adding expiry to the rpacommand as a timestamp for when the RPA message is expected to timeout from the message queue
                                    // Currently set to 20 seconds into the future
                                    expiry: Math.floor((new Date().getTime()) / 1000) + 500,
                                    data: { payload: msg.payload }
                                };
                                expiration = (typeof msg.expiration == 'number' ? msg.expiration : 500);
                                return [4 /*yield*/, this.client.QueueMessage({ expiration: expiration, queuename: queue, replyto: this.localqueue, data: rpacommand, correlationId: correlationId, striptoken: false, jwt: msg.jwt }, null)];
                            case 1:
                                _a.sent();
                                this.node.status({ fill: "yellow", shape: "dot", text: "Pending " + this.localqueue });
                                return [3 /*break*/, 4];
                            case 2:
                                error_3 = _a.sent();
                                // Util.HandleError(this, error);
                                try {
                                    this.node.status({ fill: "red", shape: "dot", text: error_3 });
                                    msg.error = error_3;
                                    this.node.send([null, null, msg]);
                                }
                                catch (error) {
                                }
                                return [3 /*break*/, 4];
                            case 3:
                                span === null || span === void 0 ? void 0 : span.end();
                                return [7 /*endfinally*/];
                            case 4: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    rpa_workflow_node.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!Util_1.Util.IsNullEmpty(this.localqueue)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.UnRegisterQueue({ queuename: this.localqueue })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        this.localqueue = "";
                        this.client.removeListener("onsignedin", this._onsignedin);
                        this.client.removeListener("onclose", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    rpa_workflow_node.messages = [];
    return rpa_workflow_node;
}());
exports.rpa_workflow_node = rpa_workflow_node;
var rpa_killworkflows_node = /** @class */ (function () {
    function rpa_killworkflows_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        this.originallocalqueue = "";
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            this.node = this;
            this.node.status({});
            this.name = config.name;
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
                this.connect();
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    rpa_killworkflows_node.prototype.onsignedin = function () {
        this.connect();
    };
    rpa_killworkflows_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    rpa_killworkflows_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_4;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterQueue({ queuename: "" }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 1:
                        _a.localqueue = _b.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        this.localqueue = "";
                        Util_1.Util.HandleError(this, error_4, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    rpa_killworkflows_node.prototype.OnMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var result, correlationId, command;
            return __generator(this, function (_a) {
                try {
                    result = { payload: payload, user: user, jwt: jwt };
                    correlationId = msg.correlationId;
                    command = payload.command;
                    if (correlationId != null && rpa_killworkflows_node.messages[correlationId] != null) {
                        result = rpa_killworkflows_node.messages[correlationId];
                        if (command == "killallworkflowssuccess" || command == "error" || command == "timeout") {
                            delete rpa_killworkflows_node.messages[correlationId];
                        }
                    }
                    if (command == "killallworkflowssuccess") {
                        // result.payload = data.payload;
                        if (result.payload == null || result.payload == undefined) {
                            result.payload = {};
                        }
                        this.node.status({ fill: "green", shape: "dot", text: "killed " + this.localqueue });
                        result.id = correlationId;
                        this.node.send([result, null]);
                    }
                    else if (command == "error" || command == "timeout") {
                        result.error = payload;
                        if (command == "timeout") {
                            result.error = "request timed out, no robot picked up the message in a timely fashion";
                        }
                        if (result.error != null && result.error.Message != null && result.error.Message != "") {
                            result.error = result.error.Message;
                        }
                        if (result.payload == null || result.payload == undefined) {
                            result.payload = {};
                        }
                        this.node.status({ fill: "red", shape: "dot", text: command + "  " + this.localqueue });
                        result.id = correlationId;
                        this.node.send([null, result]);
                    }
                    else {
                        this.node.status({ fill: "blue", shape: "dot", text: "Unknown command " + command + "  " + this.localqueue });
                        if (result.payload == null || result.payload == undefined) {
                            result.payload = {};
                        }
                        result.id = correlationId;
                        this.node.send([null, result]);
                    }
                }
                catch (error) {
                    this.node.status({});
                    Util_1.Util.HandleError(this, error, msg);
                }
                return [2 /*return*/];
            });
        });
    };
    rpa_killworkflows_node.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var logmsg;
            var _this = this;
            var _a;
            return __generator(this, function (_b) {
                logmsg = (_a = Logger_1.Logger.log_message) === null || _a === void 0 ? void 0 : _a.log_messages[msg._msgid];
                nodeapi_1.apiinstrumentation.With("api kill workflows", logmsg === null || logmsg === void 0 ? void 0 : logmsg.traceId, logmsg === null || logmsg === void 0 ? void 0 : logmsg.spanId, undefined, function (span) { return __awaiter(_this, void 0, void 0, function () {
                    var queue, priority, correlationId, rpacommand, expiration, error_5;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                _a.trys.push([0, 2, , 3]);
                                this.node.status({});
                                if (this.client == null || !this.client.signedin) {
                                    throw new Error("Not connected to openflow");
                                }
                                if (Util_1.Util.IsNullEmpty(this.localqueue)) {
                                    throw new Error("Queue not registered yet");
                                }
                                queue = this.config.queue;
                                if (queue == "none")
                                    queue = "";
                                if (Util_1.Util.IsNullEmpty(queue) && !Util_1.Util.IsNullEmpty(msg.targetid)) {
                                    queue = msg.targetid;
                                }
                                priority = 1;
                                if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                                    priority = msg.priority;
                                }
                                correlationId = msg._msgid || Util_1.Util.GetUniqueIdentifier();
                                rpa_killworkflows_node.messages[correlationId] = msg;
                                // if (msg.payload == null || typeof msg.payload == "string" || typeof msg.payload == "number") {
                                //     msg.payload = { "data": msg.payload };
                                // }
                                if (Util_1.Util.IsNullEmpty(queue)) {
                                    this.node.status({ fill: "red", shape: "dot", text: "robot is mandatory" });
                                    return [2 /*return*/];
                                }
                                rpacommand = {
                                    command: "killallworkflows",
                                    jwt: msg.jwt,
                                    // Adding expiry to the rpacommand as a timestamp for when the RPA message is expected to timeout from the message queue
                                    // Currently set to 20 seconds into the future
                                    expiry: Math.floor((new Date().getTime()) / 1000) + 500,
                                    data: {}
                                };
                                expiration = (typeof msg.expiration == 'number' ? msg.expiration : 500);
                                return [4 /*yield*/, this.client.QueueMessage({ queuename: queue, replyto: this.localqueue, data: rpacommand, correlationId: correlationId, striptoken: true, jwt: msg.jwt }, null)];
                            case 1:
                                _a.sent();
                                this.node.status({ fill: "yellow", shape: "dot", text: "Pending " + this.localqueue });
                                return [3 /*break*/, 3];
                            case 2:
                                error_5 = _a.sent();
                                try {
                                    this.node.status({ fill: "red", shape: "dot", text: error_5 });
                                    msg.error = error_5;
                                    this.node.send([null, null, msg]);
                                }
                                catch (error) {
                                }
                                return [3 /*break*/, 3];
                            case 3: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    rpa_killworkflows_node.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!Util_1.Util.IsNullEmpty(this.localqueue)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.UnRegisterQueue({ queuename: this.localqueue })];
                    case 1:
                        _a.sent();
                        this.localqueue = "";
                        _a.label = 2;
                    case 2:
                        this.client.removeListener("onsignedin", this._onsignedin);
                        this.client.removeListener("onclose", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    rpa_killworkflows_node.messages = [];
    return rpa_killworkflows_node;
}());
exports.rpa_killworkflows_node = rpa_killworkflows_node;
function get_rpa_detectors(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Util_1.Util.client.Query({
                            collectionname: 'openrpa', query: { _type: "detector" },
                            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
                        })];
                case 1:
                    result = _a.sent();
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    err(error_6);
                    res.status(500).json(error_6);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function get_rpa_robots_roles(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Util_1.Util.client.Query({
                            collectionname: 'users', query: { $or: [{ _type: "user", _rpaheartbeat: { "$exists": true } }, { _type: "role", rparole: true }] },
                            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
                        })];
                case 1:
                    result = _a.sent();
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _a.sent();
                    err(error_7);
                    res.status(500).json(error_7);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function get_rpa_robots(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Util_1.Util.client.Query({
                            collectionname: 'users', query: { _type: "user", _rpaheartbeat: { "$exists": true } },
                            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
                        })];
                case 1:
                    result = _a.sent();
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    err(error_8);
                    res.status(500).json(error_8);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function get_rpa_workflows(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, result, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = { _type: "workflow" };
                    if (!Util_1.Util.IsNullEmpty(req.query.name)) {
                        // q["name"] = new RegExp(["^", req.query.name, "$"].join(""), "i")
                        query["$or"] = [
                            { "projectandname": new RegExp([req.query.name].join(""), "i") },
                            { "_id": req.query.name }
                        ];
                    }
                    warn("query " + JSON.stringify(query));
                    return [4 /*yield*/, Util_1.Util.client.Query({
                            collectionname: 'openrpa',
                            query: query,
                            projection: { name: 1, projectandname: 1 }, orderby: { projectid: -1, name: -1 }, top: 20, queryas: req.query.queue
                        })];
                case 1:
                    result = _a.sent();
                    info("query response gave ".concat(result.length, " results"));
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    err(error_9);
                    res.status(500).json(error_9);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
//# sourceMappingURL=rpa_nodes.js.map