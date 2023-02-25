import { openiap } from "@openiap/nodeapi";
import { config } from "@openiap/nodeapi";
const { info, warn, err } = config;
import * as RED from "node-red";
import { Red } from "node-red";
import { Util } from "./Util";

export interface Iamqp_connection {
    name: string;
    username: string;
    password: string;
    host: string;
}
export class amqp_connection {
    public client: openiap;
    public node: Red = null;
    public name: string = "";
    public username: string = "";
    public password: string = "";
    public host: string = "";
    public credentials: Iamqp_connection;
    constructor(public config: Iamqp_connection) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        var client = global.get('client');
        
        
        this.node = this;
        this.node.status({});
        this.node.on("close", this.onclose);
        this.credentials = this.node.credentials;
        if (this.node.credentials && this.node.credentials.hasOwnProperty("username")) {
            this.username = this.node.credentials.username;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("password")) {
            this.password = this.node.credentials.password;
        }
        this.host = this.config.host;
        this.name = config.name || this.host;
        if (this.host != "" && this.host != null) {
            this.client = new openiap(this.host);
            this.client.onConnected = async (client: openiap) => {
                try {
                    const reply = await client.Signin({username: this.username, password: this.password} )
                    info("signing into " + this.host + " as " + reply.user.username);
                } catch (error) {
                    Util.HandleError(this, error, null);
                }
            };
            this.client.connect()
            info("connecting to " + this.host);
        } else {
            this.client = client;
        }
    }
    async onclose(removed: boolean, done: any) {
        if (this.host != null && this.host != "") {
            this.client.Close();
        }
        if (done != null) done();
    }
}

