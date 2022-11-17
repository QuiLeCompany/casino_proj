import { ServerError, Client } from 'colyseus';
import logger from '../helpers/logger';
import { LobbyRoom } from "colyseus";
import { LobbyOptions } from 'colyseus/lib/rooms/LobbyRoom';

// import supabase, { createClient } from '@supabase/supabase-js/dist/umd/supabase.js'
const axios = require('axios');
const { SupabaseClient, createClient } = require('@supabase/supabase-js');

export class LobbyRoomOverride extends LobbyRoom {

    readonly SUPABASE_URL = process.env.SUPABASE_URL;
    readonly SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

    private supabaseClient: any;

    async onCreate(options: any): Promise<void> {
        this.supabaseClient = createClient(this.SUPABASE_URL, this.SUPABASE_SERVICE_KEY);
        await super.onCreate(options);
    }

    /** onAuth is called before onJoin */
    async onAuth(client: Client, options: any, request: any) {
        logger.info(`*********************** LOBBY AUTH ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
        const userId = !!(options?.userId) ? options.userId : "";

        

        const { data, error } = await this.supabaseClient.auth.admin.getUserById(userId);
        // const error = "";
        // const data = "";

        // const jsonData = {"userId":"be115789-6e8d-4f63-b2e3-ad58dc8c7a0a"};
        // const authHeader = {"Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcGFoc3Fvam1rdXRyamFqdHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjgwNTA3MDAsImV4cCI6MTk4MzYyNjcwMH0._8_ECa6FyhzrYhuFlTcn2AO2g8otn3CflEv_RcAhdzQ"};
        // axios.post('https://popahsqojmkutrjajtsj.functions.supabase.co/hello-world', jsonData)
        //     .then((res: any) => {
        //         console.log(`Status: ${res.status}`);
        //         console.log('Body: ', res.data);
        //     }).catch((err:any) => {
        //         console.error(err);
        //     });

        // axios({
        //     method: 'post',
        //     url: 'https://popahsqojmkutrjajtsj.functions.supabase.co/hello-world',
        //     headers: authHeader,
        //     data: jsonData
        // }).then((response: any) => {
        //     console.log(response.data);
        // })
        // return true;
       

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
        // this.supabaseClient = null;
    }

    onDispose(): void {
        console.log(`onDispose ....`);
        super.onDispose();
    }
}