
export class dashboard_settings {
    public path: string = "ui";
    public middleware: any;
}
// tslint:disable-next-line: class-name
export class nodered_settings {
    constructor() {
        this.ui = new dashboard_settings();
    }
    public flowFile: string = "flows.json";
    public settingsFile: string = "nodered_settings.js";
    public nodesDir: string = ".";
    public userDir: string = ".";

    public credentialSecret: string | boolean = false;
    public adminAuth: any = null;
    public httpNodeAuth: any = null;
    public httpStaticAuth: any = null;
    public httpNodeMiddleware: any;

    public ui: dashboard_settings;

    public httpAdminRoot: string = "/";
    public httpNodeRoot: string = "/";
    public storageModule: any = null;
    public uiPort: number = parseInt(process.env.port || "3000");
    public mqttReconnectTime: number = 15000;
    public serialReconnectTime: number = 15000;
    public debugMaxLength: number = 1000;
    public functionGlobalContext: any = { process: process };
    public functionExternalModules: boolean = true;
    public paletteCategories: string[] = ["rpa", "workitem", "subflows", "input", "output", "function", "api",
        "social", "mobile", "storage", "analysis", "advanced"];
    public debugUseColors: boolean = true;
    public flowFilePretty: boolean = true;

    public logging: any = {
        console: {
            level: "warn",
            metrics: false,
            audit: false
        }
    };
    public editorTheme = {
        palette: {
            catalogues: ['https://catalogue.nodered.org/catalogue.json']
        },
        tours: false,
        multiplayer: {
            enabled: true
        },
        codeEditor: {
            lib: "monaco",
            options: {
            }
        }
    }
}
