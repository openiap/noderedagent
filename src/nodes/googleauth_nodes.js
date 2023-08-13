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
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleauth_request = exports.googleauth_credentials = void 0;
var RED = require("node-red");
var Util_1 = require("./Util");
var _a = require('google-auth-library'), GoogleAuth = _a.GoogleAuth, OAuth2Client = _a.OAuth2Client;
var fs = require("fs");
// const request = require('request');
var request = require("request");
function GetGoogleAuthClient(config) {
    var result = {
        auth: null,
        Client: null
    };
    if (config != null) {
        if (typeof config.serviceaccount === "string" && !Util_1.Util.IsNullEmpty(config.serviceaccount)) {
            config.serviceaccount = JSON.parse(config.serviceaccount);
        }
        if (!Util_1.Util.IsNullEmpty(config.serviceaccount)) {
            result.auth = new GoogleAuth({
                scopes: config.scopes.split(",").join(" "),
                credentials: config.serviceaccount
            });
        }
        if (!Util_1.Util.IsNullEmpty(config.clientid) || !Util_1.Util.IsNullEmpty(config.clientsecret) || !Util_1.Util.IsNullEmpty(config.redirecturi)) {
            result.Client = new OAuth2Client(config.clientid, config.clientsecret, config.redirecturi);
            if (!Util_1.Util.IsNullEmpty(config.tokens)) {
                result.Client.setCredentials(JSON.parse(config.tokens));
            }
        }
    }
    return result;
}
var googleauth_credentials = /** @class */ (function () {
    function googleauth_credentials(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.clientid = "";
        this.clientsecret = "";
        this.redirecturi = "";
        this.scopes = "";
        this.code = "";
        this.tokens = "";
        this.serviceaccount = "";
        this.apikey = "";
        this.authtype = "";
        this.username = "";
        this.password = "";
        RED.nodes.createNode(this, config);
        this.node = this;
        this.node.status({});
        this.name = this.config.name;
        this.authtype = this.config.authtype;
        if (this.node.credentials && this.node.credentials.hasOwnProperty("clientid")) {
            this.clientid = this.node.credentials.clientid;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("clientsecret")) {
            this.clientsecret = this.node.credentials.clientsecret;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("redirecturi")) {
            this.redirecturi = this.node.credentials.redirecturi;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("scopes")) {
            this.scopes = this.node.credentials.scopes;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("code")) {
            this.code = this.node.credentials.code;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("tokens")) {
            this.tokens = this.node.credentials.tokens;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("serviceaccount")) {
            this.serviceaccount = this.node.credentials.serviceaccount;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("apikey")) {
            this.apikey = this.node.credentials.apikey;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("username")) {
            this.username = this.node.credentials.username;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("password")) {
            this.password = this.node.credentials.password;
        }
        this.init();
    }
    googleauth_credentials.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var me, oAuth2Client, authorizeUrl, googleauthGetURL, googleauthCode, googleauthSetCode, removeRoute;
            return __generator(this, function (_a) {
                if (Util_1.Util.IsNullEmpty(this.clientid) || Util_1.Util.IsNullEmpty(this.clientsecret) || Util_1.Util.IsNullEmpty(this.redirecturi))
                    return [2 /*return*/];
                me = this;
                oAuth2Client = new OAuth2Client(this.clientid, this.clientsecret, this.redirecturi);
                if (!Util_1.Util.IsNullEmpty(this.tokens)) {
                    oAuth2Client.setCredentials(JSON.parse(this.tokens));
                    return [2 /*return*/];
                }
                authorizeUrl = oAuth2Client.generateAuthUrl({
                    access_type: 'offline',
                    scope: this.scopes.split(",").join(" ")
                });
                googleauthGetURL = function googleauthGetURL(req, res) {
                    try {
                        me.clientid = req.query.clientid;
                        me.redirecturi = req.query.redirecturi;
                        if (req.query.clientsecret != '__PWRD__')
                            me.clientsecret = req.query.clientsecret;
                        //
                        oAuth2Client = new OAuth2Client(me.clientid, me.clientsecret, me.redirecturi);
                        authorizeUrl = oAuth2Client.generateAuthUrl({
                            access_type: 'offline',
                            scope: req.query.scopes.split(",").join(" ")
                        });
                        RED.httpAdmin.get('/googleauth-code', googleauthCode);
                        RED.httpAdmin.get('/googleauth-set-code', googleauthSetCode);
                        res.json({ url: authorizeUrl });
                    }
                    catch (error) {
                        res.status(500).send(error);
                    }
                };
                googleauthCode = function googleauthCode(req, res) {
                    var code = req.query.code;
                    res.json({ code: code });
                };
                googleauthSetCode = function googleauthSetCode(req, res) {
                    return __awaiter(this, void 0, void 0, function () {
                        var code, r, error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    code = req.query.code;
                                    return [4 /*yield*/, oAuth2Client.getToken(code)];
                                case 1:
                                    r = _a.sent();
                                    // Make sure to set the credentials on the OAuth2 client.
                                    oAuth2Client.setCredentials(r.tokens);
                                    res.json({ tokens: r.tokens });
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    res.status(500).send(error_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    });
                };
                removeRoute = function (route, i, routes) {
                    if (route.handle.name == "googleauthGetURL" || route.handle.name == "googleauthCode" || route.handle.name == "googleauthSetCode") {
                        routes.splice(i, 1);
                    }
                    if (route.route)
                        route.route.stack.forEach(removeRoute);
                };
                RED.httpAdmin._router.stack.forEach(removeRoute);
                RED.httpAdmin.get('/googleauth-get-' + this.node.id, googleauthGetURL);
                return [2 /*return*/];
            });
        });
    };
    return googleauth_credentials;
}());
exports.googleauth_credentials = googleauth_credentials;
var googleauth_request = /** @class */ (function () {
    function googleauth_request(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.method = "";
        this.url = "";
        this.auth = null;
        this.Client = null;
        try {
            RED.nodes.createNode(this, config);
            this.node = this;
            this.name = config.name;
            this.node.status({ fill: "blue", shape: "dot", text: "Initializing" });
            this._config = RED.nodes.getNode(this.config.config);
            this.method = this.config.method;
            this.url = this.config.url;
            if (this.config.ignoretls != null) {
                this.ignoretls = Util_1.Util.parseBoolean(this.config.ignoretls);
            }
            else {
                this.ignoretls = false;
            }
            if (this.config.asjson != null) {
                this.asjson = Util_1.Util.parseBoolean(this.config.asjson);
            }
            else {
                this.asjson = true;
            }
            var cli = GetGoogleAuthClient(this._config);
            this.Client = cli.Client;
            this.auth = cli.auth;
            this.node.on('input', this.oninput);
            this.node.status({});
        }
        catch (error) {
            Util_1.Util.HandleError(this, error, null);
        }
    }
    googleauth_request.prototype.oninput = function (msg, send, done) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, url, options, res, error_2;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 6, , 7]);
                        this.node.status({ fill: "blue", shape: "dot", text: "Getting client" });
                        if (!(this.auth != null)) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.auth.getClient()];
                    case 1:
                        _a.Client = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!Util_1.Util.IsNullEmpty(msg.method))
                            this.method = msg.method;
                        if (!Util_1.Util.IsNullEmpty(msg.url))
                            this.url = msg.url;
                        if (Util_1.Util.IsNullEmpty(this.method))
                            this.method = msg.method;
                        if (Util_1.Util.IsNullEmpty(this.method))
                            this.method = "GET";
                        if (Util_1.Util.IsNullEmpty(this.url))
                            this.url = msg.url;
                        if (Util_1.Util.IsNullEmpty(this.url))
                            throw new Error("url is mandaotry");
                        url = this.url;
                        if (!Util_1.Util.IsNullUndefinded(this._config) && this._config.authtype == "apikey" && !Util_1.Util.IsNullEmpty(this._config.apikey)) {
                            if (url.indexOf("?") > -1) {
                                url = url + "&key=" + this._config.apikey;
                            }
                            else {
                                url = url + "?key=" + this._config.apikey;
                            }
                        }
                        options = {
                            method: this.method,
                            url: url,
                            data: msg.payload,
                            rejectUnauthorized: (!this.ignoretls)
                            // data: {
                            //     payload: msg.payload
                            // }
                        };
                        if (this.method == "GET")
                            delete options.data;
                        this.node.status({ fill: "blue", shape: "dot", text: "Requesting" });
                        if (!(this.Client != null)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.Client.request(options)];
                    case 3:
                        res = _b.sent();
                        msg.status = res.status;
                        msg.statusText = res.statusText;
                        msg.payload = res.data;
                        this.node.status({});
                        send(msg);
                        done();
                        return [3 /*break*/, 5];
                    case 4:
                        if (!Util_1.Util.IsNullUndefinded(this._config) && this._config.authtype == "username") {
                            if (!Util_1.Util.IsNullEmpty(this._config.username)) {
                                options.headers = {};
                                options.headers["Authorization"] = "Basic " + new Buffer(this._config.username + ":" + this._config.password).toString("base64");
                            }
                        }
                        if (this.asjson) {
                            options.body = options.data;
                            options.json = true;
                            delete options.data;
                        }
                        request(options, function (error, response, body) {
                            if (error) {
                                Util_1.Util.HandleError(_this, error, msg);
                                return done();
                            }
                            msg.payload = body;
                            msg.status = response.statusCode;
                            msg.statusText = response.statusText;
                            _this.node.status({});
                            send(msg);
                            done();
                        });
                        _b.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        done();
                        Util_1.Util.HandleError(this, error_2, msg);
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    googleauth_request.prototype.onclose = function () {
    };
    return googleauth_request;
}());
exports.googleauth_request = googleauth_request;
//# sourceMappingURL=googleauth_nodes.js.map