import { openiap } from "@openiap/nodeapi";
import { config } from "@openiap/nodeapi";
const { info, warn, err } = config;
import * as RED from "node-red";
import { Red } from "node-red";
import { Util } from "./Util";

export interface Irpa_detector_node {
    queue: string;
    name: string;
}
export class rpa_detector_node {
    public node: Red = null;
    public name: string = "";
    public localqueue: string = "";
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    public client: openiap
    constructor(public config: Irpa_detector_node) {
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            
            this.node = this;
            this.name = config.name;
            this.node.status({});
            this.node.on("close", this.onclose);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
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
    detector: any = null;
    async connect() {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });

            const result: any[] = await this.client.Query<any>({
                collectionname: 'openrpa', query: { _type: "detector", _id: this.config.queue },
                top: 1
            });

            if (result.length == 0) {
                this.node.status({ fill: "red", shape: "dot", text: "Failed locating detector" });
                return;
            }
            this.detector = result[0];

            if (this.detector.detectortype == "exchange") {
                this.localqueue = await this.client.RegisterExchange({
                    exchangename: this.config.queue, algorithm: "fanout"},
                    (msg: any) => {
                        this.OnMessage(msg);
                        }
                );
                this.node.status({ fill: "green", shape: "dot", text: "Connected as exchange" });
            } else {
                this.localqueue = await this.client.RegisterQueue({
                    queuename: this.config.queue
                }, (msg: any) => {
                    this.OnMessage(msg);
                    });
                this.node.status({ fill: "green", shape: "dot", text: "Connected as queue" });
            }
        } catch (error) {
            this.localqueue = "";
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async OnMessage(msg: any) {
        try {
            var _msgid = Util.GetUniqueIdentifier();
            if(typeof msg.data === "string") msg.data = JSON.parse(msg.data);
            // if (!Util.IsNullEmpty(msg.data?.traceId)) {
            //     WebServer.log_messages[_msgid] = new log_message(_msgid);
            //     WebServer.log_messages[_msgid].traceId = msg.data.traceId;
            //     WebServer.log_messages[_msgid].spanId = msg.data.spanId;
            // }
            if (msg.data && !msg.payload) {
                msg.payload = msg.data;
                delete msg.data;
            }
            if (msg.payload.data) {
                msg = msg.payload;
                msg.payload = msg.data;
                delete msg.data;
            }
            try {
                if (typeof msg.payload == "string") {
                    msg.payload = JSON.parse(msg.payload);
                }
            } catch (error) {
            }
            if (!Util.IsNullUndefinded(msg.__user)) {
                msg.user = msg.__user;
                delete msg.__user;
            }
            if (!Util.IsNullUndefinded(msg.__jwt)) {
                msg.jwt = msg.__jwt;
                delete msg.__jwt;
            }
            msg._msgid = _msgid;
            this.node.send(msg);
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        if (!Util.IsNullEmpty(this.localqueue)) {
            await this.client.UnRegisterQueue({ queuename: this.localqueue });
            this.localqueue = "";
        }
        this.client.removeListener("onsignedin", this._onsignedin);
        this.client.removeListener("onclose", this._onsocketclose);
        if (done != null) done();
    }
}



export interface Irpa_workflow_node {
    queue: string;
    workflow: string;
    killexisting: boolean;
    killallexisting: boolean;
    queuename: string;
    name: string;
}
export class rpa_workflow_node {
    public node: Red = null;
    public name: string = "";
    private localqueue: string = "";
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    // private originallocalqueue: string = "";
    // private uid: string = "";
    public client: openiap;
    constructor(public config: Irpa_workflow_node) {
        RED.nodes.createNode(this, config);
        try {
            this.node = this;
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            // this.uid = Util.GetUniqueIdentifier();
            this.node.status({});
            this.name = config.name;
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
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
            // this.localqueue = this.uid;
            this.localqueue = await this.client.RegisterQueue({
                queuename: this.config.queuename}, (msg:  any) => {
                    this.OnMessage(msg);
                    });
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });

        } catch (error) {
            this.localqueue = "";
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async OnMessage(msg: any) {
        try {
            let result: any = {};

            const correlationId = msg.correlationId;
            if(typeof msg.data === "string") msg.data = JSON.parse(msg.data);
            if (msg.data && !msg.payload) {
                msg.payload = msg.data;
                delete msg.data;
            }
            if (msg.payload.data) {
                if (msg.payload.command == "output") console.log("out " + msg.payload.data);
                msg = msg.payload;
                msg.payload = msg.data;
                delete msg.data;
            }
            const data = msg;
            if (!Util.IsNullUndefinded(data.__user)) {
                data.user = data.__user;
                delete data.__user;
            }
            if (!Util.IsNullUndefinded(data.__jwt)) {
                data.jwt = data.__jwt;
                delete data.__jwt;
            }
            let command = data.command;
            if (command == undefined && data.data != null && data.data.command != null) { command = data.data.command; }
            if (correlationId != null && rpa_workflow_node.messages[correlationId] != null) {
                result = { ...rpa_workflow_node.messages[correlationId] };
                if (command == "invokecompleted" || command == "invokefailed" || command == "invokeaborted" || command == "error" || command == "timeout") {
                    delete rpa_workflow_node.messages[correlationId];
                }
            } else {
                result.jwt = data.jwt;
            }
            if (!Util.IsNullEmpty(command) && command.indexOf("invoke") > -1) command = command.substring(6);
            result.command = command;
            // result._msgid = Util.GetUniqueIdentifier();
            if (command == "completed") {
                result.payload = data.payload;
                if (data.user != null) result.user = data.user;
                if (data.jwt != null && Util.IsNullUndefinded(result.jwt)) result.jwt = data.jwt;
                if (result.payload == null || result.payload == undefined) { result.payload = {}; }
                this.node.status({ fill: "green", shape: "dot", text: command + "  " + this.localqueue });
                result.id = correlationId;
                this.node.send([result, result]);
            }
            else if (command == "failed" || command == "aborted" || command == "error" || command == "timeout") {
                result.payload = data.payload;
                result.error = data.payload;
                if (command == "timeout") {
                    result.error = "request timed out, no robot picked up the message in a timely fashion";
                }
                if (result.error != null && result.error.Message != null && result.error.Message != "") {
                    result.error = result.error.Message;
                }
                if (data.user != null) result.user = data.user;
                if (data.jwt != null && Util.IsNullUndefinded(result.jwt)) result.jwt = data.jwt;
                if (result.payload == null || result.payload == undefined) { result.payload = {}; }
                this.node.status({ fill: "red", shape: "dot", text: command + "  " + this.localqueue });
                result.id = correlationId;
                this.node.send([null, result, result]);
            }
            else {
                if (command != "output") this.node.status({ fill: "blue", shape: "dot", text: command + "  " + this.localqueue });
                result.payload = data.payload;
                if (data.user != null) result.user = data.user;
                if (data.jwt != null && Util.IsNullUndefinded(result.jwt)) result.jwt = data.jwt;
                if (result.payload == null || result.payload == undefined) { result.payload = {}; }
                result.id = correlationId;
                if (command != "success") console.log("snd " + result.payload);
                this.node.send([null, result]);
            }
        } catch (error) {
            this.node.status({});
            Util.HandleError(this, error, msg);
        }
    }
    static messages: any[] = [];
    async oninput(msg: any) {
        // let traceId: string; let spanId: string
        // let logmsg = WebServer.log_messages[msg._msgid];
        // if (logmsg != null) {
        //     traceId = logmsg.traceId;
        //     spanId = logmsg.spanId;
        // }
        // let span = Logger.otel.startSpan("rpa node", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            if (this.client == null || !this.client.signedin) {
                throw new Error("Not connected to openflow");
            }
            if (Util.IsNullEmpty(this.localqueue)) {
                throw new Error("Queue not registered yet");
            }
            let queue = this.config.queue;
            let workflowid = this.config.workflow;
            let killexisting = this.config.killexisting;
            let killallexisting = this.config.killallexisting;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (queue == "none") queue = "";
            if (queue == "from msg.targetid") queue = "";
            if (workflowid == "none") workflowid = "";
            if (workflowid == "from msg.workflowid") workflowid = "";
            if (Util.IsNullEmpty(queue) && !Util.IsNullEmpty(msg.targetid)) { queue = msg.targetid; }
            if (Util.IsNullEmpty(workflowid) && !Util.IsNullEmpty(msg.workflowid)) { workflowid = msg.workflowid; }

            if (!Util.IsNullEmpty(msg.killexisting)) { killexisting = msg.killexisting; }
            if (!Util.IsNullEmpty(msg.killallexisting)) { killallexisting = msg.killallexisting; }

            const correlationId = msg._msgid || Util.GetUniqueIdentifier();
            rpa_workflow_node.messages[correlationId] = msg;
            if (msg.payload == null || typeof msg.payload == "string" || typeof msg.payload == "number") {
                msg.payload = { "data": msg.payload };
            }
            if (Util.IsNullEmpty(queue)) {
                this.node.status({ fill: "red", shape: "dot", text: "robot is mandatory" });
                return;
            }
            if (Util.IsNullEmpty(workflowid)) {
                this.node.status({ fill: "red", shape: "dot", text: "workflow is mandatory" });
                return;
            }
            const rpacommand = {
                command: "invoke",
                workflowid,
                killexisting,
                killallexisting,
                jwt: msg.jwt,
                _msgid: msg._msgid,
                // Adding expiry to the rpacommand as a timestamp for when the RPA message is expected to timeout from the message queue
                // Currently set to 20 seconds into the future
                expiry: Math.floor((new Date().getTime()) / 1000) + 500,
                data: { payload: msg.payload }
            }
            const expiration: number = (typeof msg.expiration == 'number' ? msg.expiration : 500);
            this.client.QueueMessage({ queuename: queue, replyto: this.localqueue, data: rpacommand, correlationId, striptoken: false, jwt: msg.jwt }, null);
            this.node.status({ fill: "yellow", shape: "dot", text: "Pending " + this.localqueue });
        } catch (error) {
            // Util.HandleError(this, error);
            try {
                this.node.status({ fill: "red", shape: "dot", text: error });
                msg.error = error;
                this.node.send([null, null, msg]);
            } catch (error) {
            }
        } finally {
            span?.end();
            // if (logmsg != null) {
            //     log_message.nodeend(msg._msgid, this.node.id);
            // }
        }
    }
    async onclose(removed: boolean, done: any) {
        if (!Util.IsNullEmpty(this.localqueue)) {
            await this.client.UnRegisterQueue({ queuename: this.localqueue });
        }
        this.localqueue = "";
        this.client.removeListener("onsignedin", this._onsignedin);
        this.client.removeListener("onclose", this._onsocketclose);
        if (done != null) done();
    }
}




