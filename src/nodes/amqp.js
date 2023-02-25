"use strict";
var amqp = require("./amqp_nodes");
module.exports = function (RED) {
    RED.nodes.registerType("amqp-connection", amqp.amqp_connection, {
        credentials: {
            username: { type: "text" },
            password: { type: "password" }
        }
    });
    RED.nodes.registerType("amqp consumer", amqp.amqp_consumer_node);
    RED.nodes.registerType("amqp publisher", amqp.amqp_publisher_node);
    RED.nodes.registerType("amqp acknowledgment", amqp.amqp_acknowledgment_node);
    RED.nodes.registerType("amqp exchange", amqp.amqp_exchange_node);
};
//# sourceMappingURL=amqp.js.map