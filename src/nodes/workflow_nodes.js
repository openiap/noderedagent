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
exports.assign_workflow_node = exports.get_workflows = exports.get_workflow_forms = exports.workflow_out_node = exports.workflow_in_node = void 0;
var nodeapi_1 = require("@openiap/nodeapi");
var RED = require("node-red");
var Util_1 = require("./Util");
var workflow_in_node = /** @class */ (function () {
    function workflow_in_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.localqueue = "";
        this.localexchangequeue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            this.node = this;
            this.node.status({ fill: "blue", shape: "dot", text: "init" });
            this.name = config.name;
            this.node.on("close", this.onclose);
            // this.host = Config.amqp_url;
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
                this.connect();
            }
            else {
                this.node.status({ fill: "red", shape: "dot", text: "Disconnected" });
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    workflow_in_node.prototype.onsignedin = function () {
        this.connect();
    };
    workflow_in_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    workflow_in_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        if (this.config.queue == null || this.config.queue == "") {
                            this.node.status({ fill: "red", shape: "dot", text: "Missing queue name" });
                            return [2 /*return*/];
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterQueue({
                                queuename: this.config.queue
                            }, function (msg) {
                                return _this.OnMessage(msg);
                            })];
                    case 1:
                        _a.localqueue = _b.sent();
                        return [4 /*yield*/, this.init()];
                    case 2:
                        _b.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        this.localqueue = "";
                        this.localexchangequeue = "";
                        Util_1.Util.HandleError(this, error_1, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    workflow_in_node.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var name, res, wf, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        name = this.config.name;
                        if (Util_1.Util.IsNullEmpty(name)) {
                            name = this.config.queue;
                        }
                        if (Util_1.Util.IsNullEmpty(this.localqueue)) {
                            this.node.status({ fill: "green", shape: "dot", text: "init failed, missing localqueue name" });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.client.Query({ collectionname: "workflow", query: { "queue": this.localqueue }, top: 1 })];
                    case 1:
                        res = _c.sent();
                        if (!(res.length == 0)) return [3 /*break*/, 3];
                        wf = new nodeapi_1.Base();
                        wf._type = "workflow";
                        wf.name = name;
                        wf.queue = this.localqueue;
                        // if (noderedadmins != null) {
                        //     Base.addRight(wf, noderedadmins._id, noderedadmins.name, [-1]);
                        // }
                        _a = this;
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "workflow", item: { _type: "workflow", "queue": this.localqueue, "name": name } })];
                    case 2:
                        // if (noderedadmins != null) {
                        //     Base.addRight(wf, noderedadmins._id, noderedadmins.name, [-1]);
                        // }
                        _a.workflow = _c.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        this.workflow = res[0];
                        _c.label = 4;
                    case 4:
                        // const res2 = await this.client.Query({ collectionname: "users", query: { "_type": "role", "$or": [{ "workflowid": this.workflow._id }, { "name": this.localqueue + "users" }] }, top: 1 });
                        // let role: Base = null;
                        // const who = WebSocketClient.instance.user;
                        // if (res2.length == 0) {
                        //     (role as any) = { _type: "role", "name": this.localqueue + "users", members: [{ "_id": who._id, "name": who.name }], "workflowid": this.workflow._id };
                        //     (role as any).customerid = who.customerid;
                        //     role = await this.client.InsertOne({ collectionname: "users", item: role });
                        // } else {
                        //     role = res2[0];
                        //     (role as any).customerid = who.customerid;
                        // }
                        // Base.addRight(this.workflow, role._id, role.name, [-1]);
                        this.workflow.queue = this.localqueue;
                        this.workflow.name = name;
                        this.workflow.rpa = this.config.rpa;
                        this.workflow.web = this.config.web;
                        _b = this;
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "workflow", item: this.workflow })];
                    case 5:
                        _b.workflow = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    workflow_in_node.prototype.nestedassign = function (target, source) {
        if (source === null || source === undefined)
            return null;
        var keys = Object.keys(source);
        var _loop_1 = function (i) {
            try {
                var sourcekey_1 = keys[i];
                if (Object.keys(source).find(function (targetkey) { return targetkey === sourcekey_1; }) !== undefined &&
                    Object.keys(source).find(function (targetkey) { return targetkey === sourcekey_1; }) !== null
                    && typeof source === "object" && typeof source[sourcekey_1] === "object") {
                    if (target[sourcekey_1] === undefined || target[sourcekey_1] === null) {
                        // target[sourcekey] = {};
                    }
                    else {
                        target[sourcekey_1] = this_1.nestedassign(target[sourcekey_1], source[sourcekey_1]);
                    }
                }
                else {
                    target[sourcekey_1] = source[sourcekey_1];
                }
            }
            catch (error) {
            }
        };
        var this_1 = this;
        for (var i = 0; i < keys.length; i++) {
            _loop_1(i);
        }
        return target;
    };
    workflow_in_node.prototype.OnMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _id, jwt, res, orgmsg, jwt, who, me, testjwt, signin, item, res2, error_2, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        data = msg;
                        data.payload = msg.data;
                        delete data.data;
                        try {
                            data.payload = JSON.parse(data.payload);
                        }
                        catch (error) {
                        }
                        if (data.payload != null && data.payload.__jwt != null && data.__jwt == null) {
                            if (!Util_1.Util.IsNullUndefinded(data.payload.__user)) {
                                data.user = data.payload.__user;
                                delete data.payload.__user;
                            }
                            data.jwt = data.payload.__jwt;
                            delete data.payload.__jwt;
                        }
                        _id = data._id;
                        if (_id === null || _id === undefined || _id === "") {
                            if (data.payload !== null && data.payload !== undefined) {
                                if (data.payload._id !== null && data.payload._id !== undefined && data.payload._id !== "") {
                                    _id = data.payload._id;
                                }
                            }
                        }
                        if (data && data.payload) {
                            delete data.payload.traceId;
                            delete data.payload.spanId;
                        }
                        while (data.payload != null && data.payload.payload != null) {
                            data.payload = data.payload.payload;
                        }
                        if (!(_id !== null && _id !== undefined && _id !== "")) return [3 /*break*/, 2];
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing id " + _id });
                        jwt = data.jwt;
                        delete data.jwt;
                        return [4 /*yield*/, this.client.Query({ collectionname: "workflow_instances", query: { "_id": _id }, top: 1, jwt: jwt })];
                    case 1:
                        res = _a.sent();
                        if (res.length == 0) {
                            Util_1.Util.HandleError(this, "Unknown workflow_instances id " + _id, msg);
                            return [2 /*return*/, { "error": "Unknown workflow_instances id " + _id }];
                        }
                        orgmsg = res[0];
                        delete orgmsg._msgid; // Keep each run seperate
                        if (orgmsg.payload === null || orgmsg.payload === undefined) {
                            orgmsg.payload = data;
                            data = orgmsg;
                        }
                        else {
                            if (typeof orgmsg.payload === "object") {
                                orgmsg.payload = Object.assign(orgmsg.payload, data.payload);
                            }
                            else {
                                orgmsg.payload = { message: orgmsg.payload };
                                orgmsg.payload = Object.assign(orgmsg.payload, data.payload);
                            }
                            orgmsg.jwt = data.jwt;
                            orgmsg.user = data.user;
                            data = orgmsg;
                        }
                        data.jwt = jwt;
                        return [3 /*break*/, 6];
                    case 2:
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing new instance " });
                        jwt = data.jwt;
                        who = this.client.client.user;
                        me = this.client.client.user;
                        testjwt = this.client.client.jwt;
                        this.node.status({ fill: "blue", shape: "dot", text: "Renew token " });
                        if (!!Util_1.Util.IsNullEmpty(jwt)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.client.Signin({ jwt: jwt, validateonly: true })];
                    case 3:
                        signin = _a.sent();
                        who = signin.user;
                        data.jwt = signin.jwt;
                        console.debug(testjwt);
                        _a.label = 4;
                    case 4:
                        delete data.jwt;
                        item = ({ _type: "instance", "queue": this.localqueue, "name": this.workflow.name, payload: data, workflow: this.workflow._id, targetid: who._id });
                        item._replyTo = msg.replyto;
                        item._correlationId = msg.correlationId;
                        nodeapi_1.Base.addRight(item, who._id, who.name, [-1]);
                        if (who._id != me._id)
                            nodeapi_1.Base.addRight(item, me._id, me.name, [-1]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Create instance " });
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "workflow_instances", item: item, jwt: jwt })];
                    case 5:
                        res2 = _a.sent();
                        // Logger.instanse.info("workflow in activated creating a new workflow instance with id " + res2._id);
                        // OpenFlow Controller.ts needs the id, when creating a new intance !
                        data._id = res2._id;
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing new id " + res2._id });
                        if (data.payload !== null && data.payload != undefined) {
                            try {
                                data.payload._id = res2._id;
                            }
                            catch (error) {
                            }
                        }
                        // result = this.nestedassign(res2, result);
                        data = Object.assign(res2, data);
                        data.jwt = jwt;
                        _a.label = 6;
                    case 6:
                        data._replyTo = msg.replyto;
                        data._correlationId = msg.correlationId;
                        if (data != null && data.jwt != null && data.payload != null && data.jwt == data.payload.jwt) {
                            delete data.payload.jwt;
                        }
                        // if (Util.IsNullEmpty(data._msgid)) data._msgid = Util.GetUniqueIdentifier();
                        // WebServer.log_messages[data._msgid] = new log_message(data._msgid);
                        // log_message.nodestart(data._msgid, this.node.id);
                        // if (data.payload && !Util.IsNullEmpty(data.payload.traceId) && !Util.IsNullEmpty(data.payload.spanId)) {
                        //     WebServer.log_messages[data._msgid].traceId = data.payload.traceId;
                        //     WebServer.log_messages[data._msgid].spanId = data.payload.spanId;
                        // }
                        this.node.send(data);
                        // this.node.send(result);
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 8];
                    case 7:
                        error_2 = _a.sent();
                        Util_1.Util.HandleError(this, error_2, msg);
                        try {
                            data = {};
                            data.error = error_2;
                            data.payload = msg.data;
                            data.jwt = msg.jwt;
                            if (data.payload === null || data.payload === undefined) {
                                data.payload = {};
                            }
                            return [2 /*return*/, JSON.stringify(data)];
                        }
                        catch (error) {
                        }
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    workflow_in_node.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            var res, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 12, , 13]);
                        if (!removed) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.client.Query({ collectionname: "workflow", query: { "queue": this.localqueue }, top: 1 })];
                    case 1:
                        res = _a.sent();
                        if (!(res.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client.DeleteOne({ collectionname: "workflow", id: res[0]._id })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!(this.workflow != null)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.client.Query({ collectionname: "users", query: { "_type": "role", "$or": [{ "workflowid": this.workflow._id }, { "name": this.localqueue + "users" }] }, top: 1 })];
                    case 4:
                        res = _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!(res.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.client.DeleteOne({ collectionname: "users", id: res[0]._id })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!!Util_1.Util.IsNullEmpty(this.localqueue)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.client.UnRegisterQueue({ queuename: this.localqueue })];
                    case 8:
                        _a.sent();
                        this.localqueue = "";
                        _a.label = 9;
                    case 9:
                        if (!!Util_1.Util.IsNullEmpty(this.localexchangequeue)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.client.UnRegisterQueue({ queuename: this.localexchangequeue })];
                    case 10:
                        _a.sent();
                        this.localexchangequeue = "";
                        _a.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        error_3 = _a.sent();
                        Util_1.Util.HandleError(this, error_3, null);
                        return [3 /*break*/, 13];
                    case 13:
                        this.node.status({ fill: "red", shape: "dot", text: "Disconnected" });
                        this.client.removeListener("onsignedin", this._onsignedin);
                        this.client.removeListener("onclose", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    return workflow_in_node;
}());
exports.workflow_in_node = workflow_in_node;
var workflow_out_node = /** @class */ (function () {
    function workflow_out_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.name = config.name;
        this.node = this;
        // this.host = Config.amqp_url;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    workflow_out_node.prototype.oninput = function (msg, send, done) {
        return __awaiter(this, void 0, void 0, function () {
            var priority, msgcopy, msgcopy, error_4, data, expiration, error_5, data, error_6, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 16, 17, 18]);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        this.node.status({});
                        msg.state = this.config.state;
                        if (this.config.state != "from msg.form") {
                            msg.form = this.config.form;
                        }
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!(msg._id !== null && msg._id !== undefined && msg._id !== "")) return [3 /*break*/, 5];
                        if (!this.config.removestate) return [3 /*break*/, 3];
                        msgcopy = {};
                        msgcopy._id = msg._id;
                        msgcopy.queue = msg.queue;
                        msgcopy.name = msg.name;
                        msgcopy.workflow = msg.workflow;
                        msgcopy.targetid = msg.targetid;
                        msgcopy.replyto = msg.replyto;
                        msgcopy.correlationId = msg.correlationId;
                        msgcopy.queuename = msg.queuename;
                        msgcopy.consumerTag = msg.consumerTag;
                        msgcopy.exchange = msg.exchange;
                        msgcopy._msgid = msg._msgid;
                        msgcopy.state = msg.state;
                        msgcopy.form = msg.form;
                        this.node.status({ fill: "blue", shape: "dot", text: "Updating workflow instance" });
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "workflow_instances", item: msgcopy, jwt: msg.jwt })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        msgcopy = Object.assign({}, msg);
                        delete msgcopy.jwt;
                        delete msgcopy.user;
                        // Logger.instanse.info("Updating workflow instance with id " + msg._id + " (" + msg.name + " with state " + msg.state);
                        this.node.status({ fill: "blue", shape: "dot", text: "Updating workflow instance" });
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "workflow_instances", item: msgcopy, jwt: msg.jwt })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_4 = _a.sent();
                        Util_1.Util.HandleError(this, error_4, msg);
                        return [3 /*break*/, 7];
                    case 7:
                        _a.trys.push([7, 10, , 11]);
                        if (!(!Util_1.Util.IsNullEmpty(msg.resultqueue) && (msg.state == "completed" || msg.state == "failed"))) return [3 /*break*/, 9];
                        data = {};
                        data.state = msg.state;
                        if (msg.error) {
                            data.error = "error";
                            if (msg.error.message) {
                                data.error = msg.error.message;
                            }
                        }
                        data._id = msg._id;
                        data.payload = msg.payload;
                        data.values = msg.values;
                        data.jwt = msg.jwt;
                        expiration = (typeof msg.expiration == 'number' ? msg.expiration : 500);
                        this.node.status({ fill: "blue", shape: "dot", text: "QueueMessage.1" });
                        return [4 /*yield*/, this.client.QueueMessage({ queuename: msg.resultqueue, data: data, correlationId: msg.correlationId, striptoken: false })];
                    case 8:
                        _a.sent();
                        if (msg.resultqueue == msg._replyTo)
                            msg._replyTo = null; // don't double message (??)
                        _a.label = 9;
                    case 9: return [3 /*break*/, 11];
                    case 10:
                        error_5 = _a.sent();
                        Util_1.Util.HandleError(this, error_5, msg);
                        return [3 /*break*/, 11];
                    case 11:
                        _a.trys.push([11, 14, , 15]);
                        if (!!Util_1.Util.IsNullEmpty(msg._replyTo)) return [3 /*break*/, 13];
                        if (msg.payload === null || msg.payload === undefined) {
                            msg.payload = {};
                        }
                        data = {};
                        data.state = msg.state;
                        if (msg.error) {
                            data.error = "error";
                            if (msg.error.message) {
                                data.error = msg.error.message;
                            }
                        }
                        data._id = msg._id;
                        data.payload = msg.payload;
                        data.values = msg.values;
                        data.jwt = msg.jwt;
                        // ROLLBACK
                        // Don't wait for ack(), we don't care if the receiver is there, right ?
                        this.node.status({ fill: "blue", shape: "dot", text: "Queue message for " + msg._replyTo });
                        return [4 /*yield*/, this.client.QueueMessage({ queuename: msg._replyTo, data: data, correlationId: msg.correlationId, striptoken: false })];
                    case 12:
                        _a.sent();
                        _a.label = 13;
                    case 13: return [3 /*break*/, 15];
                    case 14:
                        error_6 = _a.sent();
                        Util_1.Util.HandleError(this, error_6, msg);
                        return [3 /*break*/, 15];
                    case 15:
                        send(msg);
                        done();
                        this.node.status({});
                        return [3 /*break*/, 18];
                    case 16:
                        error_7 = _a.sent();
                        done(error_7);
                        return [3 /*break*/, 18];
                    case 17: return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    workflow_out_node.prototype.onclose = function () {
    };
    return workflow_out_node;
}());
exports.workflow_out_node = workflow_out_node;
function get_workflow_forms(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var result, error_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Util_1.Util.client.Query({
                            collectionname: 'forms', query: { _type: "form" },
                            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
                        })];
                case 1:
                    result = _a.sent();
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_8 = _a.sent();
                    res.status(500).json(error_8);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.get_workflow_forms = get_workflow_forms;
