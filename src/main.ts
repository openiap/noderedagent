import { openiap_storage, noderednpmrc } from "./openiap_storage";
import { openiap } from "@openiap/nodeapi"
import { config } from "@openiap/nodeapi";
const { info, warn, err } = config;
import * as path from "path";
import * as nodered from "node-red";
import * as http from "http";
import * as https from "https";
import * as cookieParser from "cookie-parser";
import * as express from "express";
import * as compression from "compression";
import { nodered_settings } from "./nodered_settings";
import { Util } from "./nodes/Util";
let RED: nodered.Red = nodered;
let server: http.Server = null;
let app: express.Express = null;

async function get(url, authorization = null): Promise<string> {
  return new Promise((resolve, reject) => {
    var provider = http;
    if (url.startsWith("https")) {
      // @ts-ignore
      provider = https;
      
    }
    var uri = new URL(url);
    var options = {
      protocol: uri.protocol,
      port: uri.port,
      hostname: uri.hostname,
      path: uri.pathname,
      headers: {authorization}
    }
    // if(authorization != null && authorization != "") {
    //   options.headers
    // }
    // authorization
    provider.get(options, (resp) => {
      let data = "";
      resp.on("data", (chunk) => {
        data += chunk;
      });
      resp.on("end", () => {
        resolve(data);
      });
    }).on("error", (error) => {
      err("Error loading url: " + url);
      reject(error);
    });
  })
}
async function main() {
  const client = new openiap();
  Util.client = client;
  if (process.env.NODE_ENV != "production") {
    config.DoDumpToConsole = true;
    config.doDumpMesssages = true;
  }
  const settings = new nodered_settings();
  settings.functionGlobalContext.client = client;
  
  settings.userDir = path.join(process.cwd(), "data");
  settings.nodesDir = path.join(__dirname, "nodes");
  settings.storageModule = new openiap_storage(client)
  var user = await client.connect();
  if (user == null) throw new Error("Missing api url with credentals or jwt token")
  console.log("Signed in as: " + user.username)
  if(settings.storageModule.nodered_id == null || settings.storageModule.nodered_id == "") {
    settings.storageModule.nodered_id = user.username;
  }
  app = express();
  app.disable("x-powered-by");
  app.use(compression());
  app.use(express.urlencoded({ limit: '10mb', extended: true }))
  app.use(express.json({ limit: '10mb' }))
  app.use(cookieParser());
  app.set('trust proxy', 1)
  app.use("/", express.static(path.join(__dirname, "/public")));
  var session = require('express-session')
  app.use(session({ secret: "supersecret", cookie: { maxAge: 60000 } }))
  server = http.createServer(app);
  // app.use(passport.initialize());
  // app.use(passport.session());



  // var well_known_url = process.env.oidc_config || "https://app.openiap.io/oidc/.well-known/openid-configuration";

  var domain = process.env.domain || "localhost.openiap.io";
  var protocol = process.env.protocol || "http";
  var externalport = process.env.externalport || "";
  if (externalport != "") {
    domain = domain + ":" + externalport
  }

  var well_known = {
    userinfo_endpoint: process.env.oidc_userinfo_endpoint,
    issuer: process.env.oidc_issuer,
    authorization_endpoint: process.env.oidc_authorization_endpoint,
    token_endpoint: process.env.oidc_token_endpoint,
  }
  if(process.env.oidc_config != null && process.env.oidc_config != "") {
    well_known = JSON.parse(await get(process.env.oidc_config))
  }
  const adminrole = process.env.adminrole || "users";
  const oidc_client_id = process.env.oidc_client_id || "agent";
  const oidc_client_secret = process.env.oidc_client_secret || "";
  const options = {
    issuer: well_known.issuer,
    authorizationURL: well_known.authorization_endpoint,
    tokenURL: well_known.token_endpoint,
    userInfoURL: well_known.userinfo_endpoint,
    clientID: oidc_client_id,
    clientSecret: oidc_client_secret,
    callbackURL: protocol + "://" + domain + '/auth/strategy/callback/',
    passReqToCallback: true,
    scope: "openid profile", // ['email', 'role', 'groups', 'roles', 'profile', 'openid'],
    proxy: true,
    verify: async function (req, issuer, profile, audience, refreshToken, accessToken, params, done) {
      var user = Util.Users.find(x=> x.name == profile.displayName);
      if(user == null) {
        user = JSON.parse(await get(well_known.userinfo_endpoint, "Bearer " + accessToken));
        Util.Users.push(user)
        user.permissions = "read"
        if(!user.username && user.name) user.username = user.name;
        if (user.roles) {
          for (var i = 0; i < user.roles.length; i++) {
            var role = user.roles[i];
            if (role == "admins" || (role as any).name == "admins") user.permissions = "*"
            if (role == "agent admins" || (role as any).name == "agent admins") user.permissions = "*"
            if (role == "nodered admins" || (role as any).name == "nodered admins") user.permissions = "*"
            if (role == settings.storageModule.nodered_id + "admins" || (role as any).name == settings.storageModule.nodered_id + "admins") user.permissions = "*"
            if (role == settings.storageModule.nodered_id + " admins" || (role as any).name == settings.storageModule.nodered_id + " admins") user.permissions = "*"
            if (role == adminrole || (role as any).name == adminrole) user.permissions = "*"
          }
        }
      }
      done(null, {"username": user.name})
    }
  }

  // useAuthorizationHeaderForToken
  settings.adminAuth = {
    type: "strategy",
    strategy: {
      name: "openidconnect",
      label: 'OpenID Connect',
      icon: "fa-cloud",
      strategy: require("passport-openidconnect").Strategy,
      options
    },
    users: function (user) {
      var res = Util.Users.find(x=> x.name == user);
      if (res) return Promise.resolve(res);
      return Promise.resolve();
    }
  }


  settings.adminAuth.strategy.autoLogin = true
  await RED.init(server, settings);
  app.use(settings.httpAdminRoot, RED.httpAdmin);
  app.use(settings.httpNodeRoot, RED.httpNode);
  server.listen(settings.uiPort).on('error', function (error) {
    console.error(error)
    server.close();
    process.exit(404);
  });
  RED.start();
}

main()
