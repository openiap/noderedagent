"use strict";
exports.__esModule = true;
exports.nodered_settings = exports.dashboard_settings = void 0;
var dashboard_settings = /** @class */ (function () {
    function dashboard_settings() {
        this.path = "ui";
    }
    return dashboard_settings;
}());
exports.dashboard_settings = dashboard_settings;
// tslint:disable-next-line: class-name
var nodered_settings = /** @class */ (function () {
    function nodered_settings() {
        this.flowFile = "flows.json";
        this.settingsFile = "nodered_settings.js";
        this.nodesDir = ".";
        this.userDir = ".";
        this.credentialSecret = false;
        this.adminAuth = null;
        this.httpNodeAuth = null;
        this.httpStaticAuth = null;
        this.httpAdminRoot = "/";
        this.httpNodeRoot = "/";
        this.storageModule = null;
        this.uiPort = parseInt(process.env.port || "3000");
        this.mqttReconnectTime = 15000;
        this.serialReconnectTime = 15000;
        this.debugMaxLength = 1000;
        this.functionGlobalContext = { process: process };
        this.functionExternalModules = true;
        this.paletteCategories = ["rpa", "workitem", "subflows", "input", "output", "function", "api",
            "social", "mobile", "storage", "analysis", "advanced"];
        this.debugUseColors = true;
        this.flowFilePretty = true;
        this.logging = {
            console: {
                level: "warn",
                metrics: false,
                audit: false
            }
        };
        this.editorTheme = {
            palette: {
                catalogues: ['https://catalogue.nodered.org/catalogue.json']
            },
            tours: false,
            codeEditor: {
                lib: "monaco",
                options: {}
            }
        };
        this.ui = new dashboard_settings();
    }
    return nodered_settings;
}());
exports.nodered_settings = nodered_settings;
//# sourceMappingURL=nodered_settings.js.map