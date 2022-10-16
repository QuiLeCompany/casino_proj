import { HTTP } from "./net/HTTP";
import { HttpHandler } from "./net/HttpHandler";
import { NetworkManager } from "./net/networkManager";

class cv {
    private static _instance: cv;

    public static getInstance(): cv {
        if (!cv._instance) {
            cv._instance = new cv();
        }
        return cv._instance;
    }

    public http: HTTP | undefined;
    public httpHandler: HttpHandler | undefined;
    public networkManager: NetworkManager | undefined;

    public initBaseClass() {
        this.http = HTTP.getInstance();
        this.httpHandler = HttpHandler.getInstance();
        this.networkManager = NetworkManager.getInstance();
    }

    /**
     * This is init later initBaseClass
     */
    public init() {
        this.networkManager?.init();
    }
}

let cv_instance: cv = null!;
export default cv_instance = cv.getInstance();