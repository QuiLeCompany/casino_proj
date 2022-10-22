import { ServerError, Client } from 'colyseus';
import logger from '../helpers/logger';
import { DI } from '../config/database.config';
import { User } from "../entities/UserEntity";

import { LobbyRoom } from "colyseus";
import { LobbyOptions } from 'colyseus/lib/rooms/LobbyRoom';

export class LobbyRoomOverride extends LobbyRoom {

    async onCreate(options: any): Promise<void> {
        await super.onCreate(options);
    }

    /** onAuth is called before onJoin */
    async onAuth(client: Client, options: any, request: any) {
        logger.info(`*********************** LOBBY AUTH ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
        const tokenId = !!(options?.tokenId) ? options.tokenId : "";
        const userRepo = DI.em.fork().getRepository(User);

        // Check for a user with a pending sessionId that matches this client's sessionId
        let user: User = await userRepo.findOne({ pendingTokenId: tokenId });

        if (user) {
            // A user with the pendingSessionId does exist

            // Update user; clear their pending session Id and update their active session Id
            user.activeSessionId = client.sessionId;
            user.activeTokenId = tokenId;
            user.pendingTokenId = "";

            // Save the user changes to the database
            await userRepo.flush();

            // Returning the user object equates to returning a "truthy" value that allows the onJoin function to continue
            return user;
        }
        else {
            // No user object was found with the pendingSessionId like we expected
            logger.error(`On Auth - No user found for session Id - ${client.sessionId}`);

            throw new ServerError(400, "Bad session!");
        }
    }

    onJoin(client: Client, options: LobbyOptions): void {
        super.onJoin(client, options);
    }

    async onLeave(client: Client) {
        super.onLeave(client);

        const userRepo = DI.em.fork().getRepository(User);
        // Find the user object in the database by their activeSessionId
        let user: User = await userRepo.findOne({ activeSessionId: client.sessionId });
        if (user) {
            user.activeSessionId = "";
            user.activeTokenId = "";
            
            // Save the user's changes to the database
            await userRepo.flush();
        }
    }

    onDispose(): void {
        super.onDispose();
    }
}