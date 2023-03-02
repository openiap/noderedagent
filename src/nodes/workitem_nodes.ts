import { openiap, Workitem, WorkitemFile } from "@openiap/nodeapi";
import * as RED from "node-red";
import { Red } from "node-red";
import { Util } from "./Util";
const pako = require('pako');
const fs = require('fs');
const path = require("path");

export interface iworkitemqueue_config {
    name: string;
}
export class workitemqueue_config {
    public node: Red = null;
    public name: string = "";
    public wiq: string = "";
    public wiqid: string = "";
    public credentials: iworkitemqueue_config;
    constructor(public config: iworkitemqueue_config) {
        RED.nodes.createNode(this, config);
        this.node = this;
        this.credentials = this.node.credentials;
        if (this.node.credentials && this.node.credentials.hasOwnProperty("wiq")) {
            this.wiq = this.node.credentials.wiq;
        }
        if (this.node.credentials && this.node.credentials.hasOwnProperty("wiqid")) {
            this.wiqid = this.node.credentials.wiqid;
        }
        this.name = (config.name || this.wiq) || this.wiqid;
    }
}

export interface iaddworkitem {
    name: string;
    config: any;
    payload: any;
}
export class addworkitem {
    public node: Red = null;
    public name: string = "";
    private workitemqueue_config: workitemqueue_config;
    public client: openiap;
    constructor(public config: iaddworkitem) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null) this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    async oninput(msg: any) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            const payload = await Util.EvaluateNodeProperty<any>(this, msg, "payload");
            const files = await Util.EvaluateNodeProperty<WorkitemFile[]>(this, msg, "files");
            const topic = await Util.EvaluateNodeProperty<string>(this, msg, "topic");
            const nextrun = await Util.EvaluateNodeProperty<Date>(this, msg, "nextrun");
            const wipriority = await Util.EvaluateNodeProperty<number>(this, msg, "priority");
            const success_wiq = await Util.EvaluateNodeProperty<string>(this, msg, "success_wiq");
            const failed_wiq = await Util.EvaluateNodeProperty<string>(this, msg, "failed_wiq");
            const { wiq, wiqid } = this.workitemqueue_config;

            if (!Util.IsNullUndefinded(files)) {
                for (var i = 0; i < files.length; i++) {
                    var file = files[i];
                    if (file.file && (Array.isArray(file.file) || Buffer.isBuffer(file.file))) {
                        if (Util.IsNullEmpty(file.filename)) throw new Error("filename is mandatory for each file")
                        file.compressed = true;
                        file.file = Buffer.from(pako.deflate(file.file));
                    } else if (!Util.IsNullEmpty(file.filename)) {
                        if (fs.existsSync(file.filename)) {
                            file.compressed = true;
                            file.file = Buffer.from(pako.deflate(fs.readFileSync(file.filename, null)));
                            file.filename = path.basename(file.filename);
                        } else {
                            throw new Error("File not found " + file.filename)
                        }
                    }
                }
            }
            const result = await this.client.PushWorkitem({ payload, files, wiqid, wiq, name: topic, nextrun, priority: wipriority, success_wiq, failed_wiq })
            if (!Util.IsNullEmpty(this.config.payload)) {
                Util.SetMessageProperty(msg, this.config.payload, result);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        try {
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        if (done != null) done();
    }
}


export interface iaddworkitems {
    name: string;
    config: any;
    payload: any;
}
export class addworkitems {
    public node: Red = null;
    public name: string = "";
    private workitemqueue_config: workitemqueue_config;
    public client: openiap;
    constructor(public config: iaddworkitems) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null) this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    async oninput(msg: any) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            const items = await Util.EvaluateNodeProperty<Workitem[]>(this, msg, "workitems");
            const nextrun = await Util.EvaluateNodeProperty<Date>(this, msg, "nextrun");
            const wipriority = await Util.EvaluateNodeProperty<number>(this, msg, "priority");
            const success_wiq = await Util.EvaluateNodeProperty<string>(this, msg, "success_wiq");
            const failed_wiq = await Util.EvaluateNodeProperty<string>(this, msg, "failed_wiq");
            const { wiq, wiqid } = this.workitemqueue_config;
            if (!Array.isArray(items)) throw new Error("workitems must be an array of Workitems")
            items.forEach(item => {
                if (!Util.IsNullEmpty(nextrun)) item.nextrun = nextrun;
                if (!Util.IsNullEmpty(wipriority)) item.priority = wipriority;

                if (!Util.IsNullUndefinded(item.files)) {
                    for (var i = 0; i < item.files.length; i++) {
                        var file = item.files[i];
                        if (file.file && Array.isArray(file.file)) {
                            file.compressed = true;
                            file.file = Buffer.from(pako.deflate(file.file))
                        } else if (Util.IsNullEmpty(file.filename)) {
                            if (fs.existsSync(file.filename)) {
                                file.compressed = true;
                                file.file = Buffer.from(pako.deflate(fs.readFileSync(file.filename, null)))
                                file.filename = path.basename(file.filename);
                            }
                        }
                    }
                }

            });
            await this.client.PushWorkitems({ items, wiqid, wiq, success_wiq, failed_wiq })
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        try {
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        if (done != null) done();
    }
}


