
export class HttpHandler {
    private static _instance: HttpHandler;

    public static getInstance(): HttpHandler {
        if (!HttpHandler._instance) {
            HttpHandler._instance = new HttpHandler();
        }
        return HttpHandler._instance;
    }

    public LoginServer()
    {
        
    }
}