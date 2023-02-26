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
var openiap_storage_1 = require("./openiap_storage");
var nodeapi_1 = require("@openiap/nodeapi");
var nodeapi_2 = require("@openiap/nodeapi");
var info = nodeapi_2.config.info, warn = nodeapi_2.config.warn, err = nodeapi_2.config.err;
var path = require("path");
var nodered = require("node-red");
var http = require("http");
var https = require("https");
var cookieParser = require("cookie-parser");
var express = require("express");
var compression = require("compression");
var nodered_settings_1 = require("./nodered_settings");
var Util_1 = require("./nodes/Util");
var RED = nodered;
var server = null;
var app = null;
function get(url, authorization) {
    if (authorization === void 0) { authorization = null; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var provider = http;
                    if (url.startsWith("https")) {
                        // @ts-ignore
                        provider = https;
                    }
                    var uri = new URL(url);
                    var options = {
                        protocol: uri.protocol,
                        port: uri.port,
                        hostname: uri.hostname,
                        path: uri.pathname,
                        headers: { authorization: authorization }
                    };
                    // if(authorization != null && authorization != "") {
                    //   options.headers
                    // }
                    // authorization
                    provider.get(options, function (resp) {
                        var data = "";
                        resp.on("data", function (chunk) {
                            data += chunk;
                        });
                        resp.on("end", function () {
                            resolve(data);
                        });
                    }).on("error", function (error) {
                        err("Error loading url: " + url);
                        reject(error);
                    });
                })];
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, settings, user, session, domain, protocol, externalport, well_known, _a, _b, adminrole, oidc_client_id, oidc_client_secret, options;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    client = new nodeapi_1.openiap();
                    console.log("***************************");
                    console.log("SET CLIENT INFORMATION!!!!!");
                    console.log("***************************");
                    client.agent = "nodered";
                    client.version = require("../package.json").version;
                    Util_1.Util.client = client;
                    if (process.env.NODE_ENV != "production") {
                        nodeapi_2.config.DoDumpToConsole = true;
                        nodeapi_2.config.doDumpMesssages = true;
                    }
                    settings = new nodered_settings_1.nodered_settings();
                    settings.functionGlobalContext.client = client;
                    settings.userDir = path.join(process.cwd(), "data");
                    settings.nodesDir = path.join(__dirname, "nodes");
                    settings.storageModule = new openiap_storage_1.openiap_storage(client);
                    return [4 /*yield*/, client.connect()];
                case 1:
                    user = _c.sent();
                    if (user == null)
                        throw new Error("Missing api url with credentals or jwt token");
                    console.log("Signed in as: " + user.username);
                    if (settings.storageModule.nodered_id == null || settings.storageModule.nodered_id == "") {
                        settings.storageModule.nodered_id = user.username;
                    }
                    app = express();
                    app.disable("x-powered-by");
                    app.use(compression());
                    app.use(express.urlencoded({ limit: '10mb', extended: true }));
                    app.use(express.json({ limit: '10mb' }));
                    app.use(cookieParser());
                    app.set('trust proxy', 1);
                    app.use("/", express.static(path.join(__dirname, "/public")));
                    session = require('express-session');
                    app.use(session({ secret: "supersecret", cookie: { maxAge: 60000 } }));
                    server = http.createServer(app);
                    domain = process.env.domain || "localhost.openiap.io";
                    protocol = process.env.protocol || "http";
                    externalport = process.env.externalport || "";
                    if (externalport != "") {
                        domain = domain + ":" + externalport;
                    }
                    well_known = {
                        userinfo_endpoint: process.env.oidc_userinfo_endpoint,
                        issuer: process.env.oidc_issuer,
                        authorization_endpoint: process.env.oidc_authorization_endpoint,
                        token_endpoint: process.env.oidc_token_endpoint
                    };
                    if (!(process.env.oidc_config != null && process.env.oidc_config != "")) return [3 /*break*/, 3];
                    _b = (_a = JSON).parse;
                    return [4 /*yield*/, get(process.env.oidc_config)];
                case 2:
                    well_known = _b.apply(_a, [_c.sent()]);
                    _c.label = 3;
                case 3:
                    adminrole = process.env.adminrole || "users";
                    oidc_client_id = process.env.oidc_client_id || "agent";
                    oidc_client_secret = process.env.oidc_client_secret || "";
                    options = {
                        issuer: well_known.issuer,
                        authorizationURL: well_known.authorization_endpoint,
                        tokenURL: well_known.token_endpoint,
                        userInfoURL: well_known.userinfo_endpoint,
                        clientID: oidc_client_id,
                        clientSecret: oidc_client_secret,
                        callbackURL: protocol + "://" + domain + '/auth/strategy/callback/',
                        passReqToCallback: true,
                        scope: "openid profile",
                        proxy: true,
                        verify: function (req, issuer, profile, audience, refreshToken, accessToken, params, done) {
                            return __awaiter(this, void 0, void 0, function () {
                                var user, _a, _b, i, role;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0:
                                            user = Util_1.Util.Users.find(function (x) { return x.name == profile.displayName; });
                                            if (!(user == null)) return [3 /*break*/, 2];
                                            _b = (_a = JSON).parse;
                                            return [4 /*yield*/, get(well_known.userinfo_endpoint, "Bearer " + accessToken)];
                                        case 1:
                                            user = _b.apply(_a, [_c.sent()]);
                                            Util_1.Util.Users.push(user);
                                            user.permissions = "read";
                                            if (!user.username && user.name)
                                                user.username = user.name;
                                            if (user.roles) {
                                                for (i = 0; i < user.roles.length; i++) {
                                                    role = user.roles[i];
                                                    if (role == "admins" || role.name == "admins")
                                                        user.permissions = "*";
                                                    if (role == "agent admins" || role.name == "agent admins")
                                                        user.permissions = "*";
                                                    if (role == "nodered admins" || role.name == "nodered admins")
                                                        user.permissions = "*";
                                                    if (role == settings.storageModule.nodered_id + "admins" || role.name == settings.storageModule.nodered_id + "admins")
                                                        user.permissions = "*";
                                                    if (role == settings.storageModule.nodered_id + " admins" || role.name == settings.storageModule.nodered_id + " admins")
                                                        user.permissions = "*";
                                                    if (role == adminrole || role.name == adminrole)
                                                        user.permissions = "*";
                                                }
                                            }
                                            _c.label = 2;
                                        case 2:
                                            done(null, { "username": user.name });
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        }
                    };
                    // useAuthorizationHeaderForToken
                    settings.adminAuth = {
                        type: "strategy",
                        strategy: {
                            name: "openidconnect",
                            label: 'OpenID Connect',
                            icon: "fa-cloud",
                            strategy: require("passport-openidconnect").Strategy,
                            options: options
                        },
                        users: function (user) {
                            var res = Util_1.Util.Users.find(function (x) { return x.name == user; });
                            if (res)
                                return Promise.resolve(res);
                            return Promise.resolve();
                        }
                    };
                    settings.adminAuth.strategy.autoLogin = true;
                    return [4 /*yield*/, RED.init(server, settings)];
                case 4:
                    _c.sent();
                    app.use(settings.httpAdminRoot, RED.httpAdmin);
                    app.use(settings.httpNodeRoot, RED.httpNode);
                    server.listen(settings.uiPort).on('error', function (error) {
                        console.error(error);
                        server.close();
                        process.exit(404);
                    });
                    RED.start();
                    return [2 /*return*/];
            }
        });
    });
}
main();
//# sourceMappingURL=main.js.map