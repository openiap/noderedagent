import { config, openiap } from "@openiap/nodeapi";
const { info, warn, err } = config;
import * as express from "express";
import { Util } from "./nodes/Util";
import {  } from "@openiap/nodeapi";
interface HashTable<T> {
    [key: string]: T;
}
export class CachedUser {
    public firstsignin: Date;
    constructor(
        public user: any,
        public jwt: string
    ) {
        this.firstsignin = new Date();
    }
}
export class middlewareauth {
    public static authorizationCache: HashTable<CachedUser> = {};

    public static credential_cache_seconds: number = 300;
    public static api_role: string = "";

    private static getUser(authorization: string): CachedUser {
        const res: CachedUser = this.authorizationCache[authorization];
        if (res === null || res === undefined) return null;
        const begin: number = res.firstsignin.getTime();
        const end: number = new Date().getTime();
        const seconds = Math.round((end - begin) / 1000);
        if (seconds < middlewareauth.credential_cache_seconds) { return res; }
        delete this.authorizationCache[authorization];
        return null;
    }

    public static async process(client: openiap, req: any, res: express.Response, next: express.NextFunction): Promise<void> {
        const authorization: string = req.headers.authorization;
        let cacheduser: CachedUser = this.getUser(authorization);
        if (cacheduser != null) {
            req.user = cacheduser.user;
            (req.user as any).jwt = cacheduser.jwt;
            return next();
        }
        if (!Util.IsNullEmpty(authorization) && authorization.indexOf(" ") > 1 &&
            (authorization.toLocaleLowerCase().startsWith("bearer") || authorization.toLocaleLowerCase().startsWith("jwt"))) {
            const token = authorization.split(" ")[1];
            try {
                let result = await client.Signin({ jwt: token, validateonly: true });
                if (result.user != null) {
                    const user = result.user;
                    const allowed = user.roles.filter(x => x.name == "nodered api users" || (x.name == middlewareauth.api_role && !Util.IsNullEmpty(middlewareauth.api_role)));
                    if (allowed.length > 0 && !Util.IsNullEmpty(allowed[0].name)) {
                        cacheduser = new CachedUser(result.user, result.jwt);
                        this.authorizationCache[authorization] = cacheduser;
                        info("Authorized " + user.username + " for " + req.url);
                        req.user = cacheduser.user;
                        (req.user as any).jwt = cacheduser.jwt;
                        return next();
                    } else {
                        warn(user.username + " is not member of 'nodered api users' for " + req.url);
                    }
                }
            } catch (error) {
                console.error(error);
                return;
            }
            res.statusCode = 401;
            res.end('Unauthorized');
            return;
        }

        // parse login and password from headers
        const b64auth = (authorization || '').split(' ')[1] || ''
        // const [login, password] = new Buffer(b64auth, 'base64').toString().split(':')
        const [login, password] = Buffer.from(b64auth, "base64").toString().split(':')
        if (login && password) {
            try {
                const result = await await client.Signin({ username: login, password, validateonly: true });
                if (result.user != null) {
                    const user = result.user;
                    const allowed = user.roles.filter(x => x.name == "nodered api users" || (x.name == middlewareauth.api_role && !Util.IsNullEmpty(middlewareauth.api_role)));
                    if (allowed.length > 0 && !Util.IsNullEmpty(allowed[0].name)) {
                        cacheduser = new CachedUser(result.user, result.jwt);
                        this.authorizationCache[authorization] = cacheduser;
                        info( "Authorized " + user.username + " for " + req.url);
                        req.user = cacheduser.user;
                        (req.user as any).jwt = cacheduser.jwt;
                        return next();
                    } else {
                        warn(user.username + " is not member of 'nodered api users' for " + req.url);
                    }
                } else {
                    console.warn("noderedcontribmiddlewareauth: failed locating user for " + req.url);
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            warn("Unauthorized, no username/password for " + req.url);
        }
        res.statusCode = 401;
        res.setHeader('WWW-Authenticate', 'Basic realm="OpenFlow"');
        res.end('Unauthorized');
        // next();
    }
}