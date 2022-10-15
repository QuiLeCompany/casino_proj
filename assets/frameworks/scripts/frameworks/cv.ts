import { HTTP } from "./net/HTTP";
import { HttpHandler } from "./net/HttpHandler";

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

    public initBaseClass() {
        this.http = HTTP.getInstance();
        this.httpHandler = HttpHandler.getInstance();
    }

    /**
     * This is init later initBaseClass
     */
    public init() {
        
    }
}

let cv_instance: cv = null!;
export default cv_instance = cv.getInstance();