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
const database_config_1 = require("../config/database.config");
const UserEntity_1 = require("../entities/UserEntity");
const colyseus_2 = require("colyseus");
class LobbyRoomOverride extends colyseus_2.LobbyRoom {
    onCreate(options) {
        const _super = Object.create(null, {
            onCreate: { get: () => super.onCreate }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.onCreate.call(this, options);
        });
    }
    /** onAuth is called before onJoin */
    onAuth(client, options, request) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`*********************** LOBBY AUTH ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
            const tokenId = !!(options === null || options === void 0 ? void 0 : options.tokenId) ? options.tokenId : "";
            const userRepo = database_config_1.DI.em.fork().getRepository(UserEntity_1.User);
            // Check for a user with a pending sessionId that matches this client's sessionId
            let user = yield userRepo.findOne({ pendingTokenId: tokenId });
            if (user) {
                // A user with the pendingSessionId does exist
                // Update user; clear their pending session Id and update their active session Id
                user.activeSessionId = client.sessionId;
                user.activeTokenId = tokenId;
                user.pendingTokenId = "";
                // Save the user changes to the database
                yield userRepo.flush();
                // Returning the user object equates to returning a "truthy" value that allows the onJoin function to continue
                return user;
            }
            else {
                // No user object was found with the pendingSessionId like we expected
                logger_1.default.error(`On Auth - No user found for session Id - ${client.sessionId}`);
                throw new colyseus_1.ServerError(400, "Bad session!");
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
            _super.onLeave.call(this, client);
            const userRepo = database_config_1.DI.em.fork().getRepository(UserEntity_1.User);
            // Find the user object in the database by their activeSessionId
            let user = yield userRepo.findOne({ activeSessionId: client.sessionId });
            if (user) {
                user.activeSessionId = "";
                user.activeTokenId = "";
                // Save the user's changes to the database
                yield userRepo.flush();
            }
        });
    }
    onDispose() {
        super.onDispose();
    }
}
exports.LobbyRoomOverride = LobbyRoomOverride;
