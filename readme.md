# Nodered package
Just NodeRED, but also.
- bundled with nodes for talking with OpenFlow
- is using openflow as storage provider to keep permissions and version control on all flows, credentials
- add support for partial flows, to share a tab between multiple nodered instances.
- add support for running multiple nodered instances with a shared workflow
- Add authentication using multple authentication providers
- Add support for central management of API access

# Running it in docker
Install (openflow)[https://github.com/open-rpa/docker] and go to Agents, Add agent, and then select nodered in the dropdown list under Image

# Running it as a package
Install (vs.code)[https://code.visualstudio.com/download] and then install the (OpenIAP extension)[https://marketplace.visualstudio.com/items?itemName=openiap.openiap-assistant] 
Open palette (F1) and run "Add openiap flow instance", annd follow the guide.
Download/clone this repository, and open it in vs.code
```bash
git clone https://github.com/openiap/noderedagent
code noderedagent
```
Open the palette (F1) and call "Initialize project, ensure package.json and launch.json exists for openiap instance"
Open launch.json and in the env section add the following under apiurl
```json
    "domain": "localhost.openiap.io",
    "oidc_config": "https://app.openiap.io/oidc/.well-known/openid-configuration",
    "port": "1880",
    "externalport": "1880",
    "nodered_id": "my-slug"
```
Then run the project ( F5 ) and open a browser to (http://localhost.openiap.io:1880)[http://localhost.openiap.io:1880]

# additional settings

Control who can login and edit the NodeRED flow (default: users)
```json
    "admin_role": "users",
```
replace "users" with a role containing the users you would like to allow full control over this nodered instance. All users will be authenticated using openflow, so even federated users can be granted access.
No matter the value here, users that is a member for "admins", "agent admins", "nodered admins" or a role with the name "nodered_id admins"

Control who can login and read the NodeRED flow, but not update it.  (default: not set )
```json
    "read_role": "users",
```
replace "users" with a role containing the users you would like to allow readonly access to this nodered instance. All users will be authenticated using openflow, so even federated users can be granted access.

By defaut all http endpoints will allow anonymous access ( http in / dashboard ) (default: not set )
```json
    "api_role": "users",
```
by replacing "users" with 


If not using a real OpenID Connect provider, ( but some OAuth type provider ) or need to enhance security on the OIDC provider, you can add the secret for the secret here
```json
    "oidc_client_id": "agent",
    "oidc_client_secret": "secret",
```

When running behind a reverse proxy, like traefik, that added https for end users, we need to tell the authentication provider to use https for return URL's
( default: HTTP )
```json
    "protocol": "HTTPS",
```

If not using oidc_config but need to configure this manually, you can set OIDC config endpoints like this
(default: not set )
```json
    "oidc_issuer": "https://app.openiap.io/oidc",
    "oidc_authorization_endpoint": "https://app.openiap.io/oidc/auth",
    "oidc_token_endpoint": "https://app.openiap.io/oidc/token",
    "oidc_userinfo_endpoint": "https://app.openiap.io/oidc/me",
```

If you want to enforce authentication on all HTTP endpoints, you can add (default: not set)
```json
    "externalport": "users",
```
and replace users with a role, containing the users you would like to allow access ( these users must have a password ), leave this blank to allow anonymous access to all http endpoints

Add this to control how long, nodered will cache the above credentials before re-validating the password of each user cached. ( default: 300 )
```json
    "credential_cache_seconds": "3600",
```


