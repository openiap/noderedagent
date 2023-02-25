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
exports.create_notification = exports.onesignal_credentials = void 0;
var RED = require("node-red");
var request = require("request");
var openflow_api_1 = require("@openiap/openflow-api");
var onesignal_credentials = /** @class */ (function () {
    function onesignal_credentials(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        this.restKey = "";
        this.appID = "";
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
        this.node.status({});
        if (this.node.credentials && this.node.credentials.hasOwnProperty("restKey")) {
            this.restKey = this.node.credentials.restKey;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("appID")) {
            this.appID = this.node.credentials.appID;
        }
    }
    return onesignal_credentials;
}());
exports.onesignal_credentials = onesignal_credentials;
var create_notification = /** @class */ (function () {
    function create_notification(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        try {
            this.node = this;
            this.name = config.name;
            this.node.status({});
            var _config = RED.nodes.getNode(this.config.config);
            if (!openflow_api_1.NoderedUtil.IsNullUndefinded(_config) && !openflow_api_1.NoderedUtil.IsNullEmpty(_config.restKey)) {
                this.restKey = _config.restKey;
            }
            if (!openflow_api_1.NoderedUtil.IsNullUndefinded(_config) && !openflow_api_1.NoderedUtil.IsNullEmpty(_config.appID)) {
                this.appID = _config.appID;
            }
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
        }
        catch (error) {
            openflow_api_1.NoderedUtil.HandleError(this, error, null);
        }
    }
    create_notification.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var body;
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    this.node.status({});
                    if (!openflow_api_1.NoderedUtil.IsNullEmpty(msg.payload)) {
                        this.config.contents = msg.payload;
                    }
                    if (!openflow_api_1.NoderedUtil.IsNullEmpty(msg.url)) {
                        this.config.url = msg.url;
                    }
                    if (!openflow_api_1.NoderedUtil.IsNullEmpty(msg.customurl)) {
                        this.config.customurl = msg.customurl;
                    }
                    if (!openflow_api_1.NoderedUtil.IsNullEmpty(msg.included_segments)) {
                        this.config.included_segments = msg.included_segments;
                    }
                    if (!openflow_api_1.NoderedUtil.IsNullEmpty(msg.excluded_segments)) {
                        this.config.excluded_segments = msg.excluded_segments;
                    }
                    if (!openflow_api_1.NoderedUtil.IsNullEmpty(msg.include_player_ids)) {
                        this.config.include_player_ids = msg.include_player_ids;
                    }
                    if (this.config.included_segments.indexOf(",") > -1) {
                        this.config.included_segments = this.config.included_segments.split(",");
                    }
                    if (this.config.excluded_segments.indexOf(",") > -1) {
                        this.config.excluded_segments = this.config.excluded_segments.split(",");
                    }
                    if (this.config.include_player_ids.indexOf(",") > -1) {
                        this.config.include_player_ids = this.config.include_player_ids.split(",");
                    }
                    body = {
                        'app_id': this.appID,
                        'contents': this.config.contents,
                        'included_segments': Array.isArray(this.config.included_segments) ? this.config.included_segments : [this.config.included_segments],
                        'excluded_segments': Array.isArray(this.config.excluded_segments) ? this.config.excluded_segments : [this.config.excluded_segments],
                        'include_player_ids': Array.isArray(this.config.include_player_ids) ? this.config.include_player_ids : [this.config.include_player_ids],
                        'data': { 'customurl': this.config.customurl },
                        'url': this.config.url
                    };
                    this.node.status({ fill: "blue", shape: "dot", text: "Creating notifications" });
                    request({
                        method: 'POST',
                        uri: 'https://onesignal.com/api/v1/notifications',
                        headers: {
                            "authorization": "Basic " + this.restKey,
                            "content-type": "application/json"
                        },
                        json: true,
                        body: body
                    }, function (error, response, body) {
                        if (!body.errors) {
                            msg.payload = body;
                            _this.node.status({});
                            _this.node.send(msg);
                        }
                        else {
                            openflow_api_1.NoderedUtil.HandleError(_this, body.errors, msg);
                        }
                    });
                }
                catch (error) {
                    openflow_api_1.NoderedUtil.HandleError(this, error, msg);
                }
                return [2 /*return*/];
            });
        });
    };
    create_notification.prototype.onclose = function () {
    };
    return create_notification;
}());
exports.create_notification = create_notification;
//# sourceMappingURL=onesignal_nodes.js.map