"use strict";
exports.__esModule = true;
exports.Util = exports.NodeRedUser = void 0;
var RED = require("node-red");
var nodeapi_1 = require("@openiap/nodeapi");
var info = nodeapi_1.config.info, warn = nodeapi_1.config.warn, err = nodeapi_1.config.err;
var NodeRedUser = /** @class */ (function () {
    function NodeRedUser() {
        this.email = "";
        this.name = "";
        this.permissions = "";
        this.role = "";
        this.roles = [];
        this.sub = "";
        this.username = "";
    }
    return NodeRedUser;
}());
exports.NodeRedUser = NodeRedUser;
var Util = /** @class */ (function () {
    function Util() {
    }
    Util.EvaluateNodeProperty = function (node, msg, name, ignoreerrors) {
        if (ignoreerrors === void 0) { ignoreerrors = false; }
        return new Promise(function (resolve, reject) {
            var _name = node.config[name];
            var _type = node.config[name + "type"];
            if (_type == null || _type == "") {
                _type = "msg";
            }
            if (_name == null)
                return resolve(null);
            // if (_type == null) _type = "msg";
            RED.util.evaluateNodeProperty(_name, _type, node, msg, function (err, value) {
                if (err && !ignoreerrors) {
                    reject(err);
                }
                else {
                    resolve(value);
                }
            });
        });
    };
    Util.saveToObject = function (obj, path, value) {
        var pList = path.split('.');
        var key = pList.pop();
        var pointer = pList.reduce(function (accumulator, currentValue) {
            if (accumulator[currentValue] === undefined)
                accumulator[currentValue] = {};
            return accumulator[currentValue];
        }, obj);
        if (this.isObject(pointer)) {
            pointer[key] = value;
        }
        else {
            throw new Error(path + ' is not an object!');
        }
        return obj;
    };
    Util.HandleError = function (node, error, msg) {
        err(error);
        var message = error;
        if (typeof error === 'string' || error instanceof String) {
            error = new Error(error);
        }
        try {
            node.error(error, msg);
        }
        catch (error) {
        }
        try {
            if (Util.IsNullUndefinded(message)) {
                message = '';
            }
            node.status({ fill: 'red', shape: 'dot', text: message.toString().substring(0, 32) });
        }
        catch (error) {
        }
    };
    Util.SetMessageProperty = function (msg, name, value) {
        RED.util.setMessageProperty(msg, name, value);
    };
    Util.IsNullUndefinded = function (obj) {
        if (obj === null || obj === undefined) {
            return true;
        }
        return false;
    };
    Util.IsNullEmpty = function (obj) {
        if (obj === null || obj === undefined || obj === '') {
            return true;
        }
        return false;
    };
    Util.IsString = function (obj) {
        if (typeof obj === 'string' || obj instanceof String) {
            return true;
        }
        return false;
    };
    Util.isObject = function (obj) {
        return obj === Object(obj);
    };
    Util.GetUniqueIdentifier = function () {
        // crypto.randomBytes(16).toString("hex")
        return Math.random().toString(36).substring(2, 11);
    };
    Util.parseBoolean = function (s) {
        var val;
        if (typeof s === "number") {
            val = s.toString();
        }
        else if (typeof s === "string") {
            val = s.toLowerCase().trim();
        }
        else if (typeof s === "boolean") {
            val = s.toString();
        }
        else {
            throw new Error("Unknown type!");
        }
        switch (val) {
            case "true":
            case "yes":
            case "1": return true;
            case "false":
            case "no":
            case "0":
            case null: return false;
            default: return Boolean(s);
        }
    };
    Util.Users = [];
    Util.Delay = function (ms) { return new Promise(function (res) { return setTimeout(res, ms); }); };
    return Util;
}());
exports.Util = Util;
//# sourceMappingURL=Util.js.map