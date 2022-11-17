import { ServerError, Client } from 'colyseus';
import logger from '../helpers/logger';
import { LobbyRoom } from "colyseus";
import { LobbyOptions } from 'colyseus/lib/rooms/LobbyRoom';
import { supabaseAdmin } from '../_shared/supabaseAdmin';

export class LobbyRoomOverride extends LobbyRoom {
    async onCreate(options: any): Promise<void> {
        await super.onCreate(options);
    }

    /** onAuth is called before onJoin */
    async onAuth(client: Client, options: any, request: any) {
        logger.info(`*********************** LOBBY AUTH ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
        const userId = !!(options?.userId) ? options.userId : "";
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
        if (error == null) {
            console.log(`ok data: ${JSON.stringify(data)}`);
            return data;
        }
        else {
            logger.error(`On Auth - No user found for Id - ${client.sessionId} - ${error}`);
            throw new ServerError(400, `${error}`);
        }
    }

    onJoin(client: Client, options: LobbyOptions): void {
        super.onJoin(client, options);
    }

    async onLeave(client: Client) {
        console.log(`onLeave ....`);
        super.onLeave(client);
    }

    onDispose(): void {
        console.log(`onDispose ....`);
        super.onDispose();
    }
}