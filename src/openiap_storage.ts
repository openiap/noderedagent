import * as fs from "fs";
import * as path from "path";
import { nodered_settings } from "./nodered_settings";
import * as nodered from "node-red";
import { openiap } from "@openiap/nodeapi";
import { config } from "@openiap/nodeapi";
import { NodeRedUser } from "./nodes/Util";
const { info, warn, err } = config;

const child_process = require("child_process");
export class noderednpmrc {
    public _id: string;
    public _type: string = "npmrc";
    public name: string;
    public nodered_id: string;
    public content: string;
    public catalogues: string[] = [];
}
export class openiap_storage {
    private settings: nodered_settings = null;
    public nodered_id: string = "";
    public getFlows: any;
    public saveFlows: any;
    public getCredentials: any;
    public saveCredentials: any;
    public getSettings: any;
    public saveSettings: any;
    public getSessions: any;
    public saveSessions: any;
    public getLibraryEntry: any;
    public saveLibraryEntry: any;
    public watchid: string = "";
    public RED: nodered.Red = null;
    constructor(public client: openiap) {
        this.nodered_id = process.env.nodered_id;
        this.RED = nodered;
        this.getFlows = (this._getFlows.bind(this));
        this.saveFlows = (this._saveFlows.bind(this));
        this.getCredentials = (this._getCredentials.bind(this));
        this.saveCredentials = (this._saveCredentials.bind(this));
        this.getSettings = (this._getSettings.bind(this));
        this.saveSettings = (this._saveSettings.bind(this));
        this.getSessions = (this._getSessions.bind(this));
        this.saveSessions = (this._saveSessions.bind(this));
        this.getLibraryEntry = (this._getLibraryEntry.bind(this));
        this.saveLibraryEntry = (this._saveLibraryEntry.bind(this));
        if(this.client.signedin) {
            this.registerWatch();
        }
        this.client.on("signedin", this.registerWatch.bind(this))
    }
    async registerWatch() {
        try {
            this.watchid = await this.client.Watch({ collectionname: "nodered", paths: ["$."]}, this.onupdate.bind(this) );    
            info("Register watch with id " + this.watchid)
        } catch (error) {
            setTimeout(this.CheckUpdates.bind(this), 30000);
        }
    }

