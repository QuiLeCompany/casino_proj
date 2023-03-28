"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
exports.TicTacToe = void 0;
const colyseus_1 = require("colyseus");
const schema_1 = require("@colyseus/schema");
const logger_1 = __importDefault(require("../helpers/logger"));
const database_config_1 = require("../config/database.config");
const UserEntity_1 = require("../entities/UserEntity");
const TURN_TIMEOUT = 10;
const BOARD_WIDTH = 3;
class State extends schema_1.Schema {
    constructor() {
        super(...arguments);
        this.players = new schema_1.MapSchema();
        this.board = new schema_1.ArraySchema(0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
}
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], State.prototype, "currentTurn", void 0);
__decorate([
    schema_1.type({ map: "boolean" }),
    __metadata("design:type", Object)
], State.prototype, "players", void 0);
__decorate([
    schema_1.type(["number"]),
    __metadata("design:type", Array)
], State.prototype, "board", void 0);
__decorate([
    schema_1.type("string"),
    __metadata("design:type", String)
], State.prototype, "winner", void 0);
__decorate([
    schema_1.type("boolean"),
    __metadata("design:type", Boolean)
], State.prototype, "draw", void 0);
class TicTacToe extends colyseus_1.Room {
    constructor() {
        super(...arguments);
        this.maxClients = 2;
    }
    onCreate() {
        this.setState(new State());
        this.onMessage("action", (client, message) => this.playerAction(client, message));
        console.log("Room Created!");
        this.clock.setTimeout(() => {
            this.setMetadata({
                customData: "Hello world!"
            }).then(() => colyseus_1.updateLobby(this));
        }, 5000);
    }
    /** onAuth is called before onJoin */
    onAuth(client, options, request) {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.info(`*********************** TIC TAC TOE CLIENT JOIN ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
            const tokenId = !!(options === null || options === void 0 ? void 0 : options.tokenId) ? options.tokenId : "";
            const userRepo = database_config_1.DI.em.fork().getRepository(UserEntity_1.User);
            // Check for a user with a pending sessionId that matches this client's sessionId
            let user = yield userRepo.findOne({ activeTokenId: tokenId });
            if (user) {
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
        logger_1.default.silly(`*** On Join Tic Tac Toe - ${client.sessionId} option : ${JSON.stringify(options)}***`);
        logger_1.default.info(`*********************** TIC TAC TOE CLIENT JOIN ${client.sessionId} *********************** `);
        this.state.players.set(client.sessionId, true);
        if (this.state.players.size === 2) {
            this.state.currentTurn = client.sessionId;
            this.setAutoMoveTimeout();
            // lock this room for new users
            this.lock();
        }
    }
    playerAction(client, data) {
        if (this.state.winner || this.state.draw) {
            return false;
        }
        if (client.sessionId === this.state.currentTurn) {
            const playerIds = Array.from(this.state.players.keys());
            const index = data.x + BOARD_WIDTH * data.y;
            if (this.state.board[index] === 0) {
                const move = (client.sessionId === playerIds[0]) ? 1 : 2;
                this.state.board[index] = move;
                if (this.checkWin(data.x, data.y, move)) {
                    this.state.winner = client.sessionId;
                }
                else if (this.checkBoardComplete()) {
                    this.state.draw = true;
                }
                else {
                    // switch turn
                    const otherPlayerSessionId = (client.sessionId === playerIds[0]) ? playerIds[1] : playerIds[0];
                    this.state.currentTurn = otherPlayerSessionId;
                    this.setAutoMoveTimeout();
                }
            }
        }
    }
    setAutoMoveTimeout() {
        if (this.randomMoveTimeout) {
            this.randomMoveTimeout.clear();
        }
        this.randomMoveTimeout = this.clock.setTimeout(() => this.doRandomMove(), TURN_TIMEOUT * 1000);
    }
    checkBoardComplete() {
        return this.state.board
            .filter(item => item === 0)
            .length === 0;
    }
    doRandomMove() {
        const sessionId = this.state.currentTurn;
        for (let x = 0; x < BOARD_WIDTH; x++) {
            for (let y = 0; y < BOARD_WIDTH; y++) {
                const index = x + BOARD_WIDTH * y;
                if (this.state.board[index] === 0) {
                    this.playerAction({ sessionId }, { x, y });
                    return;
                }
            }
        }
    }
    checkWin(x, y, move) {
        let won = false;
        let board = this.state.board;
        // horizontal
        for (let y = 0; y < BOARD_WIDTH; y++) {
            const i = x + BOARD_WIDTH * y;
            if (board[i] !== move) {
                break;
            }
            if (y == BOARD_WIDTH - 1) {
                won = true;
            }
        }
        // vertical
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const i = x + BOARD_WIDTH * y;
            if (board[i] !== move) {
                break;
            }
            if (x == BOARD_WIDTH - 1) {
                won = true;
            }
        }
        // cross forward
        if (x === y) {
            for (let xy = 0; xy < BOARD_WIDTH; xy++) {
                const i = xy + BOARD_WIDTH * xy;
                if (board[i] !== move) {
                    break;
                }
                if (xy == BOARD_WIDTH - 1) {
                    won = true;
                }
            }
        }
        // cross backward
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const y = (BOARD_WIDTH - 1) - x;
            const i = x + BOARD_WIDTH * y;
            if (board[i] !== move) {
                break;
            }
            if (x == BOARD_WIDTH - 1) {
                won = true;
            }
        }
        return won;
    }
    onLeave(client) {
        return __awaiter(this, void 0, void 0, function* () {
            this.state.players.delete(client.sessionId);
            if (this.randomMoveTimeout) {
                this.randomMoveTimeout.clear();
            }
            let remainingPlayerIds = Array.from(this.state.players.keys());
            if (remainingPlayerIds.length > 0) {
                this.state.winner = remainingPlayerIds[0];
            }
        });
    }
}
exports.TicTacToe = TicTacToe;
