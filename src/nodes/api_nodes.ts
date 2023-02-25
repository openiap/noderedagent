import { config } from "@openiap/nodeapi";
const { info, warn, err } = config;
import * as os from "os";
import * as RED from "node-red";
import * as fs from "fs"
import { Red } from "node-red";
import { Util } from "./Util";
import { Base, openiap } from "@openiap/nodeapi";
const pako = require('pako');

export interface Iapi_credentials {
    name: string;
}
export class api_credentials {
    public node: Red = null;
    public name: string = "";
    public username: string = "";
    public password: string = "";
    constructor(public config: Iapi_credentials) {
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
        this.node.status({});
        if (this.node.credentials && this.node.credentials.hasOwnProperty("username")) {
            this.username = this.node.credentials.username;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("password")) {
            this.password = this.node.credentials.password;
        }
    }
}
export interface Iapi_get_jwt {
    config: any;
    name: string;
    longtoken: boolean;
    refresh: boolean;
}
export class api_get_jwt {
    public node: Red = null;
    public name: string = "";
    public client: openiap;
    constructor(public config: Iapi_get_jwt) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.status({});
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    isNumeric(num) {
        return !isNaN(num)
    }
    async oninput(msg: any) {
        // let traceId: string; let spanId: string
        // let logmsg = WebServer.log_messages[msg._msgid];
        // if (logmsg != null) {
        //     traceId = logmsg.traceId;
        //     spanId = logmsg.spanId;
        // }
        // let span = Logger.otel.startSpan("api get jwt", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            let username: string = null;
            let password: string = null;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            const config: api_credentials = RED.nodes.getNode(this.config.config);
            if (!Util.IsNullUndefinded(config) && !Util.IsNullEmpty(config.username)) {
                username = config.username;
            }
            if (!Util.IsNullUndefinded(config) && !Util.IsNullEmpty(config.password)) {
                password = config.password;
            }
            if (!Util.IsNullEmpty(msg.username)) { username = msg.username; }
            if (!Util.IsNullEmpty(msg.password)) { password = msg.password; }


            this.node.status({ fill: "blue", shape: "dot", text: "Requesting token" });
            let reply = null;
            if (!Util.IsNullEmpty(username) && !Util.IsNullEmpty(password)) {
                reply = await this.client.Signin({ username, password, validateonly: true})
            } else if (this.config.refresh && !Util.IsNullEmpty(msg.jwt)) {
                reply = await this.client.Signin({ jwt: msg.jwt, validateonly: true})
            } else {
                reply = await this.client.Signin({ jwt: this.client.client.jwt, validateonly: true})
            }
            msg.jwt = reply.jwt;
            msg.user = reply.user;
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            let message = error.message ? error.message : error;
            Util.HandleError(this, message, msg);
            this.node.status({ fill: 'red', shape: 'dot', text: message.toString().substr(0, 32) });
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
export interface Iapi_get {
    resultfield: string;
    collection: string;
    query: any;
    projection: any;
    orderby: any;
    top: number;
    skip: number;
    name: string;
}
export class api_get {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_get) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api get jwt", traceId, spanId);
        let span = null;
        try {
            if (!this.client.connected) {
                await new Promise(r => setTimeout(r, 2000));
            }
            this.node.status({});
            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            let query = await Util.EvaluateNodeProperty<any>(this, msg, "query");
            let projection = await Util.EvaluateNodeProperty<string>(this, msg, "projection");
            let orderby = await Util.EvaluateNodeProperty<any>(this, msg, "orderby");
            let top = await Util.EvaluateNodeProperty<number>(this, msg, "top");
            let skip = await Util.EvaluateNodeProperty<number>(this, msg, "skip");
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            top = parseInt(top as any);
            skip = parseInt(skip as any);

            if (!Util.IsNullEmpty(orderby) && Util.IsString(orderby)) {
                if (orderby.indexOf("{") > -1) {
                    try {
                        orderby = JSON.parse(orderby);
                    } catch (error) {
                        Util.HandleError(this, "Error parsing orderby", msg);
                        return;
                    }
                }
            }
            if (!Util.IsNullEmpty(orderby) && Util.IsString(orderby)) {
                const field: string = orderby;
                orderby = {};
                orderby[field] = -1;
            }
            if (Util.IsNullEmpty(query)) {
                query = {} as any;
            } else if (Util.IsString(query)) {
                query = JSON.parse(query);
            }
            if (Util.IsNullEmpty(projection)) {
                projection = {} as any;
            } else if (Util.IsString(projection)) {
                try {
                    projection = JSON.parse(projection);
                } catch (error) {
                    Util.HandleError(this, "Error parsing projection", msg);
                    return;
                }
            }
            if (Util.IsNullEmpty(projection)) { projection = null; }

            this.node.status({ fill: "blue", shape: "dot", text: "Getting query" });
            let result: any[] = [];
            const pageby: number = 250;
            let subresult: any[] = [];
            let take: number = (top > pageby ? pageby : top);
            do {
                if (subresult.length == pageby && result.length < top) {
                    this.node.status({ fill: "blue", shape: "dot", text: "Getting " + skip + " " + (skip + pageby) });
                    await Util.Delay(50);
                }
                if ((result.length + take) > top) {
                    take = top - result.length;
                }
                subresult = await this.client.Query({ collectionname, query, projection, orderby, top: take, skip, jwt: msg.jwt });
                skip += take;
                result = result.concat(subresult);
                if (result.length > top) {
                    result = result.splice(0, top);
                }
            } while (subresult.length == pageby && result.length < top);

            if (!Util.IsNullEmpty(this.config.resultfield)) {
                Util.SetMessageProperty(msg, this.config.resultfield, result);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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

export interface Iapi_add {
    entitytype: string;
    collection: string;
    entities: string;
    writeconcern: number;
    journal: boolean;
    name: string;
    // backward compatibility
    inputfield: string;
    resultfield: string;
}
export class api_add {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_add) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            // if (Util.IsNullEmpty(msg.jwt)) { return Util.HandleError(this, "Missing jwt token"); }

            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            const entitytype = await Util.EvaluateNodeProperty<string>(this, msg, "entitytype");

            let writeconcern = this.config.writeconcern;
            let journal = this.config.journal;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (!Util.IsNullEmpty(msg.writeconcern)) { writeconcern = msg.writeconcern; }
            if (!Util.IsNullEmpty(msg.journal)) { journal = msg.journal; }
            if ((writeconcern as any) === undefined || (writeconcern as any) === null) writeconcern = 0;
            if ((journal as any) === undefined || (journal as any) === null) journal = false;

            let data: any[] = [];

            let _data: any[];
            if (this.config.entities == null && _data == null && this.config.inputfield != null) {
                _data = msg[this.config.inputfield];
            } else {
                _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
                if (_data as any == "payload") {
                    _data = msg["payload"];

                }
            }

            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            this.node.status({ fill: "blue", shape: "dot", text: "processing " + data.length + " items" });
            let Promises: Promise<any>[] = [];
            let results: any[] = [];
            for (let y: number = 0; y < data.length; y += 50) {
                for (let i: number = y; i < (y + 50) && i < data.length; i++) {
                    const element: any = data[i];
                    if (!Util.IsNullEmpty(entitytype)) {
                        element._type = entitytype;
                    }
                    Promises.push(this.client.InsertOne({ collectionname, item: element, w: writeconcern, j: journal, jwt: msg.jwt }));
                }
                this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                const tempresults = await Promise.all(Promises.map(p => p.catch(e => e)));
                results = results.concat(tempresults);
                Promises = [];
            }
            data = results;

            const errors = data.filter(result => Util.IsString(result) || (result instanceof Error));
            if (errors.length > 0) {
                for (let i: number = 0; i < errors.length; i++) {
                    Util.HandleError(this, errors[i], msg);
                }
            }
            data = data.filter(result => !Util.IsString(result) && !(result instanceof Error));

            if (this.config.entities == null && this.config.resultfield != null) {
                Util.SetMessageProperty(msg, this.config.resultfield, data);
            } else {
                Util.SetMessageProperty(msg, this.config.entities, data);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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


export interface Iapi_addmany {
    collection: string;
    entitytype: string;
    entities: string;
    writeconcern: number;
    skipresults: boolean;
    journal: boolean;
    name: string;
    // backward compatibility
    resultfield: string;
    inputfield: string;
}
export class api_addmany {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_addmany) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            // if (Util.IsNullEmpty(msg.jwt)) { return Util.HandleError(this, "Missing jwt token"); }

            let writeconcern = this.config.writeconcern;
            let journal = this.config.journal;
            let skipresults = this.config.skipresults;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (!Util.IsNullEmpty(msg.writeconcern)) { writeconcern = msg.writeconcern; }
            if (!Util.IsNullEmpty(msg.journal)) { journal = msg.journal; }
            if (!Util.IsNullEmpty(msg.skipresults)) { skipresults = msg.skipresults; }
            if ((writeconcern as any) === undefined || (writeconcern as any) === null) writeconcern = 0;
            if ((journal as any) === undefined || (journal as any) === null) journal = false;
            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            const entitytype = await Util.EvaluateNodeProperty<string>(this, msg, "entitytype");

            let _data: any[];
            if (this.config.entities == null && _data == null && this.config.inputfield != null) {
                _data = msg[this.config.inputfield];
            } else {
                _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            }


            // let entities: any[] = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            // if (this.config.entities == null && entities == null && this.config.inputfield != null) {
            //     entities = msg[this.config.inputfield];
            // }

            let data: any[] = [];
            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            if (data.length > 0) {
                this.node.status({ fill: "blue", shape: "dot", text: "processing " + data.length + " items" });
                let results: any[] = [];
                for (let y: number = 0; y < data.length; y += 50) {
                    let subitems: any[] = [];
                    for (let i: number = y; i < (y + 50) && i < data.length; i++) {
                        const element: any = data[i];
                        if (!Util.IsNullEmpty(entitytype)) {
                            element._type = entitytype;
                        }
                        subitems.push(element);
                    }
                    this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                    results = results.concat(await this.client.InsertMany({ collectionname, items: subitems, w: writeconcern, j: journal, skipresults, jwt: msg.jwt }));
                }
                data = results;
            }
            if (this.config.entities == null && this.config.resultfield != null) {
                Util.SetMessageProperty(msg, this.config.resultfield, data);
            } else {
                Util.SetMessageProperty(msg, this.config.entities, data);
            }

            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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



export interface Iapi_update {
    entitytype: string;
    collection: string;
    entities: string;
    writeconcern: number;
    journal: boolean;
    name: string;
    // backward compatibility
    inputfield: string;
    resultfield: string;
}
export class api_update {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_update) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            const entitytype = await Util.EvaluateNodeProperty<string>(this, msg, "entitytype");
            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");

            let _data: any[];
            if (this.config.entities == null && _data == null && this.config.inputfield != null) {
                _data = msg[this.config.inputfield];
            } else {
                _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            }

            let writeconcern = this.config.writeconcern;
            let journal = this.config.journal;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (!Util.IsNullEmpty(msg.writeconcern)) { writeconcern = msg.writeconcern; }
            if (!Util.IsNullEmpty(msg.journal)) { journal = msg.journal; }
            if ((writeconcern as any) === undefined || (writeconcern as any) === null) writeconcern = 0;
            if ((journal as any) === undefined || (journal as any) === null) journal = false;

            let data: any[] = [];
            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
            let Promises: Promise<any>[] = [];
            let results: any[] = [];
            // for (let y: number = 0; y < data.length; y += 50) {
            //     for (let i: number = y; i < (y + 50) && i < data.length; i++) {
            //         const element: any = data[i];
            //         if (!Util.IsNullEmpty(entitytype)) {
            //             element._type = entitytype;
            //         }
            //         Promises.push(NoderedUtil.UpdateOne({ collectionname, item: element, w: writeconcern, j: journal, jwt: msg.jwt }));
            //     }
            //     this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
            //     const tempresults = await Promise.all(Promises.map(p => p.catch(e => e)));
            //     results = results.concat(tempresults);
            //     Promises = [];
            // }
            for (let y: number = 0; y < data.length; y += 50) {
                let items = [];
                for (let i: number = y; i < (y + 50) && i < data.length; i++) {
                    const element: any = data[i];
                    if (!Util.IsNullEmpty(entitytype)) {
                        element._type = entitytype;
                    }
                    items.push(element);
                }
                this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                var tempresults = await this.client.InsertOrUpdateMany({ collectionname, uniqeness: "_id", items, skipresults: false, j: journal, w: writeconcern, jwt: msg.jwt });
                results = results.concat(tempresults);
            }

            data = results;


            const errors = data.filter(result => Util.IsString(result) || (result instanceof Error));
            if (errors.length > 0) {
                for (let i: number = 0; i < errors.length; i++) {
                    Util.HandleError(this, errors[i], msg);
                }
                return;
            }
            data = data.filter(result => !Util.IsString(result) && !(result instanceof Error));
            if (this.config.entities == null && this.config.resultfield != null) {
                Util.SetMessageProperty(msg, this.config.resultfield, data);
            } else {
                Util.SetMessageProperty(msg, this.config.entities, data);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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



export interface Iapi_addorupdate {
    entitytype: string;
    collection: string;
    entities: string;
    entitiestype: string;
    uniqeness: string;
    writeconcern: number;
    journal: boolean;
    name: string;
    // backward compatibility
    inputfield: string;
    // resultfield: string;
}
export class api_addorupdate {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_addorupdate) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            const entitytype = await Util.EvaluateNodeProperty<string>(this, msg, "entitytype");
            const uniqeness = await Util.EvaluateNodeProperty<string>(this, msg, "uniqeness");
            let _data: any[];
            if (this.config.entities == null && _data == null && this.config.inputfield != null) {
                _data = msg[this.config.inputfield];
            } else {
                _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            }

            let writeconcern = this.config.writeconcern;
            let journal = this.config.journal;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (!Util.IsNullEmpty(msg.writeconcern)) { writeconcern = msg.writeconcern; }
            if (!Util.IsNullEmpty(msg.journal)) { journal = msg.journal; }
            if ((writeconcern as any) === undefined || (writeconcern as any) === null) writeconcern = 0;
            if ((journal as any) === undefined || (journal as any) === null) journal = false;

            let data: any[] = [];
            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
            let Promises: Promise<any>[] = [];
            let results: any[] = [];
            // for (let y: number = 0; y < data.length; y += 50) {
            //     for (let i: number = y; i < (y + 50) && i < data.length; i++) {
            //         const element: any = data[i];
            //         if (!Util.IsNullEmpty(entitytype)) {
            //             element._type = entitytype;
            //         }
            //         Promises.push(NoderedUtil.InsertOrUpdateOne({ collectionname, item: element, uniqeness, w: writeconcern, j: journal, jwt: msg.jwt, priority }));
            //     }
            //     this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
            //     const tempresults = await Promise.all(Promises.map(p => p.catch(e => e)));
            //     results = results.concat(tempresults);
            //     Promises = [];
            // }
            // data = results;
            let skipresults: boolean = false;
            if (Util.IsNullEmpty(this.config.entities) && this.config.entitiestype == "msg") {
                skipresults = true;
            }

            for (let y: number = 0; y < data.length; y += 50) {
                let items = [];
                for (let i: number = y; i < (y + 50) && i < data.length; i++) {
                    const element: any = data[i];
                    if (!Util.IsNullEmpty(entitytype)) {
                        element._type = entitytype;
                    }
                    items.push(element);
                }
                this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                var tempresults = await this.client.InsertOrUpdateMany({ collectionname, uniqeness, items, skipresults, j: journal, w: writeconcern, jwt: msg.jwt })
                results = results.concat(tempresults);
            }
            if (!skipresults) {
                Util.SetMessageProperty(msg, this.config.entities, results);
            }

            // const errors = data.filter(result => Util.IsString(result) || (result instanceof Error));
            // if (errors.length > 0) {
            //     for (let i: number = 0; i < errors.length; i++) {
            //         Util.HandleError(this, errors[i], msg);
            //     }
            // }
            // data = data.filter(result => !Util.IsString(result) && !(result instanceof Error));
            // if (this.config.entities == null && this.config.resultfield != null) {
            //     Util.SetMessageProperty(msg, this.config.resultfield, data);
            // } else {
            //     Util.SetMessageProperty(msg, this.config.entities, data);
            // }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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





export interface Iapi_delete {
    collection: string;
    inputfield: string;
    entities: string;
    name: string;
}
export class api_delete {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_delete) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            let _data: any[];
            if (this.config.entities == null && _data == null && this.config.inputfield != null) {
                _data = msg[this.config.inputfield];
            } else {
                _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            }

            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            let data: any[] = [];
            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
            let Promises: Promise<any>[] = [];
            let results: any[] = [];
            for (let y: number = 0; y < data.length; y += 50) {
                for (let i: number = y; i < (y + 50) && i < data.length; i++) {
                    const element: any = data[i];
                    let id: string = element;
                    if (Util.isObject(element)) { id = element._id; }
                    Promises.push(this.client.DeleteOne({ collectionname, id, jwt: msg.jwt }));
                }
                this.node.status({ fill: "blue", shape: "dot", text: (y + 1) + " to " + (y + 50) + " of " + data.length });
                const tempresults = await Promise.all(Promises.map(p => p.catch(e => e)));
                results = results.concat(tempresults);
                Promises = [];
            }
            data = results;

            const errors = data.filter(result => Util.IsString(result) || (result instanceof Error));
            if (errors.length > 0) {
                for (let i: number = 0; i < errors.length; i++) {
                    Util.HandleError(this, errors[i], msg);
                }
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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



export interface Iapi_deletemany {
    inputfield: string;
    query: string;
    querytype: string;
    collection: string;
    collectiontype: string;
    name: string;
}
export class api_deletemany {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_deletemany) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            let query = await Util.EvaluateNodeProperty<any[]>(this, msg, "query");


            let ids: string[] = null;
            if (Array.isArray(query)) {
                if(query.length == 0) {
                    this.node.send(msg);
                    this.node.status({ fill: "green", shape: "dot", text: "Empty array received" });
                    return;        
                }
                var _data: any[] = query;
                ids = [];
                for (let i: number = 0; i < _data.length; i++) {
                    let id: string = _data[i];
                    if (Util.isObject(_data[i])) { id = _data[i]._id; }
                    ids.push(id);
                }
                query = null;
            }
            if(ids && ids.length > 0) {
                query = {"_id": {"$in": ids}} as any
                // throw new Error("ID's no longer supportd, use query!")
            }
            this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
            const affectedrows = await this.client.DeleteMany({ collectionname, query, jwt: msg.jwt });
            this.node.send(msg);
            this.node.status({ fill: "green", shape: "dot", text: "deleted " + affectedrows + " rows" });
        } catch (error) {
            Util.HandleError(this, error, msg);
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

export async function get_api_roles(req, res) {
    try {
        let query: any = { _type: "role" };
        if (!Util.IsNullEmpty(req.query.name)) {
            query = { _type: "role", name: { $regex: ".*" + req.query.name + ".*" } };
        }
        const result: any[] = await Util.client.Query({ collectionname: 'users', query, projection: { name: 1 }, orderby: { name: -1 }, top: 1000 });

        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}


export async function get_api_userroles(req, res) {
    try {
        let query: any = { $or: [{ _type: "role" }, { _type: "user" }] };
        const ors = [];
        let q:any = null;
        if (!Util.IsNullEmpty(req.query.name)) {
            q = { "$or": [{name: req.query.name}, {username: req.query.name}, {email: req.query.name}] }
            ors.push({ 
                "$or" : [
                    {name: new RegExp([req.query.name].join(""), "i")},
                    {email: new RegExp([req.query.name].join(""), "i")},
                    {username: new RegExp([req.query.name].join(""), "i")}
                ]});
        } else { ors.push({}); }
        if (!Util.IsNullEmpty(req.query.id)) {
            ors.push({ _id: req.query.id });
        }
        if (ors.length > 0) {
            query = {
                $and: [
                    { $or: [{ _type: "role" }, { _type: "user" }] },
                    { $or: ors }
                ]
            };
        }
        let result: any[] = [];
        if(q != null) {
            result = await Util.client.Query({ collectionname: 'users', query: q, projection: { name: 1 }, orderby: { name: -1 } });
        }
        if(result.length == 1) {
            var list = await Util.client.Query<any>({ collectionname: 'users', query, projection: { name: 1 }, orderby: { name: -1 } });
            list = list.map(x => x._id != result[0]._id )
            result = result.concat(list);
        } else {
            var list = await Util.client.Query<any>({ collectionname: 'users', query, projection: { name: 1 }, orderby: { name: -1 } });
            result = result.concat(list);
        }
        if (!Util.IsNullEmpty(req.query.id)) {
            const exists = result.filter(x => x._id == req.query.id);
            if (exists.length == 0) {
                const result2: any[] = await Util.client.Query({ collectionname: 'users', query: { _id: req.query.id }, projection: { name: 1 }, orderby: { name: -1 }, top: 1 });
                if (result2.length == 1) {
                    result.push(result2[0]);
                }
            }
        }

        res.json(result);
    } catch (error) {
        err(error)
        res.status(500).json(error);
    }
}

export async function get_api_users(req, res) {
    try {
        let query: any = { _type: "user" };
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
                    { _type: "user" },
                    { $or: ors }
                ]
            };
        }

        const result: any[] = await Util.client.Query({ collectionname: 'users', query, projection: { name: 1 }, orderby: { name: -1 } });
        if (!Util.IsNullEmpty(req.query.id)) {
            const exists = result.filter(x => x._id == req.query.id);
            if (exists.length == 0) {
                const result2: any[] = await Util.client.Query({ collectionname: 'users', query: { _id: req.query.id }, projection: { name: 1 }, orderby: { name: -1 }, top: 1 });
                if (result2.length == 1) {
                    result.push(result2[0]);
                }
            }
        }

        res.json(result);
    } catch (error) {
        res.status(500).json(error);
    }
}






export interface Iapi_updatedocument {
    name: string;
    writeconcern: number;
    journal: boolean;
    action: string;
    query: string;
    updatedocument: string;
    collection: string;
}
export class api_updatedocument {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_updatedocument) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            let query = await Util.EvaluateNodeProperty<any>(this, msg, "query");
            let updatedocument = await Util.EvaluateNodeProperty<any>(this, msg, "updatedocument");

            let action = this.config.action;
            let writeconcern = this.config.writeconcern;
            let journal = this.config.journal;
            const jwt = msg.jwt;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            if (!Util.IsNullEmpty(msg.action)) { action = msg.action; }
            if (!Util.IsNullEmpty(msg.writeconcern)) { writeconcern = msg.writeconcern; }
            if (!Util.IsNullEmpty(msg.journal)) { journal = msg.journal; }

            if ((writeconcern as any) === undefined || (writeconcern as any) === null) writeconcern = 0;
            if ((journal as any) === undefined || (journal as any) === null) journal = false;

            if (!Util.IsNullEmpty(query) && Util.IsString(query)) {
                query = JSON.parse(query);
            }
            if (!Util.IsNullEmpty(updatedocument) && Util.IsString(updatedocument)) {
                updatedocument = JSON.parse(updatedocument);
            }

            this.node.status({ fill: "blue", shape: "dot", text: "Running Update Document" });
            const q2 = await this.client.UpdateDocument({collectionname, document: updatedocument,query, w: writeconcern, j: journal, jwt: msg.jwt});
            msg.payload = q2;
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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







export interface Igrant_permission {
    targetid: string;
    entities: any;
    bits: any;
    name: string;
}
export class grant_permission {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Igrant_permission) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            // if (Util.IsNullEmpty(msg.jwt)) { return Util.HandleError(this, "Missing jwt token"); }
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            let targetid: string = "";
            if (this.config.targetid == "from msg.targetid" || Util.IsNullEmpty(this.config.targetid)) {
                targetid = msg.targetid;
            } else {
                targetid = this.config.targetid;
            }
            if (Util.IsNullEmpty(targetid)) {
                throw new Error("targetid is null or empty");
            }
            let bits = this.config.bits;
            if (!Util.IsNullUndefinded(msg.bits)) { bits = msg.bits; }
            if (Util.IsNullUndefinded(bits)) {
                throw new Error("bits is null or empty");
            }


            if (!Array.isArray(this.config.bits)) {
                this.config.bits = this.config.bits.split(',');
            }
            for (let i = 0; i < this.config.bits.length; i++) {
                this.config.bits[i] = parseInt(this.config.bits[i]);
            }

            const result: any[] = await this.client.Query({ collectionname: 'users', query: { _id: targetid }, projection: { name: 1 }, orderby: { name: -1 }, top: 1, jwt: msg.jwt })
            if (result.length === 0) { return Util.HandleError(this, "Target " + targetid + " not found ", msg); }
            const found = result[0];

            let data: any[] = [];
            const _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            this.node.status({ fill: "blue", shape: "dot", text: "processing ..." });
            for (let i = 0; i < data.length; i++) {
                if (Util.IsNullEmpty(data[i]._type) && !Util.IsNullUndefinded(data[i].metadata)) {
                    const metadata: Base = (data[i].metadata as any);
                    Base.addRight(metadata, targetid, found.name, this.config.bits);
                    data[i].metadata = metadata;
                } else {
                    const entity: Base = data[i];
                    Base.addRight(entity, targetid, found.name, this.config.bits);
                    data[i] = entity;
                }
                if ((i % 50) == 0 && i > 0) {
                    this.node.status({ fill: "blue", shape: "dot", text: "processed " + i + " of " + data.length });
                    await Util.Delay(50);
                }
            }
            Util.saveToObject(msg, this.config.entities, data);
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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




export interface Irevoke_permission {
    targetid: string;
    entities: any;
    bits: any;
    name: string;
}
export class revoke_permission {
    public node: Red = null;
    public name: string;
    constructor(public config: Irevoke_permission) {
        RED.nodes.createNode(this, config);
        this.node = this;
        this.name = config.name;
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            let targetid: string = "";
            if (this.config.targetid == "from msg.targetid" || Util.IsNullEmpty(this.config.targetid)) {
                targetid = msg.targetid;
            } else {
                targetid = this.config.targetid;
            }
            if (Util.IsNullEmpty(targetid)) {
                throw new Error("targetid is null or empty");
            }
            let bits = this.config.bits;
            if (!Util.IsNullUndefinded(msg.bits)) { bits = msg.bits; }
            if (Util.IsNullUndefinded(bits)) {
                throw new Error("bits is null or empty");
            }



            if (!Array.isArray(bits)) {
                bits = bits.split(',');
            }
            for (let i = 0; i < bits.length; i++) {
                bits[i] = parseInt(bits[i]);
            }

            let data: any[] = [];
            const _data = await Util.EvaluateNodeProperty<any[]>(this, msg, "entities");
            if (!Util.IsNullUndefinded(_data)) {
                if (!Array.isArray(_data)) { data.push(_data); } else { data = _data; }
                if (data.length === 0) {
                    this.node.status({ fill: "yellow", shape: "dot", text: "input array is empty" });
                }
            } else { this.node.warn("Input data is null"); }

            for (let i = 0; i < data.length; i++) {

                if (Util.IsNullEmpty(data[i]._type) && !Util.IsNullUndefinded(data[i].metadata)) {
                    const metadata: Base = data[i].metadata;
                    if (bits.indexOf(-1) > -1) {
                        metadata._acl = metadata._acl.filter((m: any) => { return m._id !== targetid; });
                    } else {
                        Base.removeRight(metadata, targetid, bits);
                    }
                    data[i].metadata = metadata;
                } else {
                    const entity: Base = data[i];
                    if (bits.indexOf(-1) > -1) {
                        entity._acl = entity._acl.filter((m: any) => { return m._id !== targetid; });
                    } else {
                        Base.removeRight(entity, targetid, bits);
                    }
                    data[i] = entity;
                }
            }
            Util.saveToObject(msg, this.config.entities, data);
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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



export interface Idownload_file {
    fileid: string;
    filename: string;
    name: string;
    asbuffer: boolean;
    result: string;
}
export class download_file {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Idownload_file) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            const fileid = await Util.EvaluateNodeProperty<string>(this, msg, "fileid");
            const filename = await Util.EvaluateNodeProperty<string>(this, msg, "filename", true);
            let asbuffer: boolean = this.config.asbuffer;
            if (Util.IsNullEmpty(asbuffer)) asbuffer = false;
            asbuffer = Boolean(asbuffer);;
            const jwt = msg.jwt;
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            this.node.status({ fill: "blue", shape: "dot", text: "Getting file" });
            const file = await this.client.DownloadFile({ filename, id: fileid, jwt: msg.jwt });
            var result = null;
            result = fs.readFileSync(file.filename);
            // if (asbuffer) {
            //     var data = Buffer.from(file.file, 'base64');
            //     result = pako.inflate(data);
            //     result = Buffer.from(result);
            // } else {
            //     result = file.file;
            // }
            Util.SetMessageProperty(msg, this.config.result, result);
            Util.SetMessageProperty(msg, this.config.filename, file.filename);
            msg.id = file.id;
            msg.mimeType = file.mimetype;

            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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


export interface Iuploadload_file {
    filename: string;
    mimeType: string;
    name: string;
    content: string;
    entity: string;
}
export class upload_file {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iuploadload_file) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});

            const jwt = msg.jwt;
            const filename = await Util.EvaluateNodeProperty<string>(this, msg, "filename");
            const mimeType = await Util.EvaluateNodeProperty<string>(this, msg, "mimeType");
            const filecontent = await Util.EvaluateNodeProperty<string>(this, msg, "content");
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            this.node.status({ fill: "blue", shape: "dot", text: "Saving file" });
            fs.writeFileSync(filename,  filecontent)
            const file = await this.client.UploadFile({filename, jwt: msg.jwt});
            Util.SetMessageProperty(msg, this.config.entity, file.id);

            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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






export interface Iapi_aggregate {
    collection: string;
    collectiontype: string;
    aggregates: object[];
    aggregatestype: string;
    name: string;
}
export class api_aggregate {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Iapi_aggregate) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
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
        // let span = Logger.otel.startSpan("api update", traceId, spanId);
        let span = null;
        try {
            this.node.status({});
            // if (Util.IsNullEmpty(msg.jwt)) { return Util.HandleError(this, "Missing jwt token"); }

            const collectionname = await Util.EvaluateNodeProperty<string>(this, msg, "collection");
            const aggregates = await Util.EvaluateNodeProperty<object[]>(this, msg, "aggregates");

            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            this.node.status({ fill: "blue", shape: "dot", text: "Running aggregate" });
            const result = await this.client.Aggregate({ collectionname, aggregates, jwt: msg.jwt });
            msg.payload = result;
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
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


export interface Iapi_watch {
    collection: string;
    aggregates: string[];
    name: string;
}
export class api_watch {
    public node: Red = null;
    public name: string;
    public watchid: string = "";
    private _onsignedin: any = null;
    private _onsocketclose: any = null;
    public client: openiap;
    constructor(public config: Iapi_watch) {
        RED.nodes.createNode(this, config);
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
    }
    onsignedin() {
        this.connect();
    }
    onsocketclose(message) {
        if (message == null) message = "";
        if (this != null && this.node != null) this.node.status({ fill: "red", shape: "dot", text: "Disconnected " + message });
    }
    async connect() {
        this.node.status({ fill: "blue", shape: "dot", text: "Setting up watch" });
        if(typeof this.config.aggregates === "string") this.config.aggregates = JSON.parse(this.config.aggregates)
        this.watchid = await this.client.Watch({ collectionname: this.config.collection, paths: this.config.aggregates }, this.onevent.bind(this))
        this.node.status({ fill: "green", shape: "dot", text: "watchid " + this.watchid });
    }
    onevent(operation:string, document: any) {
        const msg = {
            _msgid: Util.GetUniqueIdentifier(),
            payload: document
        }
        // WebServer.log_messages[event._msgid] = new log_message(event._msgid);
        // WebServer.log_messages[event._msgid].traceId = event.traceId;
        // WebServer.log_messages[event._msgid].spanId = event.spanId;
        // log_message.nodestart(event._msgid, this.node.id);
        this.node.send(msg);
    }   
    async onclose(removed: boolean, done: any) {
        try {
            this.node.status({ text: "Closing . . ." });
            if (!Util.IsNullEmpty(this.watchid)) {
                await this.client.UnWatch({ id: this.watchid });
            }
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        this.watchid = null;
        this.node.status({ text: "Not watching" });
        this.client.removeListener("signedin", this._onsignedin);
        this.client.removeListener("disconnected", this._onsocketclose);
        if (done != null) done();
    }
}



export interface Ilist_collections {
    name: string;
    results: string;
}
export class list_collections {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Ilist_collections) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    async oninput(msg: any) {
        try {
            this.node.status({});

            // if (Util.IsNullEmpty(msg.jwt)) { return Util.HandleError(this, "Missing jwt token"); }
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            const collections = await this.client.ListCollections({jwt: msg.jwt});
            if (!Util.IsNullEmpty(this.config.results)) {
                Util.saveToObject(msg, this.config.results, collections);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    onclose() {
    }
}




export interface Idrop_collection {
    name: string;
    collectioname: string;
}
export class drop_collection {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Idrop_collection) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    async oninput(msg: any) {
        try {
            this.node.status({});
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }
            const collectionname: any = await Util.EvaluateNodeProperty<string>(this, msg, "collectioname");
            await this.client.DropCollection({ collectionname, jwt: msg.jwt });
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    onclose() {
    }
}


// export interface Ihousekeeping {
//     name: string;
//     skipnodered: boolean
//     skipcalculatesize: boolean;
//     skipupdateusersize: boolean;
// }
// export class housekeeping {
//     public node: Red = null;
//     public name: string;
//     constructor(public config: Ihousekeeping) {
//         RED.nodes.createNode(this, config);
//         this.node = this;
//         this.name = config.name;
//         this.node.on("input", this.oninput);
//         this.node.on("close", this.onclose);
//     }
//     async oninput(msg: any) {
//         try {
//             let priority: number = 1;
//             if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

//             const { skipnodered, skipcalculatesize, skipupdateusersize } = this.config;

//             this.node.status({ fill: "blue", shape: "dot", text: "Running house keeping" });
//             await NoderedUtil.HouseKeeping({ skipnodered, skipcalculatesize, skipupdateusersize, jwt: msg.jwt, priority });
//             this.node.send(msg);
//             this.node.status({ fill: "green", shape: "dot", text: "Complete" });
//         } catch (error) {
//             Util.HandleError(this, error, msg);
//         }
//     }
//     onclose() {
//     }
// }


export interface Imemorydump {
    name: string;
    nodered: boolean
    openflow: boolean;
}
export class memorydump {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Imemorydump) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
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
        // let span = Logger.otel.startSpan("api get jwt", traceId, spanId);
        let span = null;
        try {
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            const { nodered, openflow } = this.config;

            if (nodered) {
                this.node.status({ fill: "blue", shape: "dot", text: "Creating heap dump" });
                // wait one second, to allow the status to be sent
                await new Promise(resolve => { setTimeout(resolve, 1000) });
                await this.createheapdump(msg.jwt, span);

            }
            if (openflow) {
                this.node.status({ fill: "blue", shape: "dot", text: "Running memory dump" });
                await this.client.CustomCommand({ command: "heapdump", jwt: msg.jwt });
            }

            this.node.send(msg);
            if (!nodered) {
                this.node.status({ fill: "green", shape: "dot", text: "Complete" });
            }
        } catch (error) {
            let message = error.message ? error.message : error;
            // this.node.error(new Error(message), msg);
            Util.HandleError(this, message, msg);
            this.node.status({ fill: 'red', shape: 'dot' });
        } finally {
            span?.end();
            // if (logmsg != null) {
            //     log_message.nodeend(msg._msgid, this.node.id);
            // }
        }
    }
    onclose() {
    }

    createheapdump(jwt: string, parent: any): Promise<string> {
        return new Promise((resolve, reject) => {
            // const [traceId, spanId] = Logger.otel.GetTraceSpanId(parent);

            info("createheapdump");
            const hostname = (process.env.HOSTNAME || os.hostname()) || "unknown";
            const filename = `${hostname}.${Date.now()}.heapsnapshot`;
            const inspector = require('node:inspector');
            const fs = require('node:fs');
            const session = new inspector.Session();

            const fd = fs.openSync(filename, 'w');

            session.connect();

            session.on('HeapProfiler.addHeapSnapshotChunk', (m) => {
                fs.writeSync(fd, m.params.chunk);
            });

            session.post('HeapProfiler.takeHeapSnapshot', null, async (err, r) => {
                try {
                    info("createheapdump completed");
                    try {
                        session.disconnect();
                        fs.closeSync(fd);
                    } catch (error) {
                    }
                    if (err) { reject(err); return; }
                    info( "Uploading " + filename);
                    this.node.status({ fill: "blue", shape: "dot", text: "Uploading " + filename });

                    await new Promise(resolve => { setTimeout(resolve, 1000) });
                    const savemsg = await this.client.UploadFile({filename});
                    info("uploaded " + filename + " as " + savemsg.id);
                    this.node.status({ fill: "green", shape: "dot", text: "Uploaded " + filename });
                    fs.unlinkSync(filename);
                    resolve(savemsg.id);
                } catch (error) {
                    try {
                        fs.unlinkSync(filename);
                    } catch (error) {
                    }
                    reject(error);
                }
            });
        })
    }
}


export interface Icustom {
    name: string;
    payload: string;
}
export class custom {
    public node: Red = null;
    public name: string;
    public client: openiap;
    constructor(public config: Icustom) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        this.node = this;
        this.name = config.name;
        this.node.on("input", this.oninput);
        this.node.on("close", this.onclose);
    }
    async oninput(msg: any) {
        try {
            let priority: number = 1;
            if (!Util.IsNullEmpty(msg.priority)) { priority = msg.priority; }

            const command: any = await Util.EvaluateNodeProperty<string>(this, msg, "command");
            const commandname: any = await Util.EvaluateNodeProperty<string>(this, msg, "commandname");
            const commandid: any = await Util.EvaluateNodeProperty<string>(this, msg, "commandid");

            this.node.status({ fill: "blue", shape: "dot", text: "Send " + command });
            var result = await this.client.CustomCommand({ command, data: msg.payload, id: commandid, name: commandname, jwt: msg.jwt });

            if (this.config.payload == null) {
                Util.SetMessageProperty(msg, this.config.payload, result);
            }

            msg.payload = result;
            this.node.send(msg);
            this.node.status({ fill: "green", shape: "dot", text: "Complete" });
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    onclose() {
    }
}