    scanDirForNodesModules(dir) {
        let results = [];
        try {
            let files = fs.readdirSync(dir, { encoding: 'utf8', withFileTypes: true });
            files.sort();
            files.forEach((fn) => {
                try {
                    var stats = fs.statSync(path.join(dir, fn.name));
                    if (stats.isFile()) {
                    } else if (stats.isDirectory()) {
                        if (fn.name == "node_modules") {
                            results = results.concat(this.scanDirForNodesModules(path.join(dir, fn.name)));
                        } else {
                            const pkgfn = path.join(dir, fn.name, "package.json");
                            if (fs.existsSync(pkgfn)) {
                                var pkg = require(pkgfn);
                                // var moduleDir = path.join(dir, fn);
                                // results.push({ dir: moduleDir, package: pkg });
                                results.push(pkg);
                            }
                        }
                    }
                } catch (error) {                    
                }
            });
        } catch (error) {
            
        }
        return results;
    }
    async GetMissingModules(settings: any) {
        // let currentmodules = this.scanDirForNodesModules(path.resolve('.'));
        let currentmodules = this.scanDirForNodesModules(this.settings.userDir);
        let globaldir: string = "";
        try {
            globaldir = child_process.execSync('npm root -g').toString();
            if (globaldir.indexOf('\n')) {
                if (globaldir.endsWith('\n')) globaldir = globaldir.substr(0, globaldir.length - 1);
                globaldir = globaldir.substr(globaldir.lastIndexOf('\n') + 1);
            }
            if (globaldir != null && globaldir != "") currentmodules = currentmodules.concat(this.scanDirForNodesModules(globaldir));
        } catch (error) {
            console.error(error);
        }
        let keys: string[];
        let modules = "";
        if (settings == null) return modules;
        if (settings.nodes != null) {
            keys = Object.keys(settings.nodes);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key == "node-red" || key == "node-red-node-rbe" || key == "node-red-node-tail") continue;
                const val = settings.nodes[key];
                const version = (val.pending_version ? val.pending_version : val.version)
                const pcks = currentmodules.filter(x => x.name == key && x.version == version);
                if (pcks.length != 1) {
                    modules += (" " + key + "@" + version);
                } else {
                    info("Skipping " + key + "@" + version + " found locally or " + globaldir);
                }
            }
        }
        if (settings.modules != null) {
            keys = Object.keys(settings.modules);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const val = settings.modules[key];
                if (val.builtin || val.known) continue;
                const pcks = currentmodules.filter(x => x.name == key);
                if (pcks.length != 1) {
                    modules += (" " + key);
                } else {
                    info("Skipping " + key + " found locally or " + globaldir);
                }
            }
        }
        return modules.trim();
    }
    // key + "@" + version
    installNPMPackage(pck: string) {
        try {
            info("Installing " + pck);
            child_process.execSync("npm install " + pck, { stdio: [0, 1, 2], cwd: this.settings.userDir });
        } catch (error) {
            err(new Error("npm install error"));
            if (error.status) warn( "npm install status: " + error.status);
            if (error.message) warn( "npm install message: " + error.message);
            if (error.stderr) warn( "npm install stderr: " + error.stderr);
            if (error.stdout) warn( "npm install stdout: " + error.stdout);
        }

    }
    DiffObjects(o1, o2) {
        // choose a map() impl.
        const map = Array.prototype.map ?
            function (a) { return Array.prototype.map.apply(a, Array.prototype.slice.call(arguments, 1)); } :
            function (a, f) {
                const ret = new Array(a.length);
                for (let i = 0, length = a.length; i < length; i++)
                    ret[i] = f(a[i], i);
                return ret.concat();
            };

        // shorthand for push impl.
        const push = Array.prototype.push;

        // check for null/undefined values
        if ((o1 == null) || (o2 == null)) {
            if (o1 != o2)
                return [["", "null", o1 != null, o2 != null]];

            return undefined; // both null
        }
        // compare types
        if ((o1.constructor != o2.constructor) ||
            (typeof o1 != typeof o2)) {
            return [["", "type", Object.prototype.toString.call(o1), Object.prototype.toString.call(o2)]]; // different type

        }

        // compare arrays
        if (Object.prototype.toString.call(o1) == "[object Array]") {
            if (o1.length != o2.length) {
                return [["", "length", o1.length, o2.length]]; // different length
            }
            const diff = [];
            for (let i = 0; i < o1.length; i++) {
                // per element nested diff
                const innerDiff = this.DiffObjects(o1[i], o2[i]);
                if (innerDiff) { // o1[i] != o2[i]
                    // merge diff array into parent's while including parent object name ([i])
                    push.apply(diff, map(innerDiff, function (o, j) { o[0] = "[" + i + "]" + o[0]; return o; }));
                }
            }
            // if any differences were found, return them
            if (diff.length)
                return diff;
            // return nothing if arrays equal
            return undefined;
        }

        // compare object trees
        if (Object.prototype.toString.call(o1) == "[object Object]") {
            const diff = [];
            // check all props in o1
            for (let prop in o1) {
                if(prop == "nodes") return undefined;
                // the double check in o1 is because in V8 objects remember keys set to undefined 
                if ((typeof o2[prop] == "undefined") && (typeof o1[prop] != "undefined")) {
                    // prop exists in o1 but not in o2
                    diff.push(["[" + prop + "]", "undefined", o1[prop], undefined]); // prop exists in o1 but not in o2

                }
                else {
                    // per element nested diff
                    const innerDiff = this.DiffObjects(o1[prop], o2[prop]);
                    if (innerDiff) { // o1[prop] != o2[prop]
                        // merge diff array into parent's while including parent object name ([prop])
                        push.apply(diff, map(innerDiff, function (o, j) { o[0] = "[" + prop + "]" + o[0]; return o; }));
                    }

                }
            }
            for (let prop in o2) {
                // the double check in o2 is because in V8 objects remember keys set to undefined 
                if ((typeof o1[prop] == "undefined") && (typeof o2[prop] != "undefined")) {
                    // prop exists in o2 but not in o1
                    diff.push(["[" + prop + "]", "undefined", undefined, o2[prop]]); // prop exists in o2 but not in o1

                }
            }
            // if any differences were found, return them
            if (diff.length)
                return diff;
            // return nothing if objects equal
            return undefined;
        }
        // if same type and not null or objects or arrays
        // perform primitive value comparison
        if (o1 != o2)
            return [["", "value", o1, o2]];

        // return nothing if values are equal
        return undefined;
    }

    private _flows: any[] = null;
    private _credentials: any[] = null;
    private _settings: any = null;
    public async CheckUpdates() {
        try {
            let oldsettings: any[] = null;
            if (this._settings != null) oldsettings = JSON.parse(JSON.stringify(this._settings));

            let oldflows: any[] = null;
            if (this._flows != null) oldflows = JSON.parse(JSON.stringify(this._flows));

            let oldcredentials: any[] = null;
            if (this._credentials != null) oldcredentials = JSON.parse(JSON.stringify(this._credentials));

            let update: boolean = false;
            let donpm: boolean = false;

            let flows: any[] = await this._getFlows();
            if (oldflows != null) {
                if (flows.length != this._flows.length) {
                    update = true;
                } else {
                    if (this.DiffObjects(flows, oldflows)) {
                        update = true;
                    }
                }
            } else {
                this._flows = flows;
            }

            let credentials: any[] = await this._getCredentials();
            if (oldcredentials != null) {
                if (credentials.length != this._credentials.length) {
                    update = true;
                } else {
                    if (this.DiffObjects(credentials, oldcredentials)) {
                        update = true;
                    }
                }
            } else {
                this._credentials = credentials;
            }

            let settings: any[] = await this.getSettings();
            if (oldsettings != null) {
                if (this.DiffObjects(settings, oldsettings)) {
                    update = true;
                    donpm = true;
                }
            } else {
                this._settings = settings;
            }
            if (donpm) {
                this._settings = null;
                this._settings = await this.getSettings();
            }
            if (update) {
                this._flows = flows;
                this._settings = settings;
                await this.RED.nodes.loadFlows(true);
            }
        } catch (error) {
            err(error);
        }
        if(this.watchid == "") {
            setTimeout(this.CheckUpdates.bind(this), 30000);
        }
    }
    public async init(settings: any): Promise<boolean> {
        this.settings = settings;
        const packageFile: string = path.join(this.settings.userDir, "package.json");
        try {
            if (!fs.existsSync(this.settings.userDir)) {
                fs.mkdirSync(this.settings.userDir);
            }
            fs.statSync(packageFile);
            process.chdir(this.settings.userDir);
            info(packageFile + " exists.");
        } catch (err) {
        }
        // Lets overwrite each time!
        const defaultPackage: any = {
            "name": "openflow-project",
            "license": "MPL-2.0",
            "description": "A OpenFlow Node-RED Project",
            "version": "0.0.1",
            "dependencies": {},
            "repository": {
                "type": "git",
                "url": "git+https://github.com/open-rpa/openflow.git"
            },
        };
        // Let's not !
        if (!fs.existsSync(packageFile)) {
            info( "creating new packageFile " + packageFile);
            fs.writeFileSync(packageFile, JSON.stringify(defaultPackage, null, 4));
        }
        // const dbsettings = await this._getSettings();
        // spawn gettings, so it starts installing
        return true;
    }
    public npmrc: noderednpmrc = null;
    public async _getnpmrc(): Promise<noderednpmrc> {
        const array = await this.client.Query<any>({
            collectionname: "nodered", query:
                { _type: "npmrc", "$or": [{ nodered_id: this.nodered_id }, { nodered_id: { "$exists": false } }] }, top: 2
        });
        if (array.length === 0) {
            return null;
        }
        if (array.length > 1) {
            this.npmrc = array.filter(x => x.nodered_id === this.nodered_id)[0];
        } else {
            this.npmrc = array[0];
        }
        if (this.npmrc != null) {
            if (this.npmrc.catalogues && this.npmrc.catalogues.length > 0) {
                info("using catalogues: " + JSON.stringify(this.npmrc.catalogues));
            }
            if (this.npmrc.content != null) {
                info("set npmrc: \n" + this.npmrc.content);
            }
        }
        return this.npmrc;
    }
    public async _setnpmrc(npmrc: noderednpmrc): Promise<void> {
        try {
            this.npmrc = npmrc;
            const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "npmrc", nodered_id: this.nodered_id }, top: 1 });
            if (result.length === 0) {
                npmrc.name = "npmrc for " + this.nodered_id;
                npmrc.nodered_id = this.nodered_id;
                npmrc._type = "npmrc";
                await this.client.InsertOne({ collectionname: "nodered", item: npmrc });
            } else {
                npmrc._id = result[0]._id;
                await this.client.UpdateOne({ collectionname: "nodered", item: npmrc });
            }
        } catch (error) {
            err(error);
        }
    }
    public async _getFlows(): Promise<any[]> {
        let result: any[] = [];
        const array = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "flow", "$or": [{ nodered_id: this.nodered_id }, { shared: true }] }, top: 5 });
        if (array.length === 0) { return []; }
        var flows = [];
        for (var i = 0; i < array.length; i++) {
            this.versions[array[i]._id] = array[i]._version;
            if (array[i].shared == true) {
                var arr = JSON.parse(array[i].flows);
                if (!arr[0].env) arr[0].env = [];
                arr[0].env = arr[0].env.filter(x => x.name != "_id");
                arr[0].env.push({ name: '_id', type: 'str', value: array[i]._id })
                console.log("* subflow id: " + array[i]._id + " version: " + array[i]._version);
                flows = flows.concat(arr);
            } else {
                console.log("* mainflow id: " + array[i]._id + " version: " + array[i]._version);
                flows = flows.concat(JSON.parse(array[i].flows));
            }
        }
        this._flows = flows;
        result = this._flows;
        return result;
    }
    public async _saveFlows(flows: any[], user: NodeRedUser): Promise<void> {
        const mainflow = [];
        let sharedflows: any = {};
        const ids = [];
        for (var i = 0; i < flows.length; i++) {
            var node = flows[i];
            if (node.type == "tab" || node.type == "subflow") {
                var _id = null;
                if (node.env) _id = node.env.filter(x => x.name == "_id");
                if (node.label && (node.label as string).startsWith("__")) {
                    ids.push(node.id);
                    if (!sharedflows[node.id]) sharedflows[node.id] = [];
                } else if (_id && _id.length > 0) {
                    ids.push(node.id);
                    if (!sharedflows[node.id]) sharedflows[node.id] = [];
                }
            }
        }
        for (var i = 0; i < flows.length; i++) {
            var node = flows[i];
            if (ids.indexOf(node.id) > -1) {
                sharedflows[node.id].push(node);
            } else if (node.z && ids.indexOf(node.z) > -1) {
                sharedflows[node.z].push(node);
            } else {
                mainflow.push(node);
            }
        }
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "flow", nodered_id: this.nodered_id }, top: 1 });
        if (result.length === 0) {
            const item: any = {
                name: "flows for " + this.nodered_id,
                flows: JSON.stringify(mainflow), _type: "flow", nodered_id: this.nodered_id
            };
            if(user != null) {
                item.deployedby = user.username;
                item.deployedbyid = user.sub;
            }
            var iresult = await this.client.InsertOne<any>({ collectionname: "nodered", item });
            this.versions[iresult._id] = iresult._version;
        } else {
            result[0].flows = JSON.stringify(mainflow);
            if(user != null) {
                result[0].deployedby = user.username;
                result[0].deployedbyid = user.sub;
            }
            this.versions[result[0]._id] = result[0]._version + 1;
            var uresult = await this.client.UpdateOne<any>({ collectionname: "nodered", item: result[0] });
            this.versions[uresult._id] = uresult._version;
        }
        let update: boolean = false;
        let keys = Object.keys(sharedflows);
        if (keys.length > 0) {
            console.log("******************************");
            for (let i = 0; i < keys.length; i++) {
                let key = keys[i];
                let arr = sharedflows[key];
                let node = arr[0];
                let result2 = [];
                var _id = null;
                if (node.env) _id = node.env.filter(x => x.name == "_id");

                if (_id && _id.length > 0) {
                    console.log("* query id: " + _id[0].value);
                    result2 = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "flow", _id: _id[0].value }, top: 1 });
                }
                if (result2.length === 0) {
                    update = true;
                    const item: any = {
                        name: "shared flows: " + node.label,
                        flows: JSON.stringify(arr), _type: "flow", shared: true
                    };
                    var iresult = await this.client.InsertOne<any>({ collectionname: "nodered", item });
                    if (iresult!=null) {
                        this.versions[iresult._id] = iresult._version;
                        console.log("* updated id: " + _id[0].value + " version: " + iresult._version);
                    } else {
                        this.RED.log.error("Failed updating flow!");
                    }
                } else {
                    result2[0].flows = JSON.stringify(arr);
                    result2[0].name = "shared flows: " + node.label;
                    this.versions[_id[0].value] = result2[0]._version + 1; // bump version before saving, some times the change stream is faster than UpdateOne
                    var uresult = await this.client.UpdateOne<any>({ collectionname: "nodered", item: result2[0] });
                    if (uresult != null) {
                        this.versions[uresult._id] = uresult._version;
                        console.log("* new id: " + uresult._id + " version: " + uresult._version);
                    } else {
                        this.RED.log.error("Failed adding new flow!");
                    }
                }
            }
        }
        if (update == true) {
            // reload flows to add the _id
            await this.RED.nodes.loadFlows(true);
        }
        this._flows = flows;
    }
    public async _getCredentials(): Promise<any> {
        let cred: any = [];
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "credential", nodered_id: this.nodered_id }, top: 1 });
        if (result.length === 0) { return []; }
        cred = result[0].credentials;
        const arr: any = result[0].credentialsarray;
        if (arr !== null && arr !== undefined) {
            cred = {};
            for (let i = 0; i < arr.length; i++) {
                const key = arr[i].key;
                const value = arr[i].value;
                cred[key] = value;
            }
        }
        this._credentials = cred;
        return cred;
    }
    public async _saveCredentials(credentials: any, user: NodeRedUser): Promise<void> {
        const credentialsarray = [];
        let result: any[] = [];
        result = await this.client.Query({ collectionname: "nodered", query: { _type: "credential", nodered_id: this.nodered_id }, top: 1 });
        const orgkeys = Object.keys(credentials);
        for (let i = 0; i < orgkeys.length; i++) {
            const key = orgkeys[i];
            const value = credentials[key];
            const obj = { key: key, value: value };
            credentialsarray.push(obj);
        }
        if (credentials) {
            if (result != null && result.length === 0) {
                const item: any = {
                    name: "credentials for " + this.nodered_id,
                    credentials: credentials, credentialsarray: credentialsarray, _type: "credential", nodered_id: this.nodered_id,
                    _encrypt: ["credentials", "credentialsarray"],
                };
                if(user != null) {
                    item.deployedby = user.username;
                    item.deployedbyid = user.sub;
                }
                const subresult = await this.client.InsertOne({ collectionname: "nodered", item });
            } else {
                const item: any = result[0];
                item.credentials = credentials;
                item.credentialsarray = credentialsarray;
                item._encrypt = ["credentials", "credentialsarray"];
                if(user != null) {
                    item.deployedby = user.username;
                    item.deployedbyid = user.sub;
                }
                const subresult = await this.client.UpdateOne({ collectionname: "nodered", item });
            }
            this._credentials = credentials;
        }
    }
    private firstrun: boolean = true;
    public async _getSettings(): Promise<any> {
        let settings: any = null;
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "setting", nodered_id: this.nodered_id }, top: 1 });
        if (result.length === 0) { return {}; }
        this.versions[result[0]._id] = result[0]._version;
        settings = JSON.parse(result[0].settings);
        const npmrc = await this._getnpmrc();
        const npmrcFile: string = path.join(this.settings.userDir, ".npmrc");
        let HTTP_PROXY = process.env.HTTP_PROXY;
        let HTTPS_PROXY = process.env.HTTPS_PROXY;
        let NO_PROXY = process.env.NO_PROXY;
        if(HTTP_PROXY == null || HTTP_PROXY == "" || HTTP_PROXY == "undefined" || HTTP_PROXY == "null") HTTP_PROXY = "";
        if(HTTPS_PROXY == null || HTTPS_PROXY == "" || HTTPS_PROXY == "undefined" || HTTPS_PROXY == "null") HTTPS_PROXY = "";
        if(NO_PROXY == null || NO_PROXY == "" || NO_PROXY == "undefined" || NO_PROXY == "null") NO_PROXY = "";
        if (npmrc != null && npmrc.content != null) {
            fs.writeFileSync(npmrcFile, npmrc.content);
        } else if (HTTP_PROXY != "" || HTTPS_PROXY != "") {
            // According to https://docs.npmjs.com/cli/v7/using-npm/config it should be picked up by environment variables, 
            // HTTP_PROXY, HTTPS_PROXY and NO_PROXY 
            const npmrc = new noderednpmrc();
            npmrc.content = "proxy=" + HTTP_PROXY + "\n" + "https-proxy=" + HTTPS_PROXY;
            if (NO_PROXY != "") {
                npmrc.content += "\n" + "noproxy=" + NO_PROXY;
            }
            npmrc.content += "\n" + "registry=http://registry.npmjs.org/";
            fs.writeFileSync(npmrcFile, npmrc.content);
        } else {
            if (fs.existsSync(npmrcFile)) {
                fs.unlinkSync(npmrcFile);
            }
        }
        if (settings == null) {
            settings = {};
        } else {
            if (this._settings == null) {
                this._settings = settings;
                // const packageFile: string = path.join(this.settings.userDir, "package.json");
                try {
                    let modules = await this.GetMissingModules(settings);
                    if (modules != null) {
                        let hadErrors: boolean = false;
                        try {
                            this.installNPMPackage(modules);
                            hadErrors = false;
                        } catch (error) {
                            hadErrors = true;
                        }
                        if (hadErrors) {
                            modules = await this.GetMissingModules(settings);
                            var arr = modules.split(" ");
                            arr.forEach(pck => {
                                try {
                                    this.installNPMPackage(pck);
                                } catch (error) {
                                }
                            });
                        }
                    }
                } catch (error) {
                    err(error);
                    settings = {};
                }
            }
            this._settings = settings;
        }
        return settings;
    }
    public bussy: boolean = false;
    public versions: any = {};
    public async onupdate(operation, document) {
        try {
            if (this.bussy) {
                return;
            }
            let update: boolean = false;
            info(document._type + " - " + new Date().toLocaleTimeString());
            if (document._type != "setting" && document._type != "flow" && document._type != "credential") {
                info(document._type + " - skipped " + new Date().toLocaleTimeString());
                return;
            }
            if (document._type == "flow") {
                if (!(document as any).shared && (document as any).nodered_id != this.nodered_id) return;
                if (this.versions[document._id] && this.versions[document._id] == document._version && operation != "delete") {
                    info(document._type + ", skip " + document._id + " is same version " + document._version);
                    return;
                } else {
                    info(document._type + ", " + document._id + " got " + document._version + " up from " + this.versions[document._id]);
                }
                update = true;
            } else if (document._type == "credential") {
                if (!(document as any).shared && (document as any).nodered_id != this.nodered_id) return;
                if (operation == "delete") {
                    return;
                }
                if(this._credentials != null) {
                    var cred = document.credentials;
                    const arr: any = document.credentialsarray;
                    if (arr !== null && arr !== undefined) {
                        cred = {};
                        for (let i = 0; i < arr.length; i++) {
                            const key = arr[i].key;
                            const value = arr[i].value;
                            cred[key] = value;
                        }
                    }
                    if (this.DiffObjects(this._credentials, cred)) {
                        update = true;
                    }

                }
            } else if (document._type == "setting") {
                if (!(document as any).shared && (document as any).nodered_id != this.nodered_id) return;
                if (this.versions[document._id] && this.versions[document._id] == document._version && operation != "delete") {
                    info(document._type + ", skip " + document._id + " is same version " + document._version);
                    return;
                } else {
                    info(document._type + ", " + document._id + " got " + document._version + " up from " + this.versions[document._id]);
                }
                let oldsettings: any = null;
                let exitprocess: boolean = false;
                if (this._settings != null) {
                    this.bussy = true;
                    try {
                        info("parse settings " + new Date().toLocaleTimeString());
                        oldsettings = JSON.parse(JSON.stringify(this._settings));
                        let newsettings = (document as any).settings;
                        newsettings = JSON.parse(newsettings);

                        info("parse oldsettings " + new Date().toLocaleTimeString());
                        let keys
                        if (oldsettings.nodes != null) {
                            let keys = Object.keys(oldsettings.nodes);
                            for (let i = 0; i < keys.length; i++) {
                                const key = keys[i];
                                info("key " + key + " " + new Date().toLocaleTimeString());
                                if (key != "node-red") {
                                    const val = oldsettings.nodes[key];
                                    try {
                                        let version = val.version;
                                        if (val != null && val.pending_version) {
                                            version = val.pending_version;
                                        }
                                        let oldversion = null;
                                        if (oldsettings != null && oldsettings.nodes[key] != null) {
                                            oldversion = oldsettings.nodes[key].version;
                                            if (oldsettings.nodes[key].pending_version) {
                                                oldversion = oldsettings.nodes[key].pending_version;
                                            }
                                        }
                                        if (newsettings.nodes[key] == null) {
                                            info("Remove module " + key + "@" + version);
                                            this.RED.log.warn("Remove module " + key + "@" + version);
                                            await this.RED.runtime.nodes.removeModule({ user: "admin", module: key, version: version });
                                            // HACK
                                            // exitprocess = true;
                                        } else if (version != oldversion) {
                                            info("Install module " + key + "@" + version + " up from " + oldversion);
                                            this.RED.log.warn("Install module " + key + "@" + version + " up from " + oldversion);
                                            let result = await this.RED.runtime.nodes.addModule({ user: "admin", module: key, version: version });
                                            if (result != null && result.pending_version != null && result.pending_version != result.version) {
                                                info(key + " now has pending_version " + result.pending_version + " request process exit");
                                                this.RED.log.warn(key + " now has pending_version " + result.pending_version + " request process exit");
                                                exitprocess = true;
                                            }
                                            // HACK
                                            // exitprocess = true;
                                        }
                                    } catch (error) {
                                        var message = (error.message ? error.message : error);
                                        err(error);
                                        if (message == "Uninstall failed") {
                                            info("Uninstall failed, request process exit");
                                            this.RED.log.error("Uninstall failed, request process exit");
                                            exitprocess = true;
                                        }
                                        if (message == "Install failed") {
                                            info("Install failed, request process exit");
                                            this.RED.log.error("Install failed, request process exit");
                                            exitprocess = true;
                                        }
                                        if (message == "Module already loaded") {
                                            // info("Install failed, Module already loaded");
                                        }
                                    }
                                }
                            }
                        }
                        info("parse newsettings " + new Date().toLocaleTimeString());
                        if (newsettings.nodes != null) {
                            keys = Object.keys(newsettings.nodes);
                            for (let i = 0; i < keys.length; i++) {
                                const key = keys[i];
                                if (key != "node-red") {
                                    const val = newsettings.nodes[key];
                                    if (val == null) {
                                        info("val == null at " + key + " ???");
                                        continue;
                                    }
                                    let version = val.version;
                                    if (val.pending_version) {
                                        version = val.pending_version;
                                    }
                                    let oldversion = null;
                                    if (oldsettings != null && oldsettings.nodes[key] != null) {
                                        oldversion = oldsettings.nodes[key].version;
                                        if (oldsettings.nodes[key].pending_version) {
                                            oldversion = oldsettings.nodes[key].pending_version;
                                        }
                                    }
                                    try {
                                        if (oldsettings.nodes[key] == null) {
                                            info("Install new module " + key + "@" + version);
                                            this.RED.log.warn("Install new module " + key + "@" + version);
                                            let result = await this.RED.runtime.nodes.addModule({ user: "admin", module: key, version: version });
                                            if (result != null && result.pending_version != null && result.pending_version != result.version) {
                                                info(key + " now has pending_version " + result.pending_version + " request process exit");
                                                this.RED.log.warn(key + " now has pending_version " + result.pending_version + " request process exit");
                                                exitprocess = true;
                                            }
                                        } else if (version != oldversion) {
                                            info("Install module " + key + "@" + version + " up from " + oldversion);
                                            this.RED.log.warn("Install module " + key + "@" + version + " up from " + oldversion);
                                            let result = await this.RED.runtime.nodes.addModule({ user: "admin", module: key, version: version });
                                            if (result != null && result.pending_version != null && result.pending_version != result.version) {
                                                info(key + " now has pending_version " + result.pending_version + " request process exit");
                                                this.RED.log.warn(key + " now has pending_version " + result.pending_version + " request process exit");
                                                exitprocess = true;
                                            }
                                        }
                                    } catch (error) {
                                        var message = (error.message ? error.message : error);
                                        err(error);
                                        if (message == "Uninstall failed") {
                                            info("Uninstall failed, request process exit");
                                            this.RED.log.error("Uninstall failed, request process exit");
                                            exitprocess = true;
                                        }
                                        if (message == "Install failed") {
                                            info("Install failed, request process exit");
                                            this.RED.log.error("Install failed, request process exit");
                                            exitprocess = true;
                                        }
                                        if (message == "Module already loaded") {
                                            // info("Install failed, Module already loaded");
                                        }
                                    }
                                }
                            }
                        }
                        info("noderedcontribopenflowstorage::onupdate DiffObjects " + new Date().toLocaleTimeString());
                        if (this.DiffObjects(newsettings, oldsettings)) {
                            update = true;
                        }
                        this._settings = newsettings;
                    } catch (error) {
                        err(error);
                        // update = true;
                    }
                    this.bussy = false;
                }

                info("check for exit exitprocess: " + exitprocess + " update: " + update + " " + new Date().toLocaleTimeString());

                if (exitprocess ) {
                    info("Running as docker, just quit process, kubernetes will start a new version");
                    this.RED.log.warn("noderedcontribopenflowstorage::onupdate: Running as docker, just quit process, kubernetes will start a new version");
                    process.exit(1);
                } else if (!exitprocess) {
                    info("Restart not needed");
                    // this.RED.log.warn("noderedcontribopenflowstorage::onupdate: Restart not needed");
                }

            }
            if (update == true) {
                info("**************************************************");
                info("* " + document._type + " was updated, reloading NodeRED flows");
                info("**************************************************");
                this.RED.log.warn("Reloading flows");
                await this.RED.nodes.loadFlows(true);
            } else {
                info(document._type + " - COMPLETE !! " + new Date().toLocaleTimeString());
            }
        } catch (error) {
            err(error);
        }
    }
    public async _saveSettings(settings: any, user: NodeRedUser): Promise<void> {
        info(new Date().toLocaleTimeString());
        const filename: string = this.nodered_id + "_settings";
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "setting", nodered_id: this.nodered_id }, top: 1 });
        if ( result.length === 0) {
            const item: any = {
                name: "settings for " + this.nodered_id,
                settings: JSON.stringify(settings), _type: "setting", nodered_id: this.nodered_id,
            };
            if(user != null) {
                item.deployedby = user.username;
                item.deployedbyid = user.sub;
            }
            var iresult = await this.client.InsertOne<any>({ collectionname: "nodered", item });
            if (iresult != null) this.versions[iresult._id] = iresult._version;
        } else {
            var item = JSON.parse(JSON.stringify(result[0]));
            item.settings = JSON.stringify(settings);
            if(user != null) {
                item.deployedby = user.username;
                item.deployedbyid = user.sub;
            }
            var uresult = await this.client.UpdateOne<any>({ collectionname: "nodered", item });
            if (uresult != null) this.versions[uresult._id] = uresult._version;
        }
        this._settings = settings;
        let exitprocess: boolean = false;
        if(settings.nodes != null) {
            let keys = Object.keys(settings.nodes);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                if (key != "node-red") {
                    const val = settings.nodes[key];
                    if (val == null) {
                        info( "key " + key + " is null ? ");
                        continue;
                    } else if (val.pending_version) {
                        info("key " + key + " has a pending_version " + val.pending_version);
                        exitprocess = true;
                    }
                }
            }
        }
        // TODO: readd at some point ?
        // if (exitprocess ) {
        //     info("Running as docker, just quit process, kubernetes will start a new version");
        //     process.exit(1);
        // }
    }
    public async _getSessions(): Promise<any[]> {
        let item: any[] = [];
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "session", nodered_id: this.nodered_id }, top: 1 });
        if (result.length === 0) { return []; }
        item = JSON.parse(result[0].sessions);
        return item;
    }
    public async _saveSessions(sessions: any[]): Promise<void> {
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "session", nodered_id: this.nodered_id }, top: 1 });
        if (result.length === 0) {
            const item: any = {
                name: "sessions for " + this.nodered_id,
                sessions: JSON.stringify(sessions), _type: "session", nodered_id: this.nodered_id
            };
            await this.client.InsertOne({ collectionname: "nodered", item });
        } else {
            result[0].sessions = JSON.stringify(sessions);
            await this.client.UpdateOne({ collectionname: "nodered", item: result[0] });
        }
    }
    public async _saveLibraryEntry(type, path, meta, body): Promise<void> {
        const item = { type, path, meta, body, _type: "library", nodered_id: this.nodered_id };
        const result = await this.client.InsertOrUpdateOne({ collectionname: "nodered", item, uniqeness: "_type,nodered_id,type,path" });
    }
    public async _getLibraryEntry(type, path): Promise<any> {
        const result = await this.client.Query<any>({ collectionname: "nodered", query: { _type: "library", nodered_id: this.nodered_id, type, path }, top: 1 });
        if (result.length === 0) { return null; }
        var item = JSON.parse(result[0].sessions);
        return item.body;
    }
}
