import { _decorator, Component, Node } from 'cc';
import Colyseus, { RoomAvailable } from 'db://colyseus-sdk/colyseus.js';
import { Delay } from '../../frameworks/helpers/Delay';
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
    
    async start() {

        await Delay.delay(1000);
        
        this.lobby = await this.client!.joinOrCreate("lobby");  

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
}