export interface Irpa_killworkflows_node {
    queue: string;
    name: string;
}
export class rpa_killworkflows_node {
    public node: Red = null;
    public name: string = "";
    private localqueue: string = "";
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    private originallocalqueue: string = "";
    public client: openiap;
    constructor(public config: Irpa_killworkflows_node) {
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            this.node = this;
            this.node.status({});
            this.name = config.name;
            this.node.on("input", this.oninput);
            this.node.on("close", this.onclose);
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);

            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
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
            this.localqueue = await this.client.RegisterQueue({queuename: ""},
                (msg: any) => {
                    this.OnMessage(msg);
                    }
            );
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });

        } catch (error) {
            this.localqueue = "";
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async OnMessage(msg: any) {
        try {
            let result: any = {};
            if(typeof msg.data === "string") msg.data = JSON.parse(msg.data);
            const correlationId = msg.correlationId;
            if (msg.data && !msg.payload) {
                msg.payload = msg.data;
                delete msg.data;
            }
            if (msg.payload.data) {
                msg = msg.payload;
                msg.payload = msg.data;
                delete msg.data;
            }
            const data = msg;
            if (!Util.IsNullUndefinded(data.__user)) {
                data.user = data.__user;
                delete data.__user;
            }
            if (!Util.IsNullUndefinded(data.__jwt)) {
                data.jwt = data.__jwt;
                delete data.__jwt;
            }
            let command = data.command;
            if (command == undefined && data.data != null && data.data.command != null) { command = data.data.command; }
            if (correlationId != null && rpa_killworkflows_node.messages[correlationId] != null) {
                // result = Object.assign({}, this.messages[correlationId]);
                result = rpa_killworkflows_node.messages[correlationId];
                if (command == "killallworkflowssuccess" || command == "error" || command == "timeout") {
                    delete rpa_killworkflows_node.messages[correlationId];
                }
            } else {
                result.jwt = data.jwt;
            }
            if (command == "killallworkflowssuccess") {
                // result.payload = data.payload;
                if (data.user != null) result.user = data.user;
                if (data.jwt != null && Util.IsNullUndefinded(result.jwt)) result.jwt = data.jwt;
                if (result.payload == null || result.payload == undefined) { result.payload = {}; }
                this.node.status({ fill: "green", shape: "dot", text: "killed " + this.localqueue });
                result.id = correlationId;
                this.node.send([result, null]);
            }
            else if (command == "error" || command == "timeout") {
                result.payload = data.payload;
                result.error = data.payload;
                if (command == "timeout") {
                    result.error = "request timed out, no robot picked up the message in a timely fashion";
                }
                if (result.error != null && result.error.Message != null && result.error.Message != "") {
                    result.error = result.error.Message;
                }
                if (data.user != null) result.user = data.user;
                if (data.jwt != null && Util.IsNullUndefinded(result.jwt)) result.jwt = data.jwt;
                if (result.payload == null || result.payload == undefined) { result.payload = {}; }
                this.node.status({ fill: "red", shape: "dot", text: command + "  " + this.localqueue });
                result.id = correlationId;
                this.node.send([null, result]);
            }
            else {
                this.node.status({ fill: "blue", shape: "dot", text: "Unknown command " + command + "  " + this.localqueue });
                result.payload = data.payload;
                if (data.user != null) result.user = data.user;
                if (data.jwt != null && Util.IsNullUndefinded(result.jwt)) result.jwt = data.jwt;
                if (result.payload == null || result.payload == undefined) { result.payload = {}; }
                result.id = correlationId;
                this.node.send([null, result]);
            }
        } catch (error) {
            this.node.status({});
            Util.HandleError(this, error, msg);
        }
    }
    static messages: any[] = [];
    async oninput(msg: any) {
        try {
            this.node.status({});
            if (this.client == null || !this.client.signedin) {
                throw new Error("Not connected to openflow");
            }
            if (Util.IsNullEmpty(this.localqueue)) {
                throw new Error("Queue not registered yet");
            }
            let queue = this.config.queue;

            if (queue == "none") queue = "";
            if (Util.IsNullEmpty(queue) && !Util.IsNullEmpty(msg.targetid)) { queue = msg.targetid; }
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            const correlationId = msg._msgid || Util.GetUniqueIdentifier();
            rpa_killworkflows_node.messages[correlationId] = msg;
            // if (msg.payload == null || typeof msg.payload == "string" || typeof msg.payload == "number") {
            //     msg.payload = { "data": msg.payload };
            // }
            if (Util.IsNullEmpty(queue)) {
                this.node.status({ fill: "red", shape: "dot", text: "robot is mandatory" });
                return;
            }
            const rpacommand = {
                command: "killallworkflows",
                jwt: msg.jwt,
                // Adding expiry to the rpacommand as a timestamp for when the RPA message is expected to timeout from the message queue
                // Currently set to 20 seconds into the future
                expiry: Math.floor((new Date().getTime()) / 1000) + 500,
                data: {}
            }
            const expiration: number = (typeof msg.expiration == 'number' ? msg.expiration : 500);
            this.client.QueueMessage({ queuename: queue, replyto: this.localqueue, data: rpacommand, correlationId, striptoken: true, jwt: msg.jwt }, null);
            this.node.status({ fill: "yellow", shape: "dot", text: "Pending " + this.localqueue });
        } catch (error) {
            try {
                this.node.status({ fill: "red", shape: "dot", text: error });
                msg.error = error;
                this.node.send([null, null, msg]);
            } catch (error) {
            }
        }
    }
    async onclose(removed: boolean, done: any) {
        if (!Util.IsNullEmpty(this.localqueue)) {
            await this.client.UnRegisterQueue({ queuename: this.localqueue });
            this.localqueue = "";
        }
        this.client.removeListener("onsignedin", this._onsignedin);
        this.client.removeListener("onclose", this._onsocketclose);
        if (done != null) done();
    }
}


