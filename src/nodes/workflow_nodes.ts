import { Base, openiap, QueueEvent } from "@openiap/nodeapi";
import * as RED from "node-red";
import { Red } from "node-red";
import { Util } from "./Util";

export interface Iworkflow_in_node {
    queue: string;
    name: string;
    rpa: boolean;
    web: boolean;
    exchange: boolean;
}
export class workflow_in_node {
    public node: Red = null;
    public name: string = "";
    // public host: string = null;
    public workflow: any;
    public localqueue: string = "";
    public localexchangequeue: string = "";
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    public client: openiap
    constructor(public config: Iworkflow_in_node) {
        RED.nodes.createNode(this, config);
        try {
            // @ts-ignore
            var global = this.context().global;
            this.client = global.get('client');
            this.node = this;
            this.node.status({ fill: "blue", shape: "dot", text: "init" });
            this.name = config.name;
            this.node.on("close", this.onclose);
            // this.host = Config.amqp_url;
            this._onsignedin = this.onsignedin.bind(this);
            this._onsocketclose = this.onsocketclose.bind(this);
            this.client.on("signedin", this._onsignedin);
            this.client.on("disconnected", this._onsocketclose);
            if (this.client.signedin) {
                this.connect();
            } else {
                this.node.status({ fill: "red", shape: "dot", text: "Disconnected" });
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
            if (this.config.queue == null || this.config.queue == "") {
                this.node.status({ fill: "red", shape: "dot", text: "Missing queue name" });
                return;
            }
            this.node.status({ fill: "blue", shape: "dot", text: "Connecting..." });
            this.localqueue = await this.client.RegisterQueue({
                queuename: this.config.queue
            }, (msg: QueueEvent, payload: any, user: any, jwt:string) => {
                this.OnMessage(msg, payload, user, jwt);
            });

            await this.init();
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
        } catch (error) {
            this.localqueue = "";
            this.localexchangequeue = "";
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async init() {
        let name = this.config.name;

        if (Util.IsNullEmpty(name)) {
            name = this.config.queue;
        }

        if (Util.IsNullEmpty(this.localqueue)) {
            this.node.status({ fill: "green", shape: "dot", text: "init failed, missing localqueue name" });
            return;
        }

        const res = await this.client.Query({ collectionname: "workflow", query: { "queue": this.localqueue }, top: 1 });
        if (res.length == 0) {
            // const noderedadmins = await NoderedUtil.GetRole(null, Config.noderedadmins);
            let wf: Base = new Base();
            wf._type = "workflow";
            wf.name = name;
            (wf as any).queue = this.localqueue;
            // if (noderedadmins != null) {
            //     Base.addRight(wf, noderedadmins._id, noderedadmins.name, [-1]);
            // }
            this.workflow = await this.client.InsertOne({ collectionname: "workflow", item: { _type: "workflow", "queue": this.localqueue, "name": name } });
        } else {
            this.workflow = res[0];
            // const hasnoderedadmins = this.workflow._acl.filter(x => x.name == Config.noderedadmins);
            // if (hasnoderedadmins.length == 0) {
            //     const noderedadmins = await NoderedUtil.GetRole(null, Config.noderedadmins);
            //     if (noderedadmins != null) {
            //         Base.addRight(this.workflow, noderedadmins._id, noderedadmins.name, [-1]);
            //     }
            // }
        }
        // const res2 = await this.client.Query({ collectionname: "users", query: { "_type": "role", "$or": [{ "workflowid": this.workflow._id }, { "name": this.localqueue + "users" }] }, top: 1 });
        // let role: Base = null;
        // const who = WebSocketClient.instance.user;
        // if (res2.length == 0) {
        //     (role as any) = { _type: "role", "name": this.localqueue + "users", members: [{ "_id": who._id, "name": who.name }], "workflowid": this.workflow._id };
        //     (role as any).customerid = who.customerid;
        //     role = await this.client.InsertOne({ collectionname: "users", item: role });
        // } else {
        //     role = res2[0];
        //     (role as any).customerid = who.customerid;
        // }
        // Base.addRight(this.workflow, role._id, role.name, [-1]);
        this.workflow.queue = this.localqueue;
        this.workflow.name = name;
        this.workflow.rpa = this.config.rpa;
        this.workflow.web = this.config.web;
        this.workflow = await this.client.UpdateOne({ collectionname: "workflow", item: this.workflow });

        // if (this.config.exchange) {
        //     if (Config.amqp_enabled_exchange) {
        //         const result = await NoderedUtil.RegisterExchange({
        //             exchangename: this.localqueue, algorithm: "direct",
        //             callback: (msg: QueueMessage, ack: any) => {
        //                 // this.OnMessage(msg, ack);
        //                 ack();
        //             }, closedcallback: (msg) => {
        //                 // if (this != null && this.node != null) this.node.status({ fill: "red", shape: "dot", text: "Disconnected" });
        //                 // setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 500);
        //             }
        //         });
        //         this.localexchangequeue = result.queuename;
        //     } else {
        //         this.node.warn("AMQP exchange is not enabled on this OpenFlow")
        //     }
        // }
    }
    nestedassign(target, source) {
        if (source === null || source === undefined) return null;
        const keys = Object.keys(source);
        for (let i = 0; i < keys.length; i++) {
            try {
                const sourcekey = keys[i];
                if (Object.keys(source).find(targetkey => targetkey === sourcekey) !== undefined &&
                    Object.keys(source).find(targetkey => targetkey === sourcekey) !== null
                    && typeof source === "object" && typeof source[sourcekey] === "object") {
                    if (target[sourcekey] === undefined || target[sourcekey] === null) {
                        // target[sourcekey] = {};
                    } else {
                        target[sourcekey] = this.nestedassign(target[sourcekey], source[sourcekey]);
                    }
                } else {
                    target[sourcekey] = source[sourcekey];
                }
            } catch (error) {
            }
        }
        return target;
    }
    async OnMessage(msg: QueueEvent, payload: any, user: any, jwt:string) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            let data: any = msg;
            try {
                if(typeof msg.data == "string") msg.data = JSON.parse(msg.data);
            } catch (error) {
            }
            data.payload = msg.data;
            delete data.data;
            try {
                data.payload = JSON.parse(data.payload);
            } catch (error) {
            }
            if (data.payload != null && data.payload.__jwt != null && data.__jwt == null) {
                if (!Util.IsNullUndefinded(data.payload.__user)) {
                    data.user = data.payload.__user;
                    delete data.payload.__user;
                }
                data.jwt = data.payload.__jwt;
                delete data.payload.__jwt;
            }
            let _id = data._id;
            if (_id === null || _id === undefined || _id === "") {
                if (data.payload !== null && data.payload !== undefined) {
                    if (data.payload._id !== null && data.payload._id !== undefined && data.payload._id !== "") {
                        _id = data.payload._id;
                    }
                }
            }
            if(data && data.payload) {
                delete data.payload.traceId;
                delete data.payload.spanId;
            }
            while (data.payload != null && data.payload.payload != null) {
                data.payload = data.payload.payload;
            }
            // if (data.payload != null && data.payload.payload != null) {
            //     // UGLy ROLLBACK!
            //     data.payload = data.payload.payload;
            // }
            if (_id !== null && _id !== undefined && _id !== "") {
                this.node.status({ fill: "blue", shape: "dot", text: "Processing id " + _id });
                const jwt = data.jwt;
                delete data.jwt;

                const res = await this.client.Query<any>({ collectionname: "workflow_instances", query: { "_id": _id }, top: 1, jwt });
                if (res.length == 0) {
                    Util.HandleError(this, "Unknown workflow_instances id " + _id, msg);
                    return {"error": "Unknown workflow_instances id " + _id};
                }
                const orgmsg = res[0];
                delete orgmsg._msgid; // Keep each run seperate
                if (orgmsg.payload === null || orgmsg.payload === undefined) {
                    orgmsg.payload = data;
                    data = orgmsg;
                } else {
                    try {
                        if (typeof orgmsg.payload === "string") orgmsg.payload = JSON.parse(orgmsg.payload);
                    } catch (error) {                        
                    }
                    if (typeof orgmsg.payload === "object") {
                        orgmsg.payload = Object.assign(orgmsg.payload, data.payload);
                    } else {
                        orgmsg.payload = { message: orgmsg.payload };
                        orgmsg.payload = Object.assign(orgmsg.payload, data.payload);
                    }
                    orgmsg.jwt = data.jwt;
                    orgmsg.user = data.user;
                    data = orgmsg;
                }
                data.jwt = jwt;
            } else {
                this.node.status({ fill: "blue", shape: "dot", text: "Processing new instance " });
                const jwt = data.jwt;

                let who = this.client.client.user;
                const me = this.client.client.user;
                const testjwt = this.client.client.jwt;

                this.node.status({ fill: "blue", shape: "dot", text: "Renew token " });
                if (!Util.IsNullEmpty(jwt)) {
                    const signin = await this.client.Signin({ jwt: jwt, validateonly: true }); // longtoken: true
                    who = signin.user;
                    data.jwt = signin.jwt;
                    console.debug(testjwt);
                }
                delete data.jwt;                
                const item: Base = ({ _type: "instance", "queue": this.localqueue, "name": this.workflow.name, payload: data, workflow: this.workflow._id, targetid: who._id }) as any;
                (item as any)._replyTo = msg.replyto;
                (item as any)._correlationId = msg.correlationId;
                Base.addRight(item, who._id, who.name, [-1]);
                if (who._id != me._id) Base.addRight(item, me._id, me.name, [-1]);
                this.node.status({ fill: "blue", shape: "dot", text: "Create instance " });
                const res2 = await this.client.InsertOne<Base>({ collectionname: "workflow_instances", item, jwt });

                // Logger.instanse.info("workflow in activated creating a new workflow instance with id " + res2._id);
                // OpenFlow Controller.ts needs the id, when creating a new intance !
                data._id = res2._id;
                this.node.status({ fill: "blue", shape: "dot", text: "Processing new id " + res2._id });
                if (data.payload !== null && data.payload != undefined) {
                    try {
                        data.payload._id = res2._id;
                    } catch (error) {
                    }
                }
                // result = this.nestedassign(res2, result);
                data = Object.assign(res2, data);
                data.jwt = jwt;
            }
            data._replyTo = msg.replyto;
            data._correlationId = msg.correlationId;

            if (data != null && data.jwt != null && data.payload != null && data.jwt == data.payload.jwt) {
                delete data.payload.jwt;
            }
            // if (Util.IsNullEmpty(data._msgid)) data._msgid = Util.GetUniqueIdentifier();
            // WebServer.log_messages[data._msgid] = new log_message(data._msgid);
            // log_message.nodestart(data._msgid, this.node.id);
            // if (data.payload && !Util.IsNullEmpty(data.payload.traceId) && !Util.IsNullEmpty(data.payload.spanId)) {
            //     WebServer.log_messages[data._msgid].traceId = data.payload.traceId;
            //     WebServer.log_messages[data._msgid].spanId = data.payload.spanId;
            // }
            this.node.send(data);
            // this.node.send(result);
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
            // log_message.nodeend(data._msgid, this.node.id);
        } catch (error) {
            Util.HandleError(this, error, msg);
            try {

                const data: any = {};
                data.error = error;
                data.payload = msg.data;
                data.jwt = jwt;
                if (data.payload === null || data.payload === undefined) {
                    data.payload = {};
                }
                return JSON.stringify(data);
            } catch (error) {
            }
        }
    }
    async onclose(removed: boolean, done: any) {
        try {
            if (removed ) {
                let res = await this.client.Query<Base>({ collectionname: "workflow", query: { "queue": this.localqueue }, top: 1 });
                if (res.length > 0) {
                    await this.client.DeleteOne({ collectionname: "workflow", id: res[0]._id });
                }
                if (this.workflow != null) {
                    res = await this.client.Query({ collectionname: "users", query: { "_type": "role", "$or": [{ "workflowid": this.workflow._id }, { "name": this.localqueue + "users" }] }, top: 1 });
                }
                if (res.length > 0) {
                    await this.client.DeleteOne({ collectionname: "users", id: res[0]._id });
                }
            }
            if (!Util.IsNullEmpty(this.localqueue)) {
                await this.client.UnRegisterQueue({ queuename: this.localqueue });
                this.localqueue = "";
            }
            if (!Util.IsNullEmpty(this.localexchangequeue)) {
                await this.client.UnRegisterQueue({ queuename: this.localexchangequeue });
                this.localexchangequeue = "";
            }
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        this.node.status({ fill: "red", shape: "dot", text: "Disconnected" });
        this.client.removeListener("onsignedin", this._onsignedin);
        this.client.removeListener("onclose", this._onsocketclose);
        if (done != null) done();
    }
}



export interface Iworkflow_out_node {
    state: string;
    form: string;
    removestate: boolean;
    name: string;
}
export class workflow_out_node {
    public node: Red = null;
    public name: string = "";
    // public host: string = "";
    public client: openiap;
    constructor(public config: Iworkflow_out_node) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.name = config.name;
        this.node = this;
        // this.host = Config.amqp_url;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    async oninput(msg: any, send: any, done: any) {
        try {
            try {
                this.node.status({});
                msg.state = this.config.state;
                if (this.config.state != "from msg.form") {
                    msg.form = this.config.form;
                }
                let priority: number = 1;
                if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
                if (msg._id !== null && msg._id !== undefined && msg._id !== "") {
                    if (this.config.removestate) {
                        let msgcopy: any = {};
                        msgcopy._id = msg._id;
                        msgcopy.queue = msg.queue;
                        msgcopy.name = msg.name;
                        msgcopy.workflow = msg.workflow;
                        msgcopy.targetid = msg.targetid;
                        msgcopy.replyto = msg.replyto;
                        msgcopy.correlationId = msg.correlationId;
                        msgcopy.queuename = msg.queuename;
                        msgcopy.consumerTag = msg.consumerTag;
                        msgcopy.exchange = msg.exchange;
                        msgcopy._msgid = msg._msgid;
                        msgcopy.state = msg.state;
                        msgcopy.form = msg.form;
                        this.node.status({ fill: "blue", shape: "dot", text: "Updating workflow instance" });
                        await this.client.UpdateOne({ collectionname: "workflow_instances", item: msgcopy, jwt: msg.jwt });
                    } else {
                        let msgcopy = Object.assign({}, msg);
                        delete msgcopy.jwt;
                        delete msgcopy.user;
                        // Logger.instanse.info("Updating workflow instance with id " + msg._id + " (" + msg.name + " with state " + msg.state);
                        this.node.status({ fill: "blue", shape: "dot", text: "Updating workflow instance" });
                        await this.client.UpdateOne({ collectionname: "workflow_instances", item: msgcopy, jwt: msg.jwt });
                    }
                }
            } catch (error) {
                Util.HandleError(this, error, msg);
            }
            try {
                if (!Util.IsNullEmpty(msg.resultqueue) && (msg.state == "completed" || msg.state == "failed")) {
                    const data: any = {};
                    data.state = msg.state;
                    if (msg.error) {
                        data.error = "error";
                        if (msg.error.message) {
                            data.error = msg.error.message;
                        }
                    }
                    data._id = msg._id;
                    data.payload = msg.payload;
                    data.values = msg.values;
                    data.jwt = msg.jwt;
                    const expiration: number = (typeof msg.expiration == 'number' ? msg.expiration : 500);
                    this.node.status({ fill: "blue", shape: "dot", text: "QueueMessage.1" });
                    await this.client.QueueMessage({ queuename: msg.resultqueue, data, correlationId: msg.correlationId, striptoken: false });

                    if (msg.resultqueue == msg._replyTo) msg._replyTo = null; // don't double message (??)

                }
            } catch (error) {
                Util.HandleError(this, error, msg);
            }
            try {
                // if (!Util.IsNullEmpty(msg._replyTo) && Util.IsNullEmpty(msg.resultqueue)) {
                if (!Util.IsNullEmpty(msg._replyTo)) {
                    if (msg.payload === null || msg.payload === undefined) { msg.payload = {}; }
                    const data: any = {};
                    data.state = msg.state;
                    if (msg.error) {
                        data.error = "error";
                        if (msg.error.message) {
                            data.error = msg.error.message;
                        }
                    }
                    data._id = msg._id;
                    data.payload = msg.payload;
                    data.values = msg.values;
                    data.jwt = msg.jwt;
                    // ROLLBACK
                    // Don't wait for ack(), we don't care if the receiver is there, right ?
                    this.node.status({ fill: "blue", shape: "dot", text: "Queue message for " + msg._replyTo });
                    await this.client.QueueMessage({ queuename: msg._replyTo, data, correlationId: msg.correlationId, striptoken: false });
                }
            } catch (error) {
                Util.HandleError(this, error, msg);
            }
            send(msg);
            done();
            this.node.status({});
        } catch (error) {
            done(error);
        }
        finally {
        }
    }
    onclose() {
    }
}

export async function get_workflow_forms(req, res) {
    try {
        const result: any[] = await Util.client.Query({
            collectionname: 'forms', query: { _type: "form" },
            projection: { name: 1 }, orderby: { name: -1 }, top: 1000
        })
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}


export async function get_workflows(req, res) {
    try {
        let query: any = { "_type": "workflow" };
        const ors = [];
        if (!Util.IsNullEmpty(req.query.name)) {
            ors.push({ name: { $regex: ".*" + req.query.name + ".*" } });
        } else { ors.push({}); }
        if (!Util.IsNullEmpty(req.query.id)) {
            ors.push({ _id: req.query.id });
        }
        if (ors.length > 0) {
            query = {
                $and: [
                    query,
                    { $or: ors }
                ]
            };
        }
        const result: any[] = await Util.client.Query({ collectionname: 'workflow', query, projection: { name: 1 }, orderby: { name: -1 } })
        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}





export interface Iassign_workflow_node {
    name: string;
    queue: string;
    targetid: string;
    workflowid: string;
    initialrun: boolean;
}
export class assign_workflow_node {
    public node: Red = null;
    public name: string = "";
    // public host: string;
    public localqueue: string = "";
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    public client: openiap;
    constructor(public config: Iassign_workflow_node) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        if (this.config == null || this.config.queue == null || this.config.queue == "") {
            this.node.status({ fill: "red", shape: "dot", text: "Missing queue name" });
            return;
        }
        // this.host = Config.amqp_url;
        this._onsignedin = this.onsignedin.bind(this);
        this._onsocketclose = this.onsocketclose.bind(this);
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);

        this.client.on("signedin", this._onsignedin);
        this.client.on("disconnected", this._onsocketclose);
        
        if (this.client.signedin) {
            this.connect();
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
            this.localqueue = this.config.queue;
            this.localqueue = await this.client.RegisterQueue({
                queuename: this.localqueue
            },(msg: any) => {
                this.OnMessage(msg);
                });
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });



            if (!Util.IsNullUndefinded(this.config.targetid) && !Util.IsNullUndefinded(this.config.workflowid)) {
                const res = await this.client.Query<any>({ collectionname: "users", query: { "_type": "role", "workflowid": this.config.workflowid }, top: 1 });
                if (res.length == 1) {
                    const role = res[0];
                    const exists = role.members.filter(x => x._id == this.config.targetid);
                    if (exists.length == 0) {
                        const who = this.client.client.user;
                        // (role as any).customerid = who.customerid;
                        role.members.push({name: "target", "_id": this.config.targetid});
                        await this.client.UpdateOne({ collectionname: "users", item: role });
                    }
                }
            }
        } catch (error) {
            this.localqueue = "";
            Util.HandleError(this, error, null);
            setTimeout(this.connect.bind(this), (Math.floor(Math.random() * 6) + 1) * 2000);
        }
    }
    async OnMessage(msg: any) {
        try {
            let result: any = {};
            let data: any = msg.data;
            if(typeof data === "string") data = JSON.parse(data);
            if (data.state == "idle") return;
            if (!Util.IsNullUndefinded(data.__user)) {
                data.user = data.__user;
                delete data.__user;
            }
            if (!Util.IsNullUndefinded(data.__jwt)) {
                data.jwt = data.__jwt;
                delete data.__jwt;
            }
            // delete data.jwt;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            let _id = data._id;
            if (_id === null || _id === undefined || _id === "") {
                if (data.payload !== null && data.payload !== undefined) {
                    if (data.payload._id !== null && data.payload._id !== undefined && data.payload._id !== "") {
                        _id = data.payload._id;
                    }
                }
            }
            if (_id !== null && _id !== undefined && _id !== "") {
                const res = await this.client.Query<any>({ collectionname: "workflow_instances", query: { "_id": _id }, projection: { "_parentid": 1 }, top: 1, jwt: data.jwt });
                if (res.length == 0) {
                    Util.HandleError(this, "Unknown workflow_instances id " + _id, msg);
                    return;
                }
                let _parentid = res[0]._parentid;
                if(data != null && data.payload != null && data.payload._parentid != null) {   _parentid = data.payload._parentid }
                if (_parentid !== null && _parentid !== undefined && _parentid !== "") {
                    const res2 = await this.client.Query<any>({ collectionname: "workflow_instances", query: { "_id": _parentid }, top: 1 });
                    if (res2.length == 0) {
                        Util.HandleError(this, "Unknown workflow_instances parentid " + _parentid, msg);
                        return;
                    }
                    const parentinstance = res2[0];
                    result = parentinstance.msg;
                    if (Util.IsNullUndefinded(result)) result = {};
                    result.state = data.state;
                    result.payload = data.payload;
                    result.jwt = data.jwt;
                    result.user = data.user;
                    this.node.send([null, result]);
                    await this.client.UpdateDocument({ collectionname: "workflow_instances", query: { _id: _parentid }, document: { "$set": { "state": "completed" } } })
                    return;
                } else {
                    const res = await this.client.Query<any>({ collectionname: "workflow_instances", query: { "_id": _id }, projection: { msg: 1 }, top: 1, jwt: data.jwt });
                    if (res.length > 0 && res[0].msg) {
                        result = res[0].msg;
                        result.state = data.state;
                    }
                }
            }
            result.payload = data.payload;
            result.jwt = data.jwt;
            result.user = data.user;
            this.node.send([null, result]);
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async oninput(msg: any) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            const workflowid = (!Util.IsNullEmpty(this.config.workflowid) ? this.config.workflowid : msg.workflowid);
            const targetid = (!Util.IsNullEmpty(this.config.targetid) ? this.config.targetid : msg.targetid);
            const initialrun = await Util.EvaluateNodeProperty<boolean>(this, msg, "initialrun");
            let topic = await Util.EvaluateNodeProperty<string>(this, msg, "topic");


            if (Util.IsNullEmpty(topic)) topic = this.config.name;
            if (Util.IsNullEmpty(topic)) topic = msg.name;
            if (Util.IsNullEmpty(topic)) topic = this.config.queue;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            if (Util.IsNullEmpty(targetid)) {
                this.node.status({ fill: "red", shape: "dot", text: "targetid is mandatory" });
                return;
            }
            if (Util.IsNullEmpty(workflowid)) {
                this.node.status({ fill: "red", shape: "dot", text: "workflowid is mandatory" });
                return;
            }
            let jwt = msg.jwt;
            if (Util.IsNullEmpty(jwt)) {
                jwt = this.client.client.jwt;
            }


            // msg.jwt = (await NoderedUtil.RenewToken({ jwt, longtoken: true })).jwt;
            let cloned = Object.assign({}, msg);

            const runnerinstance = new Base();
            runnerinstance._type = "instance";
            runnerinstance.name = "runner: " + topic;
            (runnerinstance as any).queue = this.localqueue;
            (runnerinstance as any).state = "idle";
            (runnerinstance as any).msg = cloned;
            (runnerinstance as any).jwt = msg.jwt;
            const who = this.client.client.user;
            Base.addRight(runnerinstance, who._id, who.name, [-1]);

            const size = JSON.stringify(runnerinstance).length * 2; // 2B per character
            if (size > (512 * 1024)) {
                throw new Error("msg object is over 512KB in size, please clean up the msg object before using Assign");
            }

            const res3 = await this.client.InsertOne<Base>({ collectionname: "workflow_instances", item: runnerinstance, jwt });
            msg._parentid = res3._id;
            try {
                msg.payload._parentid = res3._id;
            } catch (error) {
                msg.payload = { data: msg.payload, _parentid: res3._id }
            }
            msg.newinstanceid = await this.client.CreateWorkflowInstance({ targetid, workflowid, name: topic, resultqueue: this.localqueue, data: msg.payload, initialrun, jwt });
            this.node.send(msg);
            this.node.status({ fill: "green", shape: "dot", text: "Connected " + this.localqueue });
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        // if (!Util.IsNullEmpty(this.localqueue) && removed) {
        if (!Util.IsNullEmpty(this.localqueue)) {
            await this.client.UnRegisterQueue({ queuename: this.localqueue });
            this.localqueue = "";
        }
        this.client.removeListener("onsignedin", this._onsignedin);
        this.client.removeListener("onclose", this._onsocketclose);
        if (done != null) done();
    }
}