"use strict";
var googleauth = require("./googleauth_nodes");
module.exports = function (RED) {
    RED.nodes.registerType("googleauth credentials", googleauth.googleauth_credentials, {
        credentials: {
            clientid: { type: "text" },
            clientsecret: { type: "password" },
            scopes: { type: "text" },
            redirecturi: { type: "text" },
            code: { type: "password" },
            tokens: { type: "password" },
            serviceaccount: { type: "password" },
            apikey: { type: "password" },
            username: { type: "text" },
            password: { type: "password" }
        }
    });
    RED.nodes.registerType("googleauth request", googleauth.googleauth_request);
};
//# sourceMappingURL=googleauth.js.map