export async function get_rpa_detectors(req, res) {
    try {
        const result: any[] = await Util.client.Query({
            collectionname: 'openrpa', query: { _type: "detector" },
            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
        })
        res.json(result);
    } catch (error) {
        err(error)
        res.status(500).json(error);
    }
}
export async function get_rpa_robots_roles(req, res) {
    try {
        const result: any[] = await Util.client.Query({
            collectionname: 'users', query: { $or: [{ _type: "user", _rpaheartbeat: { "$exists": true } }, { _type: "role", rparole: true }] },
            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
        })
        res.json(result);
    } catch (error) {
        err(error)
        res.status(500).json(error);
    }
}
export async function get_rpa_robots(req, res) {
    try {
        const result: any[] = await Util.client.Query({
            collectionname: 'users', query: { _type: "user", _rpaheartbeat: { "$exists": true } },
            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
        })
        res.json(result);
    } catch (error) {
        err(error)
        res.status(500).json(error);
    }
}
export async function get_rpa_workflows(req, res) {
    try {
        const query: any = { _type: "workflow" };
        if (!Util.IsNullEmpty(req.query.name)) {
            // q["name"] = new RegExp(["^", req.query.name, "$"].join(""), "i")
            query["$or"] = [
                { "projectandname": new RegExp([req.query.name].join(""), "i") },
                { "_id": req.query.name }
            ]
        }
        warn("query " + JSON.stringify(query))
        const result: any[] = await Util.client.Query({
            collectionname: 'openrpa', query,
            projection: { name: 1, projectandname: 1 }, orderby: { projectid: -1, name: -1 }, top: 20, queryas: req.query.queue
        })
        info(`query response gave ${result.length} results`)
        res.json(result);
    } catch (error) {
        err(error)
        res.status(500).json(error);
    }
}
