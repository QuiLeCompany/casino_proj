import { ServerError, Client } from 'colyseus';
import logger from '../helpers/logger';
import { DI } from '../config/database.config';
import { User } from "../entities/UserEntity";

import { LobbyRoom } from "colyseus";
import { LobbyOptions } from 'colyseus/lib/rooms/LobbyRoom';

import supabase, { createClient } from '@supabase/supabase-js'

export class LobbyRoomOverride extends LobbyRoom {

    readonly SUPABASE_URL = "https://popahsqojmkutrjajtsj.supabase.co";
    readonly SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGFoc3Fvam1rdXRyamFqdHNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY2ODA1MDcwMCwiZXhwIjoxOTgzNjI2NzAwfQ.RNxZ39UfPhoOa5MdZmgjILMVjqGeT87XKZW37uK6NFQ";

    private supabaseClient: supabase.SupabaseClient;

    async onCreate(options: any): Promise<void> {
        this.supabaseClient = createClient(this.SUPABASE_URL, this.SUPABASE_SERVICE_KEY);
        await super.onCreate(options);
    }

    /** onAuth is called before onJoin */
    async onAuth(client: Client, options: any, request: any) {
        logger.info(`*********************** LOBBY AUTH ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
        const userId = !!(options?.userId) ? options.userId : "";

        const { data, error } = await this.supabaseClient.auth.admin.getUserById(userId);
        if (error == null) {
            return data;
        }
        else {
            logger.error(`On Auth - No user found for Id - ${client.sessionId} - ${error}`);
            throw new ServerError(400, "Bad session!");
        }
    }

    onJoin(client: Client, options: LobbyOptions): void {
        super.onJoin(client, options);
    }

    async onLeave(client: Client) {
        console.log(`onLeave ....`);
        super.onLeave(client);
        this.supabaseClient = null;
    }

    onDispose(): void {
        console.log(`onDispose ....`);
        super.onDispose();
    }
}