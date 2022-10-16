import { _decorator, Component, Node } from 'cc';
import Colyseus, { RoomAvailable } from 'db://colyseus-sdk/colyseus.js';
import cv from '../../frameworks/cv';
import { Delay } from '../../frameworks/helpers/Delay';
import { RequestResponse } from '../../frameworks/models/RequestResponse';
const { ccclass, property } = _decorator;

@ccclass('lobbyScene')
export class lobbyScene extends Component {
    private client : Colyseus.Client | null = null;
    private lobby : Colyseus.Room | null = null;
    private allRooms: RoomAvailable[] = [];

    onLoad() {
        console.log(`************ on Load Lobby`);
        this.client = new Colyseus.Client("ws://localhost:2567");
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
                self.connect(tokenId);
            }
        });
    }

    async connect(tokenId: string) {
        this.lobby = await this.client!.joinOrCreate("lobby", {tokenId: tokenId});  
        const self = this;
        this.lobby.onMessage("rooms", (rooms) => {
            console.log(`*********** get all rooms after join ${JSON.stringify(rooms)}`);
            self.allRooms = rooms;
            self.allRooms.forEach(element => {
                console.log(`room : ${JSON.stringify(element)}`);
            });
        });
        
        this.lobby.onMessage("+", ([roomId, room]) => {
            console.log(`*********** + room id = ${roomId} info room: ${JSON.stringify(room)}`);
            const roomIndex = self.allRooms.findIndex((room) => room.roomId === roomId);
            if (roomIndex !== -1) {
                self.allRooms[roomIndex] = room;
        
            } else {
                self.allRooms.push(room);
            }
        });
    
        this.lobby.onMessage("-", (roomId) => {
            console.log(`*********** - room id = ${roomId}`);
            self.allRooms = self.allRooms.filter((room) => room.roomId !== roomId);
        });

    }
    
    async start() {
        await Delay.delay(1000);
        this.login();
    }

    leaveGame() {
        this.lobby?.leave();
    }
}

