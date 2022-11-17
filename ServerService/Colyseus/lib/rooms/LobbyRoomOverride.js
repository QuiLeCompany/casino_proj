"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LobbyRoomOverride = void 0;
const colyseus_1 = require("colyseus");
const logger_1 = __importDefault(require("../helpers/logger"));
const colyseus_2 = require("colyseus");
// import supabase, { createClient } from '@supabase/supabase-js/dist/umd/supabase.js'
const axios = require('axios');
const { SupabaseClient, createClient } = require('@supabase/supabase-js');
class LobbyRoomOverride extends colyseus_2.LobbyRoom {
    constructor() {
        super(...arguments);
        this.SUPABASE_URL = process.env.SUPABASE_URL;
        this.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
    }
    onCreate(options) {
        const _super = Object.create(null, {
            onCreate: { get: () => super.onCreate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            this.supabaseClient = createClient(this.SUPABASE_URL, this.SUPABASE_SERVICE_KEY);
            yield _super.onCreate.call(this, options);
        });
    }
    /** onAuth is called before onJoin */
    onAuth(client, options, request) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`*********************** LOBBY AUTH ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
            const userId = !!(options === null || options === void 0 ? void 0 : options.userId) ? options.userId : "";
            const { data, error } = yield this.supabaseClient.auth.admin.getUserById(userId);
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
                logger_1.default.error(`On Auth - No user found for Id - ${client.sessionId} - ${error}`);
                throw new colyseus_1.ServerError(400, `${error}`);
            }
        });
    }
    onJoin(client, options) {
        super.onJoin(client, options);
    }
    onLeave(client) {
        const _super = Object.create(null, {
            onLeave: { get: () => super.onLeave }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`onLeave ....`);
            _super.onLeave.call(this, client);
            // this.supabaseClient = null;
        });
    }
    onDispose() {
        console.log(`onDispose ....`);
        super.onDispose();
    }
}
exports.LobbyRoomOverride = LobbyRoomOverride;
