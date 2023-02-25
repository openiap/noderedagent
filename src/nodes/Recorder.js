"use strict";
var recorder = require("./Recorder_nodes");
module.exports = function (RED) {
    try {
        var rec = new recorder.recorder();
        // @ts-ignore
        // var module = registry.getModule(moduleId);
        // RED.plugins.registerPlugin("node-red-contrib-recorder", rec);
    }
    catch (error) {
    }
};
//# sourceMappingURL=Recorder.js.map