export interface iupdateworkitem {
    name: string;
    config: any;
    workitem: string;
    error: string;
    state: string;
}
export class updateworkitem {
    public node: Red = null;
    public name: string = "";
    public client: openiap;
    constructor(public config: iupdateworkitem) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    async oninput(msg: any) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            const workitem = await Util.EvaluateNodeProperty<Workitem>(this, msg, "workitem");
            const files = await Util.EvaluateNodeProperty<WorkitemFile[]>(this, msg, "files");
            const state: any = await Util.EvaluateNodeProperty<string>(this, msg, "state");
            const wipriority = await Util.EvaluateNodeProperty<number>(this, msg, "priority");
            const _errormessage = await Util.EvaluateNodeProperty<string>(this, msg, "error");
            const ignoremaxretries = await Util.EvaluateNodeProperty<boolean>(this, msg, "ignoremaxretries");
            const success_wiq = await Util.EvaluateNodeProperty<string>(this, msg, "success_wiq");
            const failed_wiq = await Util.EvaluateNodeProperty<string>(this, msg, "failed_wiq");
            const _nextrun = await Util.EvaluateNodeProperty<string>(this, msg, "nextrun");
            var nextrun = undefined;
            try {
                if(!Util.IsNullEmpty(_nextrun)) nextrun = new Date(_nextrun);
            } catch (error) {
                nextrun = undefined
            }
            
            var errorsource: string = "";

            if (!Util.IsNullEmpty(msg.error) && (Util.IsNullUndefinded(workitem) || Util.IsNullEmpty(workitem._id))) {
                this.node.status({ fill: "blue", shape: "dot", text: "Ignore missing workitem" });
                return;
            }
            // let { _id, name, payload, errortype, errormessage } = workitem;
            if (!Util.IsNullEmpty(_errormessage) && Util.IsNullEmpty(workitem.errormessage)) {
                workitem.errormessage = _errormessage.toString();
            }
            if(!Util.IsNullEmpty(this.config.state)) {
                workitem.state = this.config.state;
            }
            if(wipriority > 0 && workitem.priority == 0) {
                workitem.priority = wipriority;
            }
            if (!Util.IsNullEmpty(success_wiq)) {
                workitem.success_wiq = success_wiq
            }
            if (!Util.IsNullEmpty(failed_wiq)) {
                workitem.failed_wiq = failed_wiq;
            }
            if (!Util.IsNullEmpty(nextrun)) {
                workitem.nextrun = nextrun;
            }
            if(files != null && files.length > 0) {
                if(workitem.files == null) workitem.files = [];
                files.forEach(file => {
                    workitem.files.push(file);
                });
            }
            const result = await this.client.UpdateWorkitem({ workitem, ignoremaxretries })
            if (!Util.IsNullEmpty(this.config.workitem)) {
                Util.SetMessageProperty(msg, this.config.workitem, result);
            }
            this.node.send(msg);
            this.node.status({});
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        try {
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        if (done != null) done();
    }
}




export interface ipopworkitem {
    name: string;
    workitem: string;
    config: any;
    files: string;
    download: boolean;
}
export class popworkitem {
    public node: Red = null;
    public name: string = "";
    private workitemqueue_config: workitemqueue_config;
    public client: openiap;
    constructor(public config: ipopworkitem) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null) this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    async oninput(msg: any) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            const { wiq, wiqid } = this.workitemqueue_config;
            let download = this.config.download;
            if (Util.IsNullEmpty(download)) download = false;

            const result = await this.client.PopWorkitem({ wiqid, wiq, includefiles: download, compressed: false })
            var files: WorkitemFile[] = null;
            if (result != null) {
                files = [];
                if (download && result.files && result.files.length > 0) {
                    for (let i = 0; i < result.files.length; i++) {
                        var file = result.files[i];
                        if (!Util.IsNullEmpty(file._id)) {
                            files.push(file);
                            // var down = await this.client.GetFile({ id: file._id, compress: true });
                            // // (file as any).file = Buffer.from(down.file, 'base64');
                            // var data = Buffer.from(down.file, 'base64');
                            // (file as any).file = Buffer.from(pako.inflate(data));
                            // files.push(file);
                        }
                    }
                }
                if (!Util.IsNullEmpty(this.config.workitem)) {
                    Util.SetMessageProperty(msg, this.config.workitem, result);
                }
                if (!Util.IsNullEmpty(this.config.files) && result) {
                    Util.SetMessageProperty(msg, this.config.files, files);
                }
                this.node.send(msg);
                this.node.status({ fill: "green", shape: "dot", text: "successfully popped a Workitem" });
            } else {
                this.node.send([null, msg]);
                this.node.status({ fill: "green", shape: "dot", text: "No more workitems" });
            }
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        try {
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        if (done != null) done();
    }
}


export interface ideleteworkitem {
    name: string;
    workitem: string;
    config: any;
}
export class deleteworkitem {
    public node: Red = null;
    public name: string = "";
    private workitemqueue_config: workitemqueue_config;
    public client: openiap;
    constructor(public config: ideleteworkitem) {
        RED.nodes.createNode(this, config);
        // @ts-ignore
        var global = this.context().global;
        this.client = global.get('client');
        try {
            this.node = this;
            this.name = config.name;
            var conf = RED.nodes.getNode(this.config.config);
            if (conf != null) this.workitemqueue_config = conf.config;
            this.node.on("close", this.onclose);
            this.node.on("input", this.oninput);
        } catch (error) {
            Util.HandleError(this, error, null);
        }
    }
    async oninput(msg: any) {
        try {
            this.node.status({ fill: "blue", shape: "dot", text: "Processing" });
            const workitem = await Util.EvaluateNodeProperty<Workitem>(this, msg, "workitem");
            if (!Util.IsNullUndefinded(workitem) && !Util.IsNullEmpty(workitem._id)) {
                await this.client.DeleteWorkitem({ _id: workitem._id })
            } else {
                throw new Error("workitem missing, or workitem is missing _id");
            }
            this.node.send(msg);
        } catch (error) {
            Util.HandleError(this, error, msg);
        }
    }
    async onclose(removed: boolean, done: any) {
        try {
        } catch (error) {
            Util.HandleError(this, error, null);
        }
        if (done != null) done();
    }
}
