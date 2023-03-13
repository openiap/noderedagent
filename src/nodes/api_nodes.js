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
exports.custom = exports.memorydump = exports.drop_collection = exports.list_collections = exports.api_watch = exports.api_aggregate = exports.upload_file = exports.download_file = exports.revoke_permission = exports.grant_permission = exports.api_updatedocument = exports.get_api_users = exports.get_api_userroles = exports.get_api_roles = exports.api_deletemany = exports.api_delete = exports.api_addorupdate = exports.api_update = exports.api_addmany = exports.api_add = exports.api_get = exports.api_get_jwt = exports.api_credentials = void 0;
var nodeapi_1 = require("@openiap/nodeapi");
var info = nodeapi_1.config.info, warn = nodeapi_1.config.warn, err = nodeapi_1.config.err;
var os = require("os");
var RED = require("node-red");
var fs = require("fs");
var path = require("path");
var Util_1 = require("./Util");
var nodeapi_2 = require("@openiap/nodeapi");
var pako = require('pako');
var api_credentials = /** @class */ (function () {
    function api_credentials(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.username = "";
        this.password = "";
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
        this.node.status({});
        if (this.node.credentials && this.node.credentials.hasOwnProperty("username")) {
            this.username = this.node.credentials.username;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("password")) {
            this.password = this.node.credentials.password;
        }
    }
    return api_credentials;
}());
exports.api_credentials = api_credentials;
var api_get_jwt = /** @class */ (function () {
    function api_get_jwt(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_get_jwt.prototype.isNumeric = function (num) {
        return !isNaN(num);
    };
    api_get_jwt.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, username, password, priority, config_1, reply, error_1, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, 9, 10]);
                        this.node.status({});
                        username = null;
                        password = null;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        config_1 = RED.nodes.getNode(this.config.config);
                        if (!Util_1.Util.IsNullUndefinded(config_1) && !Util_1.Util.IsNullEmpty(config_1.username)) {
                            username = config_1.username;
                        }
                        if (!Util_1.Util.IsNullUndefinded(config_1) && !Util_1.Util.IsNullEmpty(config_1.password)) {
                            password = config_1.password;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.username)) {
                            username = msg.username;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.password)) {
                            password = msg.password;
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Requesting token" });
                        reply = null;
                        if (!(!Util_1.Util.IsNullEmpty(username) && !Util_1.Util.IsNullEmpty(password))) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.client.Signin({ username: username, password: password, validateonly: true, longtoken: this.config.longtoken })];
                    case 2:
                        reply = _a.sent();
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(this.config.refresh && !Util_1.Util.IsNullEmpty(msg.jwt))) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.client.Signin({ jwt: msg.jwt, validateonly: true, longtoken: this.config.longtoken })];
                    case 4:
                        reply = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, this.client.Signin({ validateonly: true, longtoken: this.config.longtoken })];
                    case 6:
                        reply = _a.sent();
                        _a.label = 7;
                    case 7:
                        msg.jwt = reply.jwt;
                        msg.user = reply.user;
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 10];
                    case 8:
                        error_1 = _a.sent();
                        message = error_1.message ? error_1.message : error_1;
                        Util_1.Util.HandleError(this, message, msg);
                        this.node.status({ fill: 'red', shape: 'dot', text: message.toString().substr(0, 32) });
                        return [3 /*break*/, 10];
                    case 9:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    api_get_jwt.prototype.onclose = function () {
    };
    return api_get_jwt;
}());
exports.api_get_jwt = api_get_jwt;
var api_get = /** @class */ (function () {
    function api_get(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_get.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, collectionname, query, projection, orderby, top_1, skip, priority, field, result, pageby, subresult, take, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 16, 17, 18]);
                        if (!!this.client.connected) return [3 /*break*/, 3];
                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 2000); })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 4:
                        collectionname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "query")];
                    case 5:
                        query = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "projection")];
                    case 6:
                        projection = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "orderby")];
                    case 7:
                        orderby = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "top")];
                    case 8:
                        top_1 = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "skip")];
                    case 9:
                        skip = _a.sent();
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        top_1 = parseInt(top_1);
                        skip = parseInt(skip);
                        if (!Util_1.Util.IsNullEmpty(orderby) && Util_1.Util.IsString(orderby)) {
                            if (orderby.indexOf("{") > -1) {
                                try {
                                    orderby = JSON.parse(orderby);
                                }
                                catch (error) {
                                    Util_1.Util.HandleError(this, "Error parsing orderby", msg);
                                    return [2 /*return*/];
                                }
                            }
                        }
                        if (!Util_1.Util.IsNullEmpty(orderby) && Util_1.Util.IsString(orderby)) {
                            field = orderby;
                            orderby = {};
                            orderby[field] = -1;
                        }
                        if (Util_1.Util.IsNullEmpty(query)) {
                            query = {};
                        }
                        else if (Util_1.Util.IsString(query)) {
                            query = JSON.parse(query);
                        }
                        if (Util_1.Util.IsNullEmpty(projection)) {
                            projection = {};
                        }
                        else if (Util_1.Util.IsString(projection)) {
                            try {
                                projection = JSON.parse(projection);
                            }
                            catch (error) {
                                Util_1.Util.HandleError(this, "Error parsing projection", msg);
                                return [2 /*return*/];
                            }
                        }
                        if (Util_1.Util.IsNullEmpty(projection)) {
                            projection = null;
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Getting query" });
                        result = [];
                        pageby = 250;
                        subresult = [];
                        take = (top_1 > pageby ? pageby : top_1);
                        _a.label = 10;
                    case 10:
                        if (!(subresult.length == pageby && result.length < top_1)) return [3 /*break*/, 12];
                        this.node.status({ fill: "blue", shape: "dot", text: "Getting " + skip + " " + (skip + pageby) });
                        return [4 /*yield*/, Util_1.Util.Delay(50)];
                    case 11:
                        _a.sent();
                        _a.label = 12;
                    case 12:
                        if ((result.length + take) > top_1) {
                            take = top_1 - result.length;
                        }
                        return [4 /*yield*/, this.client.Query({ collectionname: collectionname, query: query, projection: projection, orderby: orderby, top: take, skip: skip, jwt: msg.jwt })];
                    case 13:
                        subresult = _a.sent();
                        skip += take;
                        result = result.concat(subresult);
                        if (result.length > top_1) {
                            result = result.splice(0, top_1);
                        }
                        _a.label = 14;
                    case 14:
                        if (subresult.length == pageby && result.length < top_1) return [3 /*break*/, 10];
                        _a.label = 15;
                    case 15:
                        if (!Util_1.Util.IsNullEmpty(this.config.resultfield)) {
                            Util_1.Util.SetMessageProperty(msg, this.config.resultfield, result);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 18];
                    case 16:
                        error_2 = _a.sent();
                        Util_1.Util.HandleError(this, error_2, msg);
                        return [3 /*break*/, 18];
                    case 17:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 18: return [2 /*return*/];
                }
            });
        });
    };
    api_get.prototype.onclose = function () {
    };
    return api_get;
}());
exports.api_get = api_get;
var api_add = /** @class */ (function () {
    function api_add(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_add.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, collectionname, entitytype, writeconcern, journal, priority, data, _data, Promises, results, y, i, element, tempresults, errors, i, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, 12, 13]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entitytype")];
                    case 3:
                        entitytype = _a.sent();
                        writeconcern = this.config.writeconcern;
                        journal = this.config.journal;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.writeconcern)) {
                            writeconcern = msg.writeconcern;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.journal)) {
                            journal = msg.journal;
                        }
                        if (writeconcern === undefined || writeconcern === null)
                            writeconcern = 0;
                        if (journal === undefined || journal === null)
                            journal = false;
                        data = [];
                        _data = void 0;
                        if (!(this.config.entities == null && _data == null && this.config.inputfield != null)) return [3 /*break*/, 4];
                        _data = msg[this.config.inputfield];
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 5:
                        _data = _a.sent();
                        if (_data == "payload") {
                            _data = msg["payload"];
                        }
                        _a.label = 6;
                    case 6:
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "processing " + data.length + " items" });
                        Promises = [];
                        results = [];
                        y = 0;
                        _a.label = 7;
                    case 7:
                        if (!(y < data.length)) return [3 /*break*/, 10];
                        for (i = y; i < (y + 50) && i < data.length; i++) {
                            element = data[i];
                            if (!Util_1.Util.IsNullEmpty(entitytype)) {
                                element._type = entitytype;
                            }
                            Promises.push(this.client.InsertOne({ collectionname: collectionname, item: element, w: writeconcern, j: journal, jwt: msg.jwt }));
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                        return [4 /*yield*/, Promise.all(Promises.map(function (p) { return p["catch"](function (e) { return e; }); }))];
                    case 8:
                        tempresults = _a.sent();
                        results = results.concat(tempresults);
                        Promises = [];
                        _a.label = 9;
                    case 9:
                        y += 50;
                        return [3 /*break*/, 7];
                    case 10:
                        data = results;
                        errors = data.filter(function (result) { return Util_1.Util.IsString(result) || (result instanceof Error); });
                        if (errors.length > 0) {
                            for (i = 0; i < errors.length; i++) {
                                Util_1.Util.HandleError(this, errors[i], msg);
                            }
                        }
                        data = data.filter(function (result) { return !Util_1.Util.IsString(result) && !(result instanceof Error); });
                        if (this.config.entities == null && this.config.resultfield != null) {
                            Util_1.Util.SetMessageProperty(msg, this.config.resultfield, data);
                        }
                        else {
                            Util_1.Util.SetMessageProperty(msg, this.config.entities, data);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 13];
                    case 11:
                        error_3 = _a.sent();
                        Util_1.Util.HandleError(this, error_3, msg);
                        return [3 /*break*/, 13];
                    case 12:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    api_add.prototype.onclose = function () {
    };
    return api_add;
}());
exports.api_add = api_add;
var api_addmany = /** @class */ (function () {
    function api_addmany(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_addmany.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, writeconcern, journal, skipresults, priority, collectionname, entitytype, _data, data, results, y, subitems, i, element, _a, _b, error_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        span = null;
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 12, 13, 14]);
                        this.node.status({});
                        writeconcern = this.config.writeconcern;
                        journal = this.config.journal;
                        skipresults = this.config.skipresults;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.writeconcern)) {
                            writeconcern = msg.writeconcern;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.journal)) {
                            journal = msg.journal;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.skipresults)) {
                            skipresults = msg.skipresults;
                        }
                        if (writeconcern === undefined || writeconcern === null)
                            writeconcern = 0;
                        if (journal === undefined || journal === null)
                            journal = false;
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _c.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entitytype")];
                    case 3:
                        entitytype = _c.sent();
                        _data = void 0;
                        if (!(this.config.entities == null && _data == null && this.config.inputfield != null)) return [3 /*break*/, 4];
                        _data = msg[this.config.inputfield];
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 5:
                        _data = _c.sent();
                        _c.label = 6;
                    case 6:
                        data = [];
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        if (!(data.length > 0)) return [3 /*break*/, 11];
                        this.node.status({ fill: "blue", shape: "dot", text: "processing " + data.length + " items" });
                        results = [];
                        y = 0;
                        _c.label = 7;
                    case 7:
                        if (!(y < data.length)) return [3 /*break*/, 10];
                        subitems = [];
                        for (i = y; i < (y + 50) && i < data.length; i++) {
                            element = data[i];
                            if (!Util_1.Util.IsNullEmpty(entitytype)) {
                                element._type = entitytype;
                            }
                            subitems.push(element);
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                        _b = (_a = results).concat;
                        return [4 /*yield*/, this.client.InsertMany({ collectionname: collectionname, items: subitems, w: writeconcern, j: journal, skipresults: skipresults, jwt: msg.jwt })];
                    case 8:
                        results = _b.apply(_a, [_c.sent()]);
                        _c.label = 9;
                    case 9:
                        y += 50;
                        return [3 /*break*/, 7];
                    case 10:
                        data = results;
                        _c.label = 11;
                    case 11:
                        if (this.config.entities == null && this.config.resultfield != null) {
                            Util_1.Util.SetMessageProperty(msg, this.config.resultfield, data);
                        }
                        else {
                            Util_1.Util.SetMessageProperty(msg, this.config.entities, data);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 14];
                    case 12:
                        error_4 = _c.sent();
                        Util_1.Util.HandleError(this, error_4, msg);
                        return [3 /*break*/, 14];
                    case 13:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    api_addmany.prototype.onclose = function () {
    };
    return api_addmany;
}());
exports.api_addmany = api_addmany;
var api_update = /** @class */ (function () {
    function api_update(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_update.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, entitytype, collectionname, _data, writeconcern, journal, priority, data, Promises, results, y, items, i, element, tempresults, errors, i, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, 12, 13]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entitytype")];
                    case 2:
                        entitytype = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 3:
                        collectionname = _a.sent();
                        _data = void 0;
                        if (!(this.config.entities == null && _data == null && this.config.inputfield != null)) return [3 /*break*/, 4];
                        _data = msg[this.config.inputfield];
                        return [3 /*break*/, 6];
                    case 4: return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 5:
                        _data = _a.sent();
                        _a.label = 6;
                    case 6:
                        writeconcern = this.config.writeconcern;
                        journal = this.config.journal;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.writeconcern)) {
                            writeconcern = msg.writeconcern;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.journal)) {
                            journal = msg.journal;
                        }
                        if (writeconcern === undefined || writeconcern === null)
                            writeconcern = 0;
                        if (journal === undefined || journal === null)
                            journal = false;
                        data = [];
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
                        Promises = [];
                        results = [];
                        y = 0;
                        _a.label = 7;
                    case 7:
                        if (!(y < data.length)) return [3 /*break*/, 10];
                        items = [];
                        for (i = y; i < (y + 50) && i < data.length; i++) {
                            element = data[i];
                            if (!Util_1.Util.IsNullEmpty(entitytype)) {
                                element._type = entitytype;
                            }
                            items.push(element);
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                        return [4 /*yield*/, this.client.InsertOrUpdateMany({ collectionname: collectionname, uniqeness: "_id", items: items, skipresults: false, j: journal, w: writeconcern, jwt: msg.jwt })];
                    case 8:
                        tempresults = _a.sent();
                        results = results.concat(tempresults);
                        _a.label = 9;
                    case 9:
                        y += 50;
                        return [3 /*break*/, 7];
                    case 10:
                        data = results;
                        errors = data.filter(function (result) { return Util_1.Util.IsString(result) || (result instanceof Error); });
                        if (errors.length > 0) {
                            for (i = 0; i < errors.length; i++) {
                                Util_1.Util.HandleError(this, errors[i], msg);
                            }
                            return [2 /*return*/];
                        }
                        data = data.filter(function (result) { return !Util_1.Util.IsString(result) && !(result instanceof Error); });
                        if (this.config.entities == null && this.config.resultfield != null) {
                            Util_1.Util.SetMessageProperty(msg, this.config.resultfield, data);
                        }
                        else {
                            Util_1.Util.SetMessageProperty(msg, this.config.entities, data);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 13];
                    case 11:
                        error_5 = _a.sent();
                        Util_1.Util.HandleError(this, error_5, msg);
                        return [3 /*break*/, 13];
                    case 12:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    api_update.prototype.onclose = function () {
    };
    return api_update;
}());
exports.api_update = api_update;
var api_addorupdate = /** @class */ (function () {
    function api_addorupdate(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_addorupdate.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, collectionname, entitytype, uniqeness, _data, writeconcern, journal, priority, data, Promises, results, skipresults, y, items, i, element, tempresults, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 12, 13, 14]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entitytype")];
                    case 3:
                        entitytype = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "uniqeness")];
                    case 4:
                        uniqeness = _a.sent();
                        _data = void 0;
                        if (!(this.config.entities == null && _data == null && this.config.inputfield != null)) return [3 /*break*/, 5];
                        _data = msg[this.config.inputfield];
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 6:
                        _data = _a.sent();
                        _a.label = 7;
                    case 7:
                        writeconcern = this.config.writeconcern;
                        journal = this.config.journal;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.writeconcern)) {
                            writeconcern = msg.writeconcern;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.journal)) {
                            journal = msg.journal;
                        }
                        if (writeconcern === undefined || writeconcern === null)
                            writeconcern = 0;
                        if (journal === undefined || journal === null)
                            journal = false;
                        data = [];
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
                        Promises = [];
                        results = [];
                        skipresults = false;
                        if (Util_1.Util.IsNullEmpty(this.config.entities) && this.config.entitiestype == "msg") {
                            skipresults = true;
                        }
                        y = 0;
                        _a.label = 8;
                    case 8:
                        if (!(y < data.length)) return [3 /*break*/, 11];
                        items = [];
                        for (i = y; i < (y + 50) && i < data.length; i++) {
                            element = data[i];
                            if (!Util_1.Util.IsNullEmpty(entitytype)) {
                                element._type = entitytype;
                            }
                            items.push(element);
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                        return [4 /*yield*/, this.client.InsertOrUpdateMany({ collectionname: collectionname, uniqeness: uniqeness, items: items, skipresults: skipresults, j: journal, w: writeconcern, jwt: msg.jwt })];
                    case 9:
                        tempresults = _a.sent();
                        results = results.concat(tempresults);
                        _a.label = 10;
                    case 10:
                        y += 50;
                        return [3 /*break*/, 8];
                    case 11:
                        if (!skipresults) {
                            Util_1.Util.SetMessageProperty(msg, this.config.entities, results);
                        }
                        // const errors = data.filter(result => Util.IsString(result) || (result instanceof Error));
                        // if (errors.length > 0) {
                        //     for (let i: number = 0; i < errors.length; i++) {
                        //         Util.HandleError(this, errors[i], msg);
                        //     }
                        // }
                        // data = data.filter(result => !Util.IsString(result) && !(result instanceof Error));
                        // if (this.config.entities == null && this.config.resultfield != null) {
                        //     Util.SetMessageProperty(msg, this.config.resultfield, data);
                        // } else {
                        //     Util.SetMessageProperty(msg, this.config.entities, data);
                        // }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 14];
                    case 12:
                        error_6 = _a.sent();
                        Util_1.Util.HandleError(this, error_6, msg);
                        return [3 /*break*/, 14];
                    case 13:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    api_addorupdate.prototype.onclose = function () {
    };
    return api_addorupdate;
}());
exports.api_addorupdate = api_addorupdate;
var api_delete = /** @class */ (function () {
    function api_delete(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_delete.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, collectionname, _data, priority, data, Promises, results, y, i, element, id, tempresults, errors, i, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, 11, 12]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _a.sent();
                        _data = void 0;
                        if (!(this.config.entities == null && _data == null && this.config.inputfield != null)) return [3 /*break*/, 3];
                        _data = msg[this.config.inputfield];
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 4:
                        _data = _a.sent();
                        _a.label = 5;
                    case 5:
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        data = [];
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
                        Promises = [];
                        results = [];
                        y = 0;
                        _a.label = 6;
                    case 6:
                        if (!(y < data.length)) return [3 /*break*/, 9];
                        for (i = y; i < (y + 50) && i < data.length; i++) {
                            element = data[i];
                            id = element;
                            if (Util_1.Util.isObject(element)) {
                                id = element._id;
                            }
                            Promises.push(this.client.DeleteOne({ collectionname: collectionname, id: id, jwt: msg.jwt }));
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                        return [4 /*yield*/, Promise.all(Promises.map(function (p) { return p["catch"](function (e) { return e; }); }))];
                    case 7:
                        tempresults = _a.sent();
                        results = results.concat(tempresults);
                        Promises = [];
                        _a.label = 8;
                    case 8:
                        y += 50;
                        return [3 /*break*/, 6];
                    case 9:
                        data = results;
                        errors = data.filter(function (result) { return Util_1.Util.IsString(result) || (result instanceof Error); });
                        if (errors.length > 0) {
                            for (i = 0; i < errors.length; i++) {
                                Util_1.Util.HandleError(this, errors[i], msg);
                            }
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 12];
                    case 10:
                        error_7 = _a.sent();
                        Util_1.Util.HandleError(this, error_7, msg);
                        return [3 /*break*/, 12];
                    case 11:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    api_delete.prototype.onclose = function () {
    };
    return api_delete;
}());
exports.api_delete = api_delete;
var api_deletemany = /** @class */ (function () {
    function api_deletemany(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_deletemany.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, priority, collectionname, query, ids, _data, i, id, affectedrows, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        this.node.status({});
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "query")];
                    case 3:
                        query = _a.sent();
                        ids = null;
                        if (Array.isArray(query)) {
                            if (query.length == 0) {
                                this.node.send(msg);
                                this.node.status({ fill: "green", shape: "dot", text: "Empty array received" });
                                return [2 /*return*/];
                            }
                            _data = query;
                            ids = [];
                            for (i = 0; i < _data.length; i++) {
                                id = _data[i];
                                if (Util_1.Util.isObject(_data[i])) {
                                    id = _data[i]._id;
                                }
                                ids.push(id);
                            }
                            query = null;
                        }
                        if (ids && ids.length > 0) {
                            query = { "_id": { "$in": ids } };
                            // throw new Error("ID's no longer supportd, use query!")
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
                        return [4 /*yield*/, this.client.DeleteMany({ collectionname: collectionname, query: query, jwt: msg.jwt })];
                    case 4:
                        affectedrows = _a.sent();
                        this.node.send(msg);
                        this.node.status({ fill: "green", shape: "dot", text: "deleted " + affectedrows + " rows" });
                        return [3 /*break*/, 7];
                    case 5:
                        error_8 = _a.sent();
                        Util_1.Util.HandleError(this, error_8, msg);
                        return [3 /*break*/, 7];
                    case 6:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    api_deletemany.prototype.onclose = function () {
    };
    return api_deletemany;
}());
exports.api_deletemany = api_deletemany;
function get_api_roles(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, result, error_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    query = { _type: "role" };
                    if (!Util_1.Util.IsNullEmpty(req.query.name)) {
                        query = { _type: "role", name: { $regex: ".*" + req.query.name + ".*" } };
                    }
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: query, projection: { name: 1 }, orderby: { name: -1 }, top: 1000 })];
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
exports.get_api_roles = get_api_roles;
function get_api_userroles(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, ors, q, result_1, list, list, exists, result2, error_10;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 9, , 10]);
                    query = { $or: [{ _type: "role" }, { _type: "user" }] };
                    ors = [];
                    q = null;
                    if (!Util_1.Util.IsNullEmpty(req.query.name)) {
                        q = { "$or": [{ name: req.query.name }, { username: req.query.name }, { email: req.query.name }] };
                        ors.push({
                            "$or": [
                                { name: new RegExp([req.query.name].join(""), "i") },
                                { email: new RegExp([req.query.name].join(""), "i") },
                                { username: new RegExp([req.query.name].join(""), "i") }
                            ]
                        });
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
                                { $or: [{ _type: "role" }, { _type: "user" }] },
                                { $or: ors }
                            ]
                        };
                    }
                    result_1 = [];
                    if (!(q != null)) return [3 /*break*/, 2];
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: q, projection: { name: 1 }, orderby: { name: -1 } })];
                case 1:
                    result_1 = _a.sent();
                    _a.label = 2;
                case 2:
                    if (!(result_1.length == 1)) return [3 /*break*/, 4];
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: query, projection: { name: 1 }, orderby: { name: -1 } })];
                case 3:
                    list = _a.sent();
                    list = list.map(function (x) { return x._id != result_1[0]._id; });
                    result_1 = result_1.concat(list);
                    return [3 /*break*/, 6];
                case 4: return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: query, projection: { name: 1 }, orderby: { name: -1 } })];
                case 5:
                    list = _a.sent();
                    result_1 = result_1.concat(list);
                    _a.label = 6;
                case 6:
                    if (!!Util_1.Util.IsNullEmpty(req.query.id)) return [3 /*break*/, 8];
                    exists = result_1.filter(function (x) { return x._id == req.query.id; });
                    if (!(exists.length == 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: { _id: req.query.id }, projection: { name: 1 }, orderby: { name: -1 }, top: 1 })];
                case 7:
                    result2 = _a.sent();
                    if (result2.length == 1) {
                        result_1.push(result2[0]);
                    }
                    _a.label = 8;
                case 8:
                    res.json(result_1);
                    return [3 /*break*/, 10];
                case 9:
                    error_10 = _a.sent();
                    err(error_10);
                    res.status(500).json(error_10);
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    });
}
exports.get_api_userroles = get_api_userroles;
function get_api_users(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var query, ors, result, exists, result2, error_11;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    query = { _type: "user" };
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
                                { _type: "user" },
                                { $or: ors }
                            ]
                        };
                    }
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: query, projection: { name: 1 }, orderby: { name: -1 } })];
                case 1:
                    result = _a.sent();
                    if (!!Util_1.Util.IsNullEmpty(req.query.id)) return [3 /*break*/, 3];
                    exists = result.filter(function (x) { return x._id == req.query.id; });
                    if (!(exists.length == 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, Util_1.Util.client.Query({ collectionname: 'users', query: { _id: req.query.id }, projection: { name: 1 }, orderby: { name: -1 }, top: 1 })];
                case 2:
                    result2 = _a.sent();
                    if (result2.length == 1) {
                        result.push(result2[0]);
                    }
                    _a.label = 3;
                case 3:
                    res.json(result);
                    return [3 /*break*/, 5];
                case 4:
                    error_11 = _a.sent();
                    res.status(500).json(error_11);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.get_api_users = get_api_users;
var api_updatedocument = /** @class */ (function () {
    function api_updatedocument(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_updatedocument.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, collectionname, query, updatedocument, action, writeconcern, journal, jwt, priority, q2, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "query")];
                    case 3:
                        query = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "updatedocument")];
                    case 4:
                        updatedocument = _a.sent();
                        action = this.config.action;
                        writeconcern = this.config.writeconcern;
                        journal = this.config.journal;
                        jwt = msg.jwt;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.action)) {
                            action = msg.action;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.writeconcern)) {
                            writeconcern = msg.writeconcern;
                        }
                        if (!Util_1.Util.IsNullEmpty(msg.journal)) {
                            journal = msg.journal;
                        }
                        if (writeconcern === undefined || writeconcern === null)
                            writeconcern = 0;
                        if (journal === undefined || journal === null)
                            journal = false;
                        if (!Util_1.Util.IsNullEmpty(query) && Util_1.Util.IsString(query)) {
                            query = JSON.parse(query);
                        }
                        if (!Util_1.Util.IsNullEmpty(updatedocument) && Util_1.Util.IsString(updatedocument)) {
                            updatedocument = JSON.parse(updatedocument);
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Running Update Document" });
                        return [4 /*yield*/, this.client.UpdateDocument({ collectionname: collectionname, document: updatedocument, query: query, w: writeconcern, j: journal, jwt: msg.jwt })];
                    case 5:
                        q2 = _a.sent();
                        msg.payload = q2;
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 8];
                    case 6:
                        error_12 = _a.sent();
                        Util_1.Util.HandleError(this, error_12, msg);
                        return [3 /*break*/, 8];
                    case 7:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    api_updatedocument.prototype.onclose = function () {
    };
    return api_updatedocument;
}());
exports.api_updatedocument = api_updatedocument;
var grant_permission = /** @class */ (function () {
    function grant_permission(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    grant_permission.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, priority, targetid, bits, i, result, found, data, _data, i, metadata, entity, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, 9, 10]);
                        this.node.status({});
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        targetid = "";
                        if (this.config.targetid == "from msg.targetid" || Util_1.Util.IsNullEmpty(this.config.targetid)) {
                            targetid = msg.targetid;
                        }
                        else {
                            targetid = this.config.targetid;
                        }
                        if (Util_1.Util.IsNullEmpty(targetid)) {
                            throw new Error("targetid is null or empty");
                        }
                        bits = this.config.bits;
                        if (!Util_1.Util.IsNullUndefinded(msg.bits)) {
                            bits = msg.bits;
                        }
                        if (Util_1.Util.IsNullUndefinded(bits)) {
                            throw new Error("bits is null or empty");
                        }
                        if (!Array.isArray(this.config.bits)) {
                            this.config.bits = this.config.bits.split(',');
                        }
                        for (i = 0; i < this.config.bits.length; i++) {
                            this.config.bits[i] = parseInt(this.config.bits[i]);
                        }
                        return [4 /*yield*/, this.client.Query({ collectionname: 'users', query: { _id: targetid }, projection: { name: 1 }, orderby: { name: -1 }, top: 1, jwt: msg.jwt })];
                    case 2:
                        result = _a.sent();
                        if (result.length === 0) {
                            return [2 /*return*/, Util_1.Util.HandleError(this, "Target " + targetid + " not found ", msg)];
                        }
                        found = result[0];
                        data = [];
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 3:
                        _data = _a.sent();
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < data.length)) return [3 /*break*/, 7];
                        if (Util_1.Util.IsNullEmpty(data[i]._type) && !Util_1.Util.IsNullUndefinded(data[i].metadata)) {
                            metadata = data[i].metadata;
                            nodeapi_2.Base.addRight(metadata, targetid, found.name, this.config.bits);
                            data[i].metadata = metadata;
                        }
                        else {
                            entity = data[i];
                            nodeapi_2.Base.addRight(entity, targetid, found.name, this.config.bits);
                            data[i] = entity;
                        }
                        if (!((i % 50) == 0 && i > 0)) return [3 /*break*/, 6];
                        this.node.status({ fill: "blue", shape: "dot", text: "processed " + i + " of " + data.length });
                        return [4 /*yield*/, Util_1.Util.Delay(50)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7:
                        Util_1.Util.saveToObject(msg, this.config.entities, data);
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 10];
                    case 8:
                        error_13 = _a.sent();
                        Util_1.Util.HandleError(this, error_13, msg);
                        return [3 /*break*/, 10];
                    case 9:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    grant_permission.prototype.onclose = function () {
    };
    return grant_permission;
}());
exports.grant_permission = grant_permission;
var revoke_permission = /** @class */ (function () {
    function revoke_permission(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    revoke_permission.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, targetid_1, bits, i, data, _data, i, metadata, entity, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, 4, 5]);
                        this.node.status({});
                        targetid_1 = "";
                        if (this.config.targetid == "from msg.targetid" || Util_1.Util.IsNullEmpty(this.config.targetid)) {
                            targetid_1 = msg.targetid;
                        }
                        else {
                            targetid_1 = this.config.targetid;
                        }
                        if (Util_1.Util.IsNullEmpty(targetid_1)) {
                            throw new Error("targetid is null or empty");
                        }
                        bits = this.config.bits;
                        if (!Util_1.Util.IsNullUndefinded(msg.bits)) {
                            bits = msg.bits;
                        }
                        if (Util_1.Util.IsNullUndefinded(bits)) {
                            throw new Error("bits is null or empty");
                        }
                        if (!Array.isArray(bits)) {
                            bits = bits.split(',');
                        }
                        for (i = 0; i < bits.length; i++) {
                            bits[i] = parseInt(bits[i]);
                        }
                        data = [];
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "entities")];
                    case 2:
                        _data = _a.sent();
                        if (!Util_1.Util.IsNullUndefinded(_data)) {
                            if (!Array.isArray(_data)) {
                                data.push(_data);
                            }
                            else {
                                data = _data;
                            }
                            if (data.length === 0) {
                                this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                            }
                        }
                        else {
                            this.node.warn("Input data is null");
                        }
                        for (i = 0; i < data.length; i++) {
                            if (Util_1.Util.IsNullEmpty(data[i]._type) && !Util_1.Util.IsNullUndefinded(data[i].metadata)) {
                                metadata = data[i].metadata;
                                if (bits.indexOf(-1) > -1) {
                                    metadata._acl = metadata._acl.filter(function (m) { return m._id !== targetid_1; });
                                }
                                else {
                                    nodeapi_2.Base.removeRight(metadata, targetid_1, bits);
                                }
                                data[i].metadata = metadata;
                            }
                            else {
                                entity = data[i];
                                if (bits.indexOf(-1) > -1) {
                                    entity._acl = entity._acl.filter(function (m) { return m._id !== targetid_1; });
                                }
                                else {
                                    nodeapi_2.Base.removeRight(entity, targetid_1, bits);
                                }
                                data[i] = entity;
                            }
                        }
                        Util_1.Util.saveToObject(msg, this.config.entities, data);
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 5];
                    case 3:
                        error_14 = _a.sent();
                        Util_1.Util.HandleError(this, error_14, msg);
                        return [3 /*break*/, 5];
                    case 4:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    revoke_permission.prototype.onclose = function () {
    };
    return revoke_permission;
}());
exports.revoke_permission = revoke_permission;
var download_file = /** @class */ (function () {
    function download_file(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    download_file.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, fileid, filename, asbuffer, jwt, priority, file, result, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "fileid")];
                    case 2:
                        fileid = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "filename", true)];
                    case 3:
                        filename = _a.sent();
                        asbuffer = this.config.asbuffer;
                        if (Util_1.Util.IsNullEmpty(asbuffer))
                            asbuffer = false;
                        asbuffer = Boolean(asbuffer);
                        ;
                        jwt = msg.jwt;
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Getting file" });
                        return [4 /*yield*/, this.client.DownloadFile({ filename: filename, id: fileid, jwt: msg.jwt })];
                    case 4:
                        file = _a.sent();
                        result = null;
                        result = fs.readFileSync(file.filename);
                        // if (asbuffer) {
                        //     var data = Buffer.from(file.file, 'base64');
                        //     result = pako.inflate(data);
                        //     result = Buffer.from(result);
                        // } else {
                        //     result = file.file;
                        // }
                        Util_1.Util.SetMessageProperty(msg, this.config.result, result);
                        Util_1.Util.SetMessageProperty(msg, this.config.filename, file.filename);
                        msg.id = file.id;
                        msg.mimeType = file.mimetype;
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 7];
                    case 5:
                        error_15 = _a.sent();
                        Util_1.Util.HandleError(this, error_15, msg);
                        return [3 /*break*/, 7];
                    case 6:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    download_file.prototype.onclose = function () {
    };
    return download_file;
}());
exports.download_file = download_file;
var upload_file = /** @class */ (function () {
    function upload_file(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    upload_file.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, jwt, filename, mimeType, filecontent, priority, tempfilename, file, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, 7, 8]);
                        this.node.status({});
                        jwt = msg.jwt;
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "filename")];
                    case 2:
                        filename = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "mimeType")];
                    case 3:
                        mimeType = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "content")];
                    case 4:
                        filecontent = _a.sent();
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Saving file" });
                        tempfilename = path.basename(filename);
                        if (fs.existsSync(tempfilename)) {
                            fs.unlinkSync(tempfilename);
                        }
                        fs.writeFileSync(tempfilename, filecontent);
                        return [4 /*yield*/, this.client.UploadFile({ filename: tempfilename, jwt: msg.jwt })];
                    case 5:
                        file = _a.sent();
                        fs.unlinkSync(tempfilename);
                        Util_1.Util.SetMessageProperty(msg, this.config.entity, file);
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 8];
                    case 6:
                        error_16 = _a.sent();
                        Util_1.Util.HandleError(this, error_16, msg);
                        return [3 /*break*/, 8];
                    case 7:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    upload_file.prototype.onclose = function () {
    };
    return upload_file;
}());
exports.upload_file = upload_file;
var api_aggregate = /** @class */ (function () {
    function api_aggregate(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    api_aggregate.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, collectionname, aggregates, priority, result, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        span = null;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, 6, 7]);
                        this.node.status({});
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collection")];
                    case 2:
                        collectionname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "aggregates")];
                    case 3:
                        aggregates = _a.sent();
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        this.node.status({ fill: "blue", shape: "dot", text: "Running aggregate" });
                        return [4 /*yield*/, this.client.Aggregate({ collectionname: collectionname, aggregates: aggregates, jwt: msg.jwt })];
                    case 4:
                        result = _a.sent();
                        msg.payload = result;
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 7];
                    case 5:
                        error_17 = _a.sent();
                        Util_1.Util.HandleError(this, error_17, msg);
                        return [3 /*break*/, 7];
                    case 6:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    api_aggregate.prototype.onclose = function () {
    };
    return api_aggregate;
}());
exports.api_aggregate = api_aggregate;
var api_watch = /** @class */ (function () {
    function api_watch(config) {
        this.config = config;
        this.node = null;
        this.watchid = "";
        this._onsignedin = null;
        this._onsocketclose = null;
        RED.nodes.createNode(this, config);
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
    api_watch.prototype.onsignedin = function () {
        this.connect();
    };
    api_watch.prototype.onsocketclose = function (message) {
        if (message == null)
            message = "";
        if (this != null && this.node != null)
            this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    };
    api_watch.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.node.status({ fill: "blue", shape: "dot", text: "Setting up watch" });
                        if (typeof this.config.aggregates === "string")
                            this.config.aggregates = JSON.parse(this.config.aggregates);
                        _a = this;
                        return [4 /*yield*/, this.client.Watch({ collectionname: this.config.collection, paths: this.config.aggregates }, this.onevent.bind(this))];
                    case 1:
                        _a.watchid = _b.sent();
                        this.node.status({ fill: "green", shape: "dot", text: "watchid " + this.watchid });
                        return [2 /*return*/];
                }
            });
        });
    };
    api_watch.prototype.onevent = function (operation, document) {
        var msg = {
            _msgid: Util_1.Util.GetUniqueIdentifier(),
            payload: document
        };
        // WebServer.log_messages[event._msgid] = new log_message(event._msgid);
        // WebServer.log_messages[event._msgid].traceId = event.traceId;
        // WebServer.log_messages[event._msgid].spanId = event.spanId;
        // log_message.nodestart(event._msgid, this.node.id);
        this.node.send(msg);
    };
    api_watch.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            var error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.node.status({ text: "Closing . . ." });
                        if (!!Util_1.Util.IsNullEmpty(this.watchid)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.client.UnWatch({ id: this.watchid })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_18 = _a.sent();
                        Util_1.Util.HandleError(this, error_18, null);
                        return [3 /*break*/, 4];
                    case 4:
                        this.watchid = null;
                        this.node.status({ text: "Not watching" });
                        this.client.removeListener("signedin", this._onsignedin);
                        this.client.removeListener("disconnected", this._onsocketclose);
                        if (done != null)
                            done();
                        return [2 /*return*/];
                }
            });
        });
    };
    return api_watch;
}());
exports.api_watch = api_watch;
var list_collections = /** @class */ (function () {
    function list_collections(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    list_collections.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var priority, collections, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.node.status({});
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        return [4 /*yield*/, this.client.ListCollections({ jwt: msg.jwt })];
                    case 1:
                        collections = _a.sent();
                        if (!Util_1.Util.IsNullEmpty(this.config.results)) {
                            Util_1.Util.saveToObject(msg, this.config.results, collections);
                        }
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 3];
                    case 2:
                        error_19 = _a.sent();
                        Util_1.Util.HandleError(this, error_19, msg);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    list_collections.prototype.onclose = function () {
    };
    return list_collections;
}());
exports.list_collections = list_collections;
var drop_collection = /** @class */ (function () {
    function drop_collection(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    drop_collection.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var priority, collectionname, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        this.node.status({});
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "collectioname")];
                    case 1:
                        collectionname = _a.sent();
                        return [4 /*yield*/, this.client.DropCollection({ collectionname: collectionname, jwt: msg.jwt })];
                    case 2:
                        _a.sent();
                        this.node.send(msg);
                        this.node.status({});
                        return [3 /*break*/, 4];
                    case 3:
                        error_20 = _a.sent();
                        Util_1.Util.HandleError(this, error_20, msg);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    drop_collection.prototype.onclose = function () {
    };
    return drop_collection;
}());
exports.drop_collection = drop_collection;
var memorydump = /** @class */ (function () {
    function memorydump(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    memorydump.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var span, priority, _a, nodered, openflow, error_21, message;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        span = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, 8, 9]);
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        _a = this.config, nodered = _a.nodered, openflow = _a.openflow;
                        if (!nodered) return [3 /*break*/, 4];
                        this.node.status({ fill: "blue", shape: "dot", text: "Creating heap dump" });
                        // wait one second, to allow the status to be sent
                        return [4 /*yield*/, new Promise(function (resolve) { setTimeout(resolve, 1000); })];
                    case 2:
                        // wait one second, to allow the status to be sent
                        _b.sent();
                        return [4 /*yield*/, this.createheapdump(msg.jwt, span)];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4:
                        if (!openflow) return [3 /*break*/, 6];
                        this.node.status({ fill: "blue", shape: "dot", text: "Running memory dump" });
                        return [4 /*yield*/, this.client.CustomCommand({ command: "heapdump", jwt: msg.jwt })];
                    case 5:
                        _b.sent();
                        _b.label = 6;
                    case 6:
                        this.node.send(msg);
                        if (!nodered) {
                            this.node.status({ fill: "green", shape: "dot", text: "Complete" });
                        }
                        return [3 /*break*/, 9];
                    case 7:
                        error_21 = _b.sent();
                        message = error_21.message ? error_21.message : error_21;
                        // this.node.error(new Error(message), msg);
                        Util_1.Util.HandleError(this, message, msg);
                        this.node.status({ fill: 'red', shape: 'dot' });
                        return [3 /*break*/, 9];
                    case 8:
                        span === null || span === void 0 ? void 0 : span.end();
                        return [7 /*endfinally*/];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    memorydump.prototype.onclose = function () {
    };
    memorydump.prototype.createheapdump = function (jwt, parent) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            // const [traceId, spanId] = Logger.otel.GetTraceSpanId(parent);
            info("createheapdump");
            var hostname = (process.env.HOSTNAME || os.hostname()) || "unknown";
            var filename = "".concat(hostname, ".").concat(Date.now(), ".heapsnapshot");
            var inspector = require('node:inspector');
            var fs = require('node:fs');
            var session = new inspector.Session();
            var fd = fs.openSync(filename, 'w');
            session.connect();
            session.on('HeapProfiler.addHeapSnapshotChunk', function (m) {
                fs.writeSync(fd, m.params.chunk);
            });
            session.post('HeapProfiler.takeHeapSnapshot', null, function (err, r) { return __awaiter(_this, void 0, void 0, function () {
                var savemsg, error_22;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            info("createheapdump completed");
                            try {
                                session.disconnect();
                                fs.closeSync(fd);
                            }
                            catch (error) {
                            }
                            if (err) {
                                reject(err);
                                return [2 /*return*/];
                            }
                            info("Uploading " + filename);
                            this.node.status({ fill: "blue", shape: "dot", text: "Uploading " + filename });
                            return [4 /*yield*/, new Promise(function (resolve) { setTimeout(resolve, 1000); })];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.client.UploadFile({ filename: filename })];
                        case 2:
                            savemsg = _a.sent();
                            info("uploaded " + filename + " as " + savemsg.id);
                            this.node.status({ fill: "green", shape: "dot", text: "Uploaded " + filename });
                            fs.unlinkSync(filename);
                            resolve(savemsg.id);
                            return [3 /*break*/, 4];
                        case 3:
                            error_22 = _a.sent();
                            try {
                                fs.unlinkSync(filename);
                            }
                            catch (error) {
                            }
                            reject(error_22);
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
        });
    };
    return memorydump;
}());
exports.memorydump = memorydump;
var custom = /** @class */ (function () {
    function custom(config) {
        this.config = config;
        this.node = null;
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    custom.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var priority, command, commandname, commandid, result, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        priority = 1;
                        if (!Util_1.Util.IsNullEmpty(msg.priority)) {
                            priority = msg.priority;
                        }
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "command")];
                    case 1:
                        command = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "commandname")];
                    case 2:
                        commandname = _a.sent();
                        return [4 /*yield*/, Util_1.Util.EvaluateNodeProperty(this, msg, "commandid")];
                    case 3:
                        commandid = _a.sent();
                        this.node.status({ fill: "blue", shape: "dot", text: "Send " + command });
                        return [4 /*yield*/, this.client.CustomCommand({ command: command, data: msg.payload, id: commandid, name: commandname, jwt: msg.jwt })];
                    case 4:
                        result = _a.sent();
                        if (this.config.payload == null) {
                            Util_1.Util.SetMessageProperty(msg, this.config.payload, result);
                        }
                        msg.payload = result;
                        this.node.send(msg);
                        this.node.status({ fill: "green", shape: "dot", text: "Complete" });
                        return [3 /*break*/, 6];
                    case 5:
                        error_23 = _a.sent();
                        Util_1.Util.HandleError(this, error_23, msg);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    custom.prototype.onclose = function () {
    };
    return custom;
}());
exports.custom = custom;
//# sourceMappingURL=api_nodes.js.map