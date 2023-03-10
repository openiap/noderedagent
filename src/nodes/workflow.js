"use strict";
var workflow = require("./workflow_nodes");
module.exports = function (RED) {
    RED.nodes.registerType("workflow in", workflow.workflow_in_node);
    RED.nodes.registerType("workflow out", workflow.workflow_out_node);
    RED.nodes.registerType("assign workflow", workflow.assign_workflow_node);
    RED.httpAdmin.get("/workflow_forms", RED.auth.needsPermission('serial.read'), workflow.get_workflow_forms);
    RED.httpAdmin.get("/workflows", RED.auth.needsPermission('serial.read'), workflow.get_workflows);
};
//# sourceMappingURL=workflow.js.map