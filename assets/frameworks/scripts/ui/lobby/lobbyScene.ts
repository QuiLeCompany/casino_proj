import { _decorator, Component, Node } from 'cc';

import cv from '../../frameworks/cv';
import { Delay } from '../../frameworks/helpers/Delay';
import { RequestResponse } from '../../frameworks/models/RequestResponse';
const { ccclass, property } = _decorator;

@ccclass('lobbyScene')
export class lobbyScene extends Component {
    

    onLoad() {
        
    }

    login() {
        const userName = `user001@gmail.com`;
        const password = `12345678`;
        console.log(`********** Login by user/ pass`);
        const self = this;
        cv.httpHandler?.userLogIn(userName, password, (res: RequestResponse) => {
            if (res?.error == true) {
                console.log(`Login have some error .........`);
            }
            else {
                const data = res.output.user;
                console.log(`Login data : ${JSON.stringify(data)}`);
                const tokenId = data.pendingTokenId || '';
                cv.networkManager?.connect(tokenId);
            }
        });
    }

    
    
    async start() {
        await Delay.delay(1000);
        // this.login();
    }

    
}

