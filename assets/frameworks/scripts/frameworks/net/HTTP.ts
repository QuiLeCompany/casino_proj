import { NetworkConfig } from "../../shared/NetworkConfig";
import { RequestResponse } from "../models/RequestResponse";

export class HTTP {
    private static _instance: HTTP = null!;

    public static getInstance(): HTTP {
        if (!HTTP._instance) {
            HTTP._instance = new HTTP();
        }
        return HTTP._instance;
    }

    public serverRequest(method: string, endPoint: string, requestData: string, onComplete: (requestResponse: RequestResponse) => void) {
		let xhr: XMLHttpRequest = new XMLHttpRequest();

		xhr.onload = () => {
			const reqResponse: RequestResponse = xhr.response;
			onComplete(reqResponse);
		};

		const fullUrl = `${NetworkConfig.WebRequestEndPoint}/${endPoint}`;

		xhr.open(method, fullUrl);
		xhr.responseType = 'json';
		xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
		xhr.send(requestData);
	}
}

