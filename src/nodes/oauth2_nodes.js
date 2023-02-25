"use strict";
/**
 * MIT License
 *
 * Copyright (c) 2019 Marcos Caputo <caputo.marcos@gmail.com> https://github.com/caputomarcos/node-red-contrib-oauth2
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 **/
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
exports.oauth2 = void 0;
var request = require("request");
var querystring = require("querystring");
var RED = require("node-red");
var openflow_api_1 = require("@openiap/openflow-api");
var oauth2 = /** @class */ (function () {
    function oauth2(config) {
        this.config = config;
        this.node = null;
        this.name = "";
        RED.nodes.createNode(this, config);
        try {
            this.node = this;
            this.node.status({});
            config.name = config.name || "";
            config.container = config.container || "oauth2Response";
            config.access_token_url = config.access_token_url || "";
            config.grant_type = config.grant_type || "password";
            config.username = config.username || "";
            config.password = config.password || "";
            config.client_id = config.client_id || "";
            config.client_secret = config.client_secret || "";
            config.scope = config.scope || "";
            this.name = config.name;
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
        }
        catch (error) {
            openflow_api_1.NoderedUtil.HandleError(this, error, null);
        }
    }
    oauth2.prototype.oninput = function (msg) {
        return __awaiter(this, void 0, void 0, function () {
            var Form, Method, Authorization, Body, Headers, Options;
            var _this = this;
            return __generator(this, function (_a) {
                Form = {};
                Method = "Post";
                Authorization = '';
                // Choice a grant_type
                if ((this.node.grant_type === "set_by_credentials" || this.node.grant_type == null) && msg.oauth2Request) {
                    this.node.access_token_url = msg.oauth2Request.access_token_url;
                    this.node.client_id = msg.oauth2Request.credentials.client_id;
                    this.node.client_secret = msg.oauth2Request.credentials.client_secret;
                    Form = msg.oauth2Request.credentials;
                    if (msg.oauth2Request.username && msg.oauth2Request.password) {
                        // TODO - ??? =)
                        Authorization = 'Basic ' + Buffer.from("".concat(msg.oauth2Request.username, ":").concat(msg.oauth2Request.password)).toString('base64');
                    }
                    else {
                        // TODO - ??? =)
                        Authorization = 'Basic ' + Buffer.from("".concat(this.node.client_id, ":").concat(this.node.client_secret)).toString('base64');
                    }
                }
                else if (this.node.grant_type === "password") {
                    Form = {
                        'username': this.node.username,
                        'password': this.node.password,
                        'grant_type': this.node.grant_type,
                        'client_id': this.node.client_id,
                        'client_secret': this.node.client_secret
                    };
                    // TODO - ??? =)
                    Authorization = 'Basic ' + Buffer.from("".concat(this.node.client_id, ":").concat(this.node.client_secret)).toString('base64');
                }
                else if (this.node.grant_type === "client_credentials") {
                    Form = {
                        'grant_type': this.node.grant_type,
                        'client_id': this.node.client_id,
                        'client_secret': this.node.client_secret,
                        'scope': this.node.scope
                    };
                    // TODO - ??? =)
                    Authorization = 'Basic ' + Buffer.from("".concat(this.node.client_id, ":").concat(this.node.client_secret)).toString('base64');
                }
                Body = querystring.stringify(Form);
                Headers = {
                    // 'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(Body),
                    'Authorization': Authorization
                };
                Options = {
                    method: Method,
                    url: this.node.access_token_url,
                    headers: Headers,
                    body: Body,
                    json: false
                };
                // make a post request
                request.post(Options, function (err, response, body) {
                    if (msg.oauth2Request)
                        delete msg.oauth2Request;
                    var oauth2Body = null;
                    try {
                        oauth2Body = JSON.parse(body ? body : JSON.stringify("{}"));
                        if (response && response.statusCode && response.statusCode === 200) {
                            msg[_this.node.container] = {
                                authorization: "".concat(oauth2Body.token_type, " ").concat(oauth2Body.access_token),
                                oauth2Response: {
                                    statusCode: response.statusCode,
                                    statusMessage: response.statusMessage,
                                    body: oauth2Body
                                }
                            };
                            _this.node.status({
                                fill: "green",
                                shape: "dot",
                                text: "HTTP ".concat(response.statusCode, ", has token!")
                            });
                        }
                        else if (response && response.statusCode && response.statusCode !== 200) {
                            msg[_this.node.container] = {
                                oauth2Response: {
                                    statusCode: response.statusCode,
                                    statusMessage: response.statusMessage,
                                    body: oauth2Body
                                }
                            };
                            _this.node.status({
                                fill: "red",
                                shape: "dot",
                                text: "HTTP ".concat(response.statusCode, ", hasn't token!")
                            });
                        }
                    }
                    catch (error) {
                        var errormessage = error.message ? error.message : error;
                        msg[_this.node.container] = {
                            oauth2Response: {
                                statusCode: response.statusCode,
                                statusMessage: errormessage,
                                body: oauth2Body
                            }
                        };
                        _this.node.status({
                            fill: "red",
                            shape: "dot",
                            text: "HTTP ".concat(response.statusCode, ", hasn't token!")
                        });
                    }
                    if (err && err.code) {
                        _this.node.status({ fill: "red", shape: "dot", text: "ERR ".concat(err.code) });
                        msg.err = JSON.parse(JSON.stringify(err));
                    }
                    else if (err && err.message && err.stack) {
                        _this.node.status({ fill: "red", shape: "dot", text: "ERR ".concat(err.message) });
                        msg.err = { message: err.message, stack: err.stack };
                    }
                    _this.node.send(msg);
                });
                return [2 /*return*/];
            });
        });
    };
    oauth2.prototype.onclose = function (removed, done) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                done();
                return [2 /*return*/];
            });
        });
    };
    return oauth2;
}());
exports.oauth2 = oauth2;
//# sourceMappingURL=oauth2_nodes.js.map