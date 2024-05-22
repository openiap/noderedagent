"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.init = function () {
        var _instrumentation_require = null;
        try {
            _instrumentation_require = require("./instrumentation");
        }
        catch (error) {
        }
        if (_instrumentation_require != null && Logger.instrumentation == null) {
            Logger.instrumentation = _instrumentation_require.instrumentation;
            Logger.log_message = _instrumentation_require.log_message;
        }
        else {
        }
    };
    Logger.instrumentation = null;
    Logger.log_message = null;
    return Logger;
}());
exports.Logger = Logger;
Logger.init();
//# sourceMappingURL=Logger.js.map