export interface Iamqp_consumer_node {
    config: any;
    queue: string;
    autoack: boolean;
    name: string;
}
export class amqp_consumer_node {
    public node: Red = null;
    public name: string = "";
    public host: string = null;
    public localqueue: string = "";
    private connection: amqp_connection;
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    public client: openiap
    constructor(public config: Iamqp_consumer_node) {
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            var client = global.get('client');
            this.client = (this.connection != null) ? this.connection.client : client;
            
            this.node = this;
            this.name = config.name;
            // this.node.status({});
            this.node.status({ fill: "blue", shape: "dot", text: "Offline" });
            this.node.on("close", this.onclose);
            this.connection = RED.nodes.getNode(this.config.config);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.localqueue == null || this.localqueue == "") {
                this.connect();
            } else {
                this.node.status({ fill: "blue", shape: "dot", text: "Waiting on conn" });
            }
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    onsocketclose(message) {
        if (message == null) message = "";
        if (this != null && this.node != null) this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    }
    onsignedin() {
        this.connect();
    }
    async connect() {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
            info("consumer node in::connect");
            this.localqueue = await this.client.RegisterQueue({
                queuename: this.config.queue
            }, (msg: any) => {
                this.OnMessage(msg);
            });
            info("registed amqp consumer as " + this.localqueue);
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
        } catch (error) {
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async OnMessage(msg: any) {
        const data: any = (typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data);
        // var span = Logger.otel.startSpan("Consumer Node Received", data.traceId, data.spanId);
        var span = null;
        try {
            if (this.config.autoack) {
                const data: any = Object.assign({}, msg.data);
                delete data.jwt;
                delete data.__jwt;
                delete data.__user;
                if(!Util.IsNullEmpty(msg.replyto)) {
                    await this.client.QueueMessage({ queuename: msg.replyto,  correlationId: msg.correlationId, data: msg.data, jwt: msg.jwt}, null)
                }
            } else {
                data.amqpacknowledgment = async (data)=> {
                    await this.client.QueueMessage({ queuename: msg.replyto,  correlationId: msg.correlationId, data, jwt: msg.jwt}, null)
                }
            }
            if (data.__user != null) {
                data.user = data.__user;
                delete data.__user;
            }
            if (data.__jwt != null  && data.__jwt != "") {
                data.jwt = data.__jwt;
                delete data.__jwt;
            }
            this.node.send(data);
        } catch (error) {
            Util.HandleError(this, error, null);
        } finally {
            span?.end();
        }
    }
    async onclose(removed: boolean, done: any) {
        // if (this.localqueue != null && this.localqueue != "" && removed) {
        if (!Util.IsNullEmpty(this.localqueue)) {
            await this.client.UnRegisterQueue({queuename: this.localqueue})
            this.localqueue = "";
        }
        this.client.removeListener("signedin", this._onsignedin);
        this.client.removeListener("disconnected", this._onsocketclose);
        if (done != null) done();
    }
}





export interface Iamqp_publisher_node {
    config: any;
    queue: string;
    exchange: string;
    routingkey: string;
    localqueue: string;
    striptoken: boolean;
    name: string;
}
export class amqp_publisher_node {
    public node: Red = null;
    public client: openiap = null;
    public name: string = "";
    public host: string = null;
    public localqueue: string = "";
    private connection: amqp_connection;
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    static payloads: any = {};
    constructor(public config: Iamqp_publisher_node) {
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            var client = global.get('client');
            this.client = (this.connection != null) ? this.connection.client : client;

            this.node = this;
            this.name = config.name;
            this.node.status({});
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
            this.connection = RED.nodes.getNode(this.config.config);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.localqueue == null || this.localqueue == "") {
                this.connect();
            }
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    onsignedin() {
        this.connect();
    }
    onsocketclose(message) {
        if (message == null) message = "";
        if (this != null && this.node != null) this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    }
    async connect() {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
            info( "track::amqp publiser node::connect");
            this.localqueue = this.config.localqueue;
            this.localqueue = await this.client.RegisterQueue({
                queuename: this.localqueue
            }, (msg)=> {
                this.OnMessage(msg);
            });
            if (this.localqueue != null && this.localqueue != "") {
                info("registed amqp published return queue as " + this.localqueue);
                this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
            }
        } catch (error) {
            this.localqueue = "";
            Util.HandleError(this, error, null);
        }
    }
    async OnMessage(msg: any) {
        const data: any = (typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data);
        // var span = Logger.otel.startSpan("Publish Node Receive", data.traceId, data.spanId);
        var span = null;
        try {
            let result: any = {};
            if (data._msgid != null && data._msgid != "") {
                if (amqp_publisher_node.payloads && amqp_publisher_node.payloads[data._msgid]) {
                    result = Object.assign(amqp_publisher_node.payloads[data._msgid], data);
                    delete amqp_publisher_node.payloads[data._msgid];
                }
            }
            result.payload = data.payload;
            result.jwt = data.jwt;
            if (data.command == "timeout") {
                result.error = "Message timed out, message was not picked up in a timely fashion";
                this.node.send([null, result]);
            } else {
                this.node.send(result);
            }
        } catch (error) {
            Util.HandleError(this, error, null);
        } finally {
            span?.end();
        }
    }
    async oninput(msg: any) {
        // let traceId: string; let spanId: string
        // let logmsg = WebServer.log_messages[msg._msgid];
        // if (logmsg != null) {
        //     traceId = logmsg.traceId;
        //     spanId = logmsg.spanId;
        // }
        // let span = Logger.otel.startSpan("Publish Node Send", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            if (!this.client.connected) {
                throw new Error("Not connected to openflow");
            }
            if (!this.client.signedin) {
                throw new Error("Not signed to openflow");
            }            
            if (this.localqueue == null || this.localqueue == "") {
                throw new Error("Queue not registered yet");
            }
            const queuename = await Util.EvaluateNodeProperty<string>(this, msg, "queue");
            const exchangename = await Util.EvaluateNodeProperty<string>(this, msg, "exchange");
            const routingkey = await Util.EvaluateNodeProperty<string>(this, msg, "routingkey");

            let striptoken = this.config.striptoken;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (!Util.IsNullEmpty(msg.striptoken)) { striptoken = msg.striptoken; }

