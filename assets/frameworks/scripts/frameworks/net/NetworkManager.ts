import Colyseus, { RoomAvailable } from 'db://colyseus-sdk/colyseus.js';

export class NetworkManager {
    private static _instance: NetworkManager = null!;
    public static getInstance(): NetworkManager {
        if (!NetworkManager._instance) {
            NetworkManager._instance = new NetworkManager();
        }
        return NetworkManager._instance;
    }

    private client : Colyseus.Client | null = null;
    private lobby : Colyseus.Room | null = null;
    private allRooms: RoomAvailable[] = [];

    public init() {
        console.log(`************ on Load Lobby`);
        this.client = new Colyseus.Client("ws://localhost:2567");
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

    leaveLobby() {
        this.lobby?.leave();
    }

}