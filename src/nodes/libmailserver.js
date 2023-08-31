"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.libmailserver = void 0;
var events_1 = require("events");
var nodeapi_1 = require("@openiap/nodeapi");
var info = nodeapi_1.config.info, warn = nodeapi_1.config.warn, err = nodeapi_1.config.err;
var test = require('@nodemailer/mailparser2');
var simpleParser = test.SimpleParser;
var libmailserver = /** @class */ (function (_super) {
    __extends(libmailserver, _super);
    function libmailserver() {
        return _super.call(this) || this;
    }
    libmailserver.prototype.onMailFrom = function (address, session, callback) {
        // session.xForward is a Map structure
        try {
            //config.log(4, 'XFORWARD ADDR=%s', session.xForward.get('ADDR'));
        }
        catch (err) {
            err(err);
        }
        callback();
    };
    libmailserver.prototype.onRcptTo = function (address, session, callback) {
        return callback(); // Accept the address
    };
    libmailserver.prototype.onData = function (stream, session, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var mail;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, simpleParser(stream)];
                    case 1:
                        mail = _a.sent();
                        libmailserver.current.emit('email', mail);
                        callback();
                        return [2 /*return*/];
                }
            });
        });
    };
    libmailserver.prototype.onAuth = function (auth, session, callback) {
        callback(null, { user: 123 }); // where 123 is the user id or similar property
    };
    libmailserver.setupSMTP = function (port) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var SMTPServer_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (libmailserver.current) {
                            info('Smtpserver is allready listening on ' + port);
                            return [2 /*return*/, resolve(libmailserver.current)];
                        }
                        libmailserver.current = new libmailserver();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        SMTPServer_1 = require('smtp-server').SMTPServer;
                        libmailserver.current.server = new SMTPServer_1({
                            secure: false,
                            logger: false,
                            authOptional: true,
                            disableReverseLookup: true,
                            useXClient: true,
                            disabledCommands: ['STARTTLS', 'AUTH'],
                            onMailFrom: libmailserver.current.onMailFrom,
                            onRcptTo: libmailserver.current.onRcptTo,
                            onAuth: libmailserver.current.onAuth,
                            onData: libmailserver.current.onData
                        });
                        info('Smtpserver listening on ' + port);
                        return [4 /*yield*/, libmailserver.current.server.listen(port)];
                    case 2:
                        _a.sent();
                        resolve(libmailserver.current);
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        reject(err_1);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    return libmailserver;
}(events_1.EventEmitter));
exports.libmailserver = libmailserver;
//# sourceMappingURL=libmailserver.js.map