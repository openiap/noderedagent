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
exports.middlewareauth = exports.CachedUser = void 0;
var nodeapi_1 = require("@openiap/nodeapi");
var info = nodeapi_1.config.info, warn = nodeapi_1.config.warn, err = nodeapi_1.config.err;
var Util_1 = require("./nodes/Util");
var CachedUser = /** @class */ (function () {
    function CachedUser(user, jwt) {
        this.user = user;
        this.jwt = jwt;
        this.firstsignin = new Date();
    }
    return CachedUser;
}());
exports.CachedUser = CachedUser;
var middlewareauth = exports.middlewareauth = /** @class */ (function () {
    function middlewareauth() {
    }
    middlewareauth.getUser = function (authorization) {
        var res = this.authorizationCache[authorization];
        if (res === null || res === undefined)
            return null;
        var begin = res.firstsignin.getTime();
        var end = new Date().getTime();
        var seconds = Math.round((end - begin) / 1000);
        if (seconds < middlewareauth.credential_cache_seconds) {
            return res;
        }
        delete this.authorizationCache[authorization];
        return null;
    };
    middlewareauth.process = function (client, req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var authorization, cacheduser, token, result, user, allowed, error_1, b64auth, login, password, result, user, allowed, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        authorization = req.headers.authorization;
                        cacheduser = this.getUser(authorization);
                        if (cacheduser != null) {
                            req.user = cacheduser.user;
                            req.user.jwt = cacheduser.jwt;
                            return [2 /*return*/, next()];
                        }
                        if (!(!Util_1.Util.IsNullEmpty(authorization) && authorization.indexOf(" ") > 1 &&
                            (authorization.toLocaleLowerCase().startsWith("bearer") || authorization.toLocaleLowerCase().startsWith("jwt")))) return [3 /*break*/, 5];
                        token = authorization.split(" ")[1];
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, client.Signin({ jwt: token, validateonly: true })];
                    case 2:
                        result = _b.sent();
                        if (result.user != null) {
                            user = result.user;
                            allowed = user.roles.filter(function (x) { return x.name == "nodered api users" || (x.name == middlewareauth.api_role && !Util_1.Util.IsNullEmpty(middlewareauth.api_role)); });
                            if (allowed.length > 0 && !Util_1.Util.IsNullEmpty(allowed[0].name)) {
                                cacheduser = new CachedUser(result.user, result.jwt);
                                this.authorizationCache[authorization] = cacheduser;
                                info("Authorized " + user.username + " for " + req.url);
                                req.user = cacheduser.user;
                                req.user.jwt = cacheduser.jwt;
                                return [2 /*return*/, next()];
                            }
                            else {
                                warn(user.username + " is not member of 'nodered api users' for " + req.url);
                            }
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error(error_1);
                        return [2 /*return*/];
                    case 4:
                        res.statusCode = 401;
                        res.end('Unauthorized');
                        return [2 /*return*/];
                    case 5:
                        b64auth = (authorization || '').split(' ')[1] || '';
                        login = (_a = Buffer.from(b64auth, "base64").toString().split(':'), _a[0]), password = _a[1];
                        if (!(login && password)) return [3 /*break*/, 11];
                        _b.label = 6;
                    case 6:
                        _b.trys.push([6, 9, , 10]);
                        return [4 /*yield*/, client.Signin({ username: login, password: password, validateonly: true })];
                    case 7: return [4 /*yield*/, _b.sent()];
                    case 8:
                        result = _b.sent();
                        if (result.user != null) {
                            user = result.user;
                            allowed = user.roles.filter(function (x) { return x.name == "nodered api users" || (x.name == middlewareauth.api_role && !Util_1.Util.IsNullEmpty(middlewareauth.api_role)); });
                            if (allowed.length > 0 && !Util_1.Util.IsNullEmpty(allowed[0].name)) {
                                cacheduser = new CachedUser(result.user, result.jwt);
                                this.authorizationCache[authorization] = cacheduser;
                                info("Authorized " + user.username + " for " + req.url);
                                req.user = cacheduser.user;
                                req.user.jwt = cacheduser.jwt;
                                return [2 /*return*/, next()];
                            }
                            else {
                                warn(user.username + " is not member of 'nodered api users' for " + req.url);
                            }
                        }
                        else {
                            console.warn("noderedcontribmiddlewareauth: failed locating user for " + req.url);
                        }
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _b.sent();
                        console.error(error_2);
                        return [3 /*break*/, 10];
                    case 10: return [3 /*break*/, 12];
                    case 11:
                        warn("Unauthorized, no username/password for " + req.url);
                        _b.label = 12;
                    case 12:
                        res.statusCode = 401;
                        res.setHeader('WWW-Authenticate', 'Basic realm="OpenFlow"');
                        res.end('Unauthorized');
                        return [2 /*return*/];
                }
            });
        });
    };
    middlewareauth.authorizationCache = {};
    middlewareauth.credential_cache_seconds = 300;
    middlewareauth.api_role = "";
    return middlewareauth;
}());
//# sourceMappingURL=middlewareauth.js.map