function get_workflows(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, ors, result, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = { "_type": "workflow" };
                    ors = [];
                    if (!Util_1.Util.IsNullEmpty(req.query.name)) {
                        ors.push({ name: { $regex: ".*" + req.query.name + ".*" } });
                    }
                    else {
                        ors.push({});
                    }
                    if (!Util_1.Util.IsNullEmpty(req.query.id)) {
                        ors.push({ _id: req.query.id });
                    }
                    if (ors.length > 0) {
                        query = {
                            $and: [
                                query,
                                { $or: ors }
                            ]
                        };
                    }
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'workflow', query: query, projection: { name: 1 }, orderby: { name: -1 } })];
                case 1:
                    result = _a.sent();
                    res.json(result);
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _a.sent();
                    res.status(500).json(error_9);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.get_workflows = get_workflows;
var assign_workflow_node = /** @class */ (function () {
    function assign_workflow_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        // public host: string;
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        if (this.config == null || this.config.queue == null || this.config.queue == "") {
            this.node.status({ fill: "red", shape: "dot", text: "Missing queue name" });
            return;
        }
        // this.host = Config.amqp_url;
        this._onsignedin = this.onsignedin.bind(this);
        this._onsocketclose = this.onsocketclose.bind(this);
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
        this.client.on("signedin", this._onsignedin);
        this.client.on("disconnected", this._onsocketclose);
        if (this.client.signedin) {
            this.connect();
        }
    }
    assign_workflow_node.prototype.onsignedin = function () {
        this.connect();
    };
    assign_workflow_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    assign_workflow_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, res, role, exists, who, error_10;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        this.localqueue = this.config.queue;
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterQueue({
                                queuename: this.localqueue
                            }, function (msg) {
                                _this.OnMessage(msg);
                            })];
                    case 1:
                        _a.localqueue = _b.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        if (!(!Util_1.Util.IsNullUndefinded(this.config.targetid) && !Util_1.Util.IsNullUndefinded(this.config.workflowid))) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.client.Query({ collectionname: "users", query: { "_type": "role", "workflowid": this.config.workflowid }, top: 1 })];
                    case 2:
                        res = _b.sent();
                        if (!(res.length == 1)) return [3 /*break*/, 4];
                        role = res[0];
                        exists = role.members.filter(function (x) { return x._id == _this.config.targetid; });
                        if (!(exists.length == 0)) return [3 /*break*/, 4];
                        who = this.client.client.user;
                        // (role as any).customerid = who.customerid;
                        role.members.push({ name: "target", "_id": this.config.targetid });
                        return [4 /*yield*/, this.client.UpdateOne({ collectionname: "users", item: role })];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_10 = _b.sent();
                        this.localqueue = "";
                        Util_1.Util.HandleError(this, error_10, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    assign_workflow_node.prototype.OnMessage = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var result, data, priority, _id, res, currentinstance, state, _parentid, res2, parentinstance, res_1, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        result = {};
                        data = msg.data;
                        if (data.state == "idle")
                            return [2 /*return*/];
                        if (!Util_1.Util.IsNullUndefinded(data.__user)) {
                            data.user = data.__user;
                            delete data.__user;
                        }
                        if (!Util_1.Util.IsNullUndefinded(data.__jwt)) {
                            data.jwt = data.__jwt;
                            delete data.__jwt;
                        }
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        _id = data._id;
                        if (_id === null || _id === undefined || _id === "") {
                            if (data.payload !== null && data.payload !== undefined) {
                                if (data.payload._id !== null && data.payload._id !== undefined && data.payload._id !== "") {
                                    _id = data.payload._id;
                                }
                            }
                        }
                        if (!(_id !== null && _id !== undefined && _id !== "")) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.client.Query({ collectionname: "workflow_instances", query: { "_id": _id }, projection: { "_parentid": 1 }, top: 1, jwt: data.jwt })];
                    case 1:
                        res = _a.sent();
                        if (res.length == 0) {
                            Util_1.Util.HandleError(this, "Unknown workflow_instances id " + _id, msg);
                            return [2 /*return*/];
                        }
                        currentinstance = res[0];
                        state = res[0].state;
                        _parentid = res[0]._parentid;
                        if (!(_parentid !== null && _parentid !== undefined && _parentid !== "")) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.client.Query({ collectionname: "workflow_instances", query: { "_id": _parentid }, top: 1 })];
                    case 2:
                        res2 = _a.sent();
                        if (res2.length == 0) {
                            Util_1.Util.HandleError(this, "Unknown workflow_instances parentid " + _parentid, msg);
                            return [2 /*return*/];
                        }
                        parentinstance = res2[0];
                        result = parentinstance.msg;
                        if (Util_1.Util.IsNullUndefinded(result))
                            result = {};
                        result.state = data.state;
                        result.payload = data.payload;
                        result.jwt = data.jwt;
                        result.user = data.user;
                        this.node.send([null, result]);
                        return [4 /*yield*/, this.client.UpdateDocument({ collectionname: "workflow_instances", query: { _id: _parentid }, document: { "$set": { "state": "completed" } } })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                    case 4: return [4 /*yield*/, this.client.Query({ collectionname: "workflow_instances", query: { "_id": _id }, projection: { msg: 1 }, top: 1, jwt: data.jwt })];
                    case 5:
                        res_1 = _a.sent();
                        if (res_1.length > 0 && res_1[0].msg) {
                            result = res_1[0].msg;
                            result.state = data.state;
                        }
                        _a.label = 6;
                    case 6:
                        result.payload = data.payload;
                        result.jwt = data.jwt;
                        result.user = data.user;
                        this.node.send([null, result]);
                        return [3 /*break*/, 8];
                    case 7:
                        error_11 = _a.sent();
                        Util_1.Util.HandleError(this, error_11, msg);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    assign_workflow_node.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var workflowid, targetid, initialrun, topic, priority, jwt, cloned, runnerinstance, who, size, res3, _a, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
                        workflowid = (!Util_1.Util.IsNullEmpty(this.config.workflowid) ? this.config.workflowid : msg.workflowid);
                        targetid = (!Util_1.Util.IsNullEmpty(this.config.targetid) ? this.config.targetid : msg.targetid);
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "initialrun")];
                    case 1:
                        initialrun = _b.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "topic")];
                    case 2:
                        topic = _b.sent();
                        if (Util_1.Util.IsNullEmpty(topic))
                            topic = this.config.name;
                        if (Util_1.Util.IsNullEmpty(topic))
                            topic = msg.name;
                        if (Util_1.Util.IsNullEmpty(topic))
                            topic = this.config.queue;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (Util_1.Util.IsNullEmpty(targetid)) {
                            this.node.status({ fill: "red", shape: "dot", text: "targetid is mandatory" });
                            return [2 /*return*/];
                        }
                        if (Util_1.Util.IsNullEmpty(workflowid)) {
                            this.node.status({ fill: "red", shape: "dot", text: "workflowid is mandatory" });
                            return [2 /*return*/];
                        }
                        jwt = msg.jwt;
                        if (Util_1.Util.IsNullEmpty(jwt)) {
                            jwt = this.client.client.jwt;
                        }
                        cloned = Object.assign({}, msg);
                        runnerinstance = new nodeapi_1.Base();
                        runnerinstance._type = "instance";
                        runnerinstance.name = "runner: " + topic;
                        runnerinstance.queue = this.localqueue;
                        runnerinstance.state = "idle";
                        runnerinstance.msg = cloned;
                        runnerinstance.jwt = msg.jwt;
                        who = this.client.client.user;
                        nodeapi_1.Base.addRight(runnerinstance, who._id, who.name, [-1]);
                        size = JSON.stringify(runnerinstance).length * 2;
                        if (size > (512 * 1024)) {
                            throw new Error("msg object is over 512KB in size, please clean up the msg object before using Assign");
                        }
                        return [4 /*yield*/, this.client.InsertOne({ collectionname: "workflow_instances", item: runnerinstance, jwt: jwt })];
                    case 3:
                        res3 = _b.sent();
                        msg._parentid = res3._id;
                        try {
                            msg.payload._parentid = res3._id;
                        }
                        catch (error) {
                            msg.payload = { data: msg.payload, _parentid: res3._id };
                        }
                        _a = msg;
                        return [4 /*yield*/, this.client.CreateWorkflowInstance({ targetid: targetid, workflowid: workflowid, name: topic, resultqueue: this.localqueue, data: msg.payload, initialrun: initialrun, jwt: jwt })];
                    case 4:
                        _a.newinstanceid = _b.sent();
                        this.node.send(msg);
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 6];
                    case 5:
                        error_12 = _b.sent();
                        Util_1.Util.HandleError(this, error_12, msg);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    assign_workflow_node.prototype.onclose = function (removed, done) {
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
    return assign_workflow_node;
}());
exports.assign_workflow_node = assign_workflow_node;
//# sourceMappingURL=workflow_nodes.js.map