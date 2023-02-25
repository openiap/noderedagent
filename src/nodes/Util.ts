import * as RED from "node-red";
import { openiap } from "@openiap/nodeapi";
import { config } from "@openiap/nodeapi";
const { info, warn, err } = config;
export class NodeRedUser {
    public email: string = "";
    public name: string = "";
    public permissions: string = "";
    public role: string = "";
    public roles: string[] = [];
    public sub: string = "";
    public username: string = "";
}
export class Util {
    public static Users: NodeRedUser[] = [];
    public static client: openiap;
    public static EvaluateNodeProperty<T>(node: any, msg: any, name: string, ignoreerrors: boolean = false) {
        return new Promise<T>((resolve, reject) => {
            const _name = node.config[name];
            let _type = node.config[name + "type"];
            if(_type == null || _type == "") {
                _type = "msg";
            }
            if (_name == null) return resolve(null);
            // if (_type == null) _type = "msg";
            RED.util.evaluateNodeProperty(_name, _type, node, msg, (err, value) => {
                if (err && !ignoreerrors) {
                    reject(err);
                } else {
                    resolve(value);
                }
            })
        });
    }
    public static saveToObject(obj: any, path: string, value: any): any {
        const pList = path.split('.');
        const key = pList.pop();
        const pointer = pList.reduce((accumulator, currentValue) => {
            if (accumulator[currentValue] === undefined) accumulator[currentValue] = {};
            return accumulator[currentValue];
        }, obj);
        if (this.isObject(pointer)) {
            pointer[key] = value;
        } else {
            throw new Error(path + ' is not an object!');
        }
        return obj;
    }
    public static HandleError(node: any, error: any, msg: any): void {
        err(error)
        let message: string = error;
        if (typeof error === 'string' || error instanceof String) {
            error = new Error(error as string);
        }
        try {
            node.error(error, msg);
        } catch (error) {
        }
        try {
            if (Util.IsNullUndefinded(message)) {
                message = '';
            }
            node.status({ fill: 'red', shape: 'dot', text: message.toString().substring(0, 32) });
        } catch (error) {
        }
    }
    public static Delay = ms => new Promise<void>(res => setTimeout(res, ms));
    public static SetMessageProperty(msg: any, name: string, value: any) {
        RED.util.setMessageProperty(msg, name, value);
    }
    public static IsNullUndefinded(obj: any) {
        if (obj === null || obj === undefined) {
            return true;
        }
        return false;
    }
    public static IsNullEmpty(obj: any) {
        if (obj === null || obj === undefined || obj === '') {
            return true;
        }
        return false;
    }
    public static IsString(obj: any) {
        if (typeof obj === 'string' || obj instanceof String) {
            return true;
        }
        return false;
    }
    public static isObject(obj: any): boolean {
        return obj === Object(obj);
    }
    public static GetUniqueIdentifier(): string {
        // crypto.randomBytes(16).toString("hex")
        return Math.random().toString(36).substring(2, 11);
    }
    public static parseBoolean(s: any): boolean {
        let val: string;
        if (typeof s === "number") {
            val = s.toString();
        } else if (typeof s === "string") {
            val = s.toLowerCase().trim();
        } else if (typeof s === "boolean") {
            val = s.toString();
        } else {
            throw new Error("Unknown type!");
        }
        switch (val) {
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return Boolean(s);
        }
    }
}