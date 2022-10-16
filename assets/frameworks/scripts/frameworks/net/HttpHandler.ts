import cv from "../cv";
import { RequestResponse } from "../models/RequestResponse";

export class HttpHandler {
    private static _instance: HttpHandler;

    public static getInstance(): HttpHandler {
        if (!HttpHandler._instance) {
            HttpHandler._instance = new HttpHandler();
        }
        return HttpHandler._instance;
    }

    /**
	 * Send the provided user info to the server to attempt user login.
	 * @param email Email of the user account
	 * @param password Password of the user account
	 * @param onComplete Callback to execute when the request has completed
	 */
	public userLogIn(email: string, password: string, onComplete: (res: RequestResponse) => void) {
		let requestData = `email=${email}&password=${password}`;

		cv.http?.serverRequest('POST', 'users/login', requestData, onComplete);
	}

	/**
	 * Sends the provided user info to the server to attempt the creation of a new account.
	 * @param username Username of the new account
	 * @param email Email of the new account
	 * @param password Password of the new account
	 * @param onComplete Callback to execute when the request has completed
	 */
	 public userSignUp(username: string, email: string, password: string, onComplete: (res: RequestResponse) => void) {
		let requestData = `username=${username}&email=${email}&password=${password}`;

		cv.http?.serverRequest('POST', 'users/signup', requestData, onComplete);
	}
}