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
exports.amqp_exchange_node = exports.amqp_acknowledgment_node = exports.amqp_publisher_node = exports.amqp_consumer_node = exports.amqp_connection = void 0;
var nodeapi_1 = require("@openiap/nodeapi");
var nodeapi_2 = require("@openiap/nodeapi");
var info = nodeapi_2.config.info, warn = nodeapi_2.config.warn, err = nodeapi_2.config.err;
var RED = require("node-red");
var Util_1 = require("./Util");
var amqp_connection = /** @class */ (function () {
    function amqp_connection(config) {
        var _this = this;
        this.config = config;
        this.node = null;
        this.name = "";
        this.username = "";
        this.password = "";
        this.host = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        var client = global.get('client');
        this.node = this;
        this.node.status({});
        this.node.on("close", this.onclose);
        this.credentials = this.node.credentials;
        if (this.node.credentials && this.node.credentials.hasOwnProperty("username")) {
            this.username = this.node.credentials.username;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("password")) {
            this.password = this.node.credentials.password;
        }
        this.host = this.config.host;
        this.name = config.name || this.host;
        if (this.host != "" && this.host != null) {
            this.client = new nodeapi_1.openiap(this.host);
            this.client.onConnected = function (client) { return __awaiter(_this, void 0, void 0, function () {
                var reply, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, client.Signin({ username: this.username, password: this.password })];
                        case 1:
                            reply = _a.sent();
                            info("signing into " + this.host + " as " + reply.user.username);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            Util_1.Util.HandleError(this, error_1, null);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            }); };
            this.client.connect();
            info("connecting to " + this.host);
        }
        else {
            this.client = client;
        }
    }
    amqp_connection.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.host != null && this.host != "") {
                    this.client.Close();
                }
                if (done != null)
                    done();
                return [2 /*return*/];
            });
        });
    };
    return amqp_connection;
}());
exports.amqp_connection = amqp_connection;
var amqp_consumer_node = /** @class */ (function () {
    function amqp_consumer_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.host = null;
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            var client = global.get('client');
            this.client = (this.connection != null) ? this.connection.client : client;
            this.node = this;
            this.name = config.name;
            // this.node.status({});
            this.node.status({ fill: "blue", shape: "dot", text: "Offline" });
            this.node.on("close", this.onclose);
            this.connection = RED.nodes.getNode(this.config.config);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.localqueue == null || this.localqueue == "") {
                this.connect();
            }
            else {
                this.node.status({ fill: "blue", shape: "dot", text: "Waiting on conn" });
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    amqp_consumer_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    amqp_consumer_node.prototype.onsignedin = function () {
        this.connect();
    };
    amqp_consumer_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        info("consumer node in::connect");
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterQueue({
                                queuename: this.config.queue
                            }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 1:
                        _a.localqueue = _b.sent();
                        info("registed amqp consumer as " + this.localqueue);
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        Util_1.Util.HandleError(this, error_2, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    amqp_consumer_node.prototype.OnMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var span, error_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        if (!this.config.autoack) return [3 /*break*/, 4];
                        if (!!Util_1.Util.IsNullEmpty(msg.replyto)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client.QueueMessage({ queuename: msg.replyto, correlationId: msg.correlationId, data: payload, jwt: jwt }, null)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        payload.amqpacknowledgment = function (data) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this.client.QueueMessage({ queuename: msg.replyto, correlationId: msg.correlationId, data: data, jwt: jwt }, null)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); };
                        _a.label = 5;
                    case 5:
                        this.node.send(payload);
                        return [3 /*break*/, 8];
                    case 6:
                        error_3 = _a.sent();
                        Util_1.Util.HandleError(this, error_3, null);
                        return [3 /*break*/, 8];
                    case 7:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    amqp_consumer_node.prototype.onclose = function (removed, done) {
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
                        this.client.removeListener("signedin", this._onsignedin);
                        this.client.removeListener("disconnected", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    return amqp_consumer_node;
}());
exports.amqp_consumer_node = amqp_consumer_node;
var amqp_publisher_node = /** @class */ (function () {
    function amqp_publisher_node(config) {
        this.config = config;
        this.node = null;
        this.client = null;
        this.name = "";
        this.host = null;
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            var client = global.get('client');
            this.client = (this.connection != null) ? this.connection.client : client;
            this.node = this;
            this.name = config.name;
            this.node.status({});
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
            this.connection = RED.nodes.getNode(this.config.config);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.localqueue == null || this.localqueue == "") {
                this.connect();
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    amqp_publisher_node.prototype.onsignedin = function () {
        this.connect();
    };
    amqp_publisher_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    amqp_publisher_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_4;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        info("track::amqp publiser node::connect");
                        this.localqueue = this.config.localqueue;
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterQueue({
                                queuename: this.localqueue
                            }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 1:
                        _a.localqueue = _b.sent();
                        if (this.localqueue != null && this.localqueue != "") {
                            info("registed amqp published return queue as " + this.localqueue);
                            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        this.localqueue = "";
                        Util_1.Util.HandleError(this, error_4, null);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    amqp_publisher_node.prototype.OnMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            var span, result;
            return __generator(this, function (_a) {
                span = null;
                try {
                    result = {};
                    if (payload._msgid != null && payload._msgid != "") {
                        if (amqp_publisher_node.payloads && amqp_publisher_node.payloads[payload._msgid]) {
                            result = Object.assign(amqp_publisher_node.payloads[payload._msgid], payload);
                            delete amqp_publisher_node.payloads[payload._msgid];
                        }
                    }
                    result.payload = payload;
                    if (!Util_1.Util.IsNullEmpty(jwt))
                        result.jwt = jwt;
                    if (!Util_1.Util.IsNullUndefinded(user))
                        result.user = user;
                    if (payload.command == "timeout") {
                        result.error = "Message timed out, message was not picked up in a timely fashion";
                        this.node.send([null, result]);
                    }
                    else {
                        this.node.send(result);
                    }
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, null);
                }
                finally {
                    span === null || span === void 0 ? void 0 : span.end();
                }
                return [2 /*return*/];
            });
        });
    };
    amqp_publisher_node.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, queuename, exchangename, routingkey, striptoken, priority, data, expiration, error_5, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 9, 10, 11]);
                        this.node.status({});
                        if (!this.client.connected) {
                            throw new Error("Not connected to openflow");
                        }
                        if (!this.client.signedin) {
                            throw new Error("Not signed to openflow");
                        }
                        if (this.localqueue == null || this.localqueue == "") {
                            throw new Error("Queue not registered yet");
                        }
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "queue")];
                    case 2:
                        queuename = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "exchange")];
                    case 3:
                        exchangename = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "routingkey")];
                    case 4:
                        routingkey = _a.sent();
                        striptoken = this.config.striptoken;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.striptoken)) {
                            striptoken = msg.striptoken;
                        }
                        data = {};
                        // const [traceId, spanId] = Logger.otel.GetTraceSpanId(span);
                        data.payload = msg.payload;
                        data.jwt = msg.jwt;
                        data._id = msg._id;
                        data._msgid = msg._msgid;
                        expiration = (typeof msg.expiration == 'number' ? msg.expiration : 5000);
                        this.node.status({ fill: "blue", shape: "dot", text: "Sending message ..." });
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.client.QueueMessage({ correlationId: msg._msgid, exchangename: exchangename, routingkey: routingkey, queuename: queuename, replyto: this.localqueue, data: data, striptoken: striptoken }, null)];
                    case 6:
                        _a.sent();
                        amqp_publisher_node.payloads[msg._msgid] = msg;
                        return [3 /*break*/, 8];
                    case 7:
                        error_5 = _a.sent();
                        data.error = error_5;
                        this.node.send([null, data]);
                        return [3 /*break*/, 8];
                    case 8:
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
                        return [3 /*break*/, 11];
                    case 9:
                        error_6 = _a.sent();
                        Util_1.Util.HandleError(this, error_6, null);
                        return [3 /*break*/, 11];
                    case 10:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    amqp_publisher_node.prototype.onclose = function (removed, done) {
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
                        this.client.removeListener("signedin", this._onsignedin);
                        this.client.removeListener("disconnected", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    amqp_publisher_node.payloads = {};
    return amqp_publisher_node;
}());
exports.amqp_publisher_node = amqp_publisher_node;
var amqp_acknowledgment_node = /** @class */ (function () {
    function amqp_acknowledgment_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    amqp_acknowledgment_node.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, data, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        this.node.status({});
                        if (!msg.amqpacknowledgment) return [3 /*break*/, 3];
                        data = {};
                        data.payload = msg.payload;
                        data.jwt = msg.jwt;
                        data._msgid = msg._msgid;
                        return [4 /*yield*/, msg.amqpacknowledgment(data)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 6];
                    case 4:
                        error_7 = _a.sent();
                        err(error_7);
                        return [3 /*break*/, 6];
                    case 5:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    amqp_acknowledgment_node.prototype.onclose = function () {
    };
    return amqp_acknowledgment_node;
}());
exports.amqp_acknowledgment_node = amqp_acknowledgment_node;
var amqp_exchange_node = /** @class */ (function () {
    function amqp_exchange_node(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.host = null;
        this.localqueue = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            var client = global.get('client');
            this.client = (this.connection != null) ? this.connection.client : client;
            this.node = this;
            this.name = config.name;
            // this.node.status({});
            this.node.status({ fill: "blue", shape: "dot", text: "Offline" });
            this.node.on("close", this.onclose);
            this.connection = RED.nodes.getNode(this.config.config);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.localqueue == null || this.localqueue == "") {
                this.connect();
            }
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    amqp_exchange_node.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    amqp_exchange_node.prototype.onsignedin = function () {
        this.connect();
    };
    amqp_exchange_node.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, error_8;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
                        info("track::amqp exchange node in::connect");
                        _a = this;
                        return [4 /*yield*/, this.client.RegisterExchange({
                                exchangename: this.config.exchange, algorithm: this.config.algorithm,
                                routingkey: this.config.routingkey
                            }, function (msg, payload, user, jwt) {
                                _this.OnMessage(msg, payload, user, jwt);
                            })];
                    case 1:
                        _a.localqueue = _b.sent();
                        info("registed amqp exchange as " + this.config.exchange);
                        this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.config.exchange });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        Util_1.Util.HandleError(this, error_8, null);
                        setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    amqp_exchange_node.prototype.OnMessage = function (msg, payload, user, jwt) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.config.autoack) {
                    }
                    if (!Util_1.Util.IsNullEmpty(jwt))
                        payload.jwt = jwt;
                    if (!Util_1.Util.IsNullUndefinded(user))
                        payload.user = user;
                    this.node.send(payload);
                }
                catch (error) {
                    Util_1.Util.HandleError(this, error, msg);
                }
                return [2 /*return*/];
            });
        });
    };
    amqp_exchange_node.prototype.onclose = function (removed, done) {
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
                        this.client.removeListener("signedin", this._onsignedin);
                        this.client.removeListener("disconnected", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    return amqp_exchange_node;
}());
exports.amqp_exchange_node = amqp_exchange_node;
//# sourceMappingURL=amqp_nodes.js.map