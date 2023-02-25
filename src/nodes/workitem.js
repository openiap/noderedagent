"use strict";
var workitem = require("./workitem_nodes");
module.exports = function (RED) {
    RED.nodes.registerType("iworkitemqueue-config", workitem.workitemqueue_config, {
        credentials: {
            password: { type: "password" }
        }
    });
    RED.nodes.registerType("workitem addworkitem", workitem.addworkitem);
    RED.nodes.registerType("workitem addworkitems", workitem.addworkitems);
    RED.nodes.registerType("workitem updateworkitem", workitem.updateworkitem);
    RED.nodes.registerType("workitem popworkitem", workitem.popworkitem);
    RED.nodes.registerType("workitem deleteworkitem", workitem.deleteworkitem);
};
//# sourceMappingURL=workitem.js.map