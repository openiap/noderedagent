"use strict";
var onesignal = require("./onesignal_nodes");
module.exports = function (RED) {
    RED.nodes.registerType("onesignal-credentials", onesignal.onesignal_credentials, {
        credentials: {
            restKey: { type: "text" },
            appID: { type: "text" }
        }
    });
    RED.nodes.registerType("onesignal create notification", onesignal.create_notification);
};
//# sourceMappingURL=onesignal.js.map