            const data: any = {};
            // const [traceId, spanId] = Logger.otel.GetTraceSpanId(span);
            data.payload = msg.payload;
            data.jwt = msg.jwt;
            data._id = msg._id;
            data._msgid = msg._msgid;
            const expiration: number = (typeof msg.expiration == 'number' ? msg.expiration : 5000);
            this.node.status({ fill: "blue", shape: "dot", text: "Sending message ..." });
            try {
                await this.client.QueueMessage({ correlationId: msg._msgid, exchangename, routingkey, queuename, replyto: this.localqueue, data, striptoken }, null);
                amqp_publisher_node.payloads[msg._msgid] = msg;
            } catch (error) {
                data.error = error;
                this.node.send([null, data]);
            }
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
        } catch (error) {
            Util.HandleError(this, error, null);
        } finally {
            span?.end();
        }
    }
    async onclose(removed: boolean, done: any) {
        if (!Util.IsNullEmpty(this.localqueue)) {
            await this.client.UnRegisterQueue({ queuename: this.localqueue });
        }
        this.localqueue = "";
        this.client.removeListener("signedin", this._onsignedin);
        this.client.removeListener("disconnected", this._onsocketclose);
        if (done != null) done();
    }
}


export interface Iamqp_acknowledgment_node {
    name: string;
}
export class amqp_acknowledgment_node {
    public node: Red = null;
    public name: string = "";
    constructor(public config: Iamqp_acknowledgment_node) {
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    async oninput(msg: any) {
        // let traceId: string; let spanId: string
        // let logmsg = WebServer.log_messages[msg._msgid];
        // if (logmsg != null) {
        //     traceId = logmsg.traceId;
        //     spanId = logmsg.spanId;
        // }
        // let span = Logger.otel.startSpan("cknowledgment node", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            if (msg.amqpacknowledgment) {
                const data: any = {};
                data.payload = msg.payload;
                data.jwt = msg.jwt;
                data._msgid = msg._msgid;
                await msg.amqpacknowledgment(data);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            err(error)
        } finally {
            span?.end();
            // if (logmsg != null) {
            //     log_message.nodeend(msg._msgid, this.node.id);
            // }
        }
    }
    onclose() {
    }
}





export interface Iamqp_exchange_node {
    config: any;
    exchange: string;
    routingkey: string;
    algorithm: "direct" | "fanout" | "topic" | "header";
    autoack: boolean;
    name: string;
}
export class amqp_exchange_node {
    public node: Red = null;
    public name: string = "";
    public host: string = null;
    public localqueue: string = "";
    private connection: amqp_connection;
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    public client:openiap;
    constructor(public config: Iamqp_exchange_node) {
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            var client = global.get('client');
            this.client = (this.connection != null) ? this.connection.client : client;
            
            this.node = this;
            this.name = config.name;
            // this.node.status({});
            this.node.status({ fill: "blue", shape: "dot", text: "Offline" });
            this.node.on("close", this.onclose);
            this.connection = RED.nodes.getNode(this.config.config);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.localqueue == null || this.localqueue == "") {
                this.connect();
            }
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    onsocketclose(message) {
        if (message == null) message = "";
        if (this != null && this.node != null) this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    }
    onsignedin() {
        this.connect();
    }
    async connect() {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
            info("track::amqp exchange node in::connect");
            this.localqueue = await this.client.RegisterExchange({
                exchangename: this.config.exchange, algorithm: this.config.algorithm,
                routingkey: this.config.routingkey
            }, (msg: any) => {
                this.OnMessage(msg);
            });
            info("registed amqp exchange as " + this.config.exchange);
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.config.exchange });
        } catch (error) {
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async OnMessage(msg: any) {
        try {
            const data: any = (typeof msg.data === "string" ? JSON.parse(msg.data) : msg.data);
            if (this.config.autoack) {
                const data: any = Object.assign({}, msg.data);
                delete data.jwt;
                delete data.__jwt;
                delete data.__user;
            }            
            if (!Util.IsNullUndefinded(data.__user)) {
                data.user = data.__user;
                delete data.__user;
            }
            if (!Util.IsNullUndefinded(data.__jwt)) {
                data.jwt = data.__jwt;
                delete data.__jwt;
            }
            this.node.send(data);
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        if (!Util.IsNullEmpty(this.localqueue)) { // && removed
            await this.client.UnRegisterQueue({ queuename: this.localqueue });
            this.localqueue = "";
        }
        this.client.removeListener("signedin", this._onsignedin);
        this.client.removeListener("disconnected", this._onsocketclose);
        if (done != null) done();
    }
}