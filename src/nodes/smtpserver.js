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
var libmailserver_1 = require("./libmailserver");
var Util_1 = require("./Util");
module.exports = function (RED) {
    "use strict";
    RED.nodes.registerType("smtpserver in", function (n) {
        var _this = this;
        RED.nodes.createNode(this, n);
        this.name = n.name || n.email;
        this.email = n.email;
        this.port = n.port;
        var node = this;
        var mailserver;
        var onEmail = function (email) {
            try {
                var sendit = false;
                if (node.email == null || node.email == '' || node.email == '*') {
                    sendit = true;
                }
                if (email.to) {
                    if (email.to.value.filter(function (addr) { return addr.address == node.email; }).length > 0) {
                        sendit = true;
                    }
                }
                if (email.bcc) {
                    if (email.bcc.value.filter(function (addr) { return addr.address == node.email; }).length > 0) {
                        sendit = true;
                    }
                }
                if (sendit) {
                    var msg = { payload: email, instanceid: null };
                    var instanceid = email.headers.get('instanceid');
                    if (!instanceid) {
                        instanceid = email.headers.get('XREF');
                    }
                    if (!instanceid) {
                        var startindex = email.text.indexOf('instanceid');
                        //const endindex = email.text.indexOf('instanceid', startindex+10) + 10;
                        //const text = email.text.substring(startindex, endindex - startindex);
                        var text = email.text.substring(startindex);
                        var arr = text.split(':');
                        instanceid = arr[1];
                    }
                    msg.instanceid = instanceid;
                    node.send(msg);
                    // } else {
                    //     config.log(1, email);
                }
            }
            catch (error) {
                Util_1.Util.HandleError(_this, error, null);
            }
        };
        function init(port) {
            return __awaiter(this, void 0, void 0, function () {
                var error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            return [4 /*yield*/, libmailserver_1.libmailserver.setupSMTP(port)];
                        case 1:
                            mailserver = _a.sent();
                            mailserver.on('email', onEmail);
                            return [3 /*break*/, 3];
                        case 2:
                            error_1 = _a.sent();
                            Util_1.Util.HandleError(this, error_1, null);
                            return [3 /*break*/, 3];
                        case 3: return [2 /*return*/];
                    }
                });
            });
        }
        // const port = node.port;
        // if(port && port !='') {
        //     port = parseInt(node.port);
        // } else {
        //     port = config.mailserver_port;
        // }
        // port = config.mailserver_port;
        var port = 25;
        if (this.port)
            port = this.port;
        init(port);
        this.on("close", function () {
            //mailserver.removeAllListeners(node.endpointname);
            mailserver.removeListener('email', onEmail);
        });
    });
};
//# sourceMappingURL=smtpserver.js.map