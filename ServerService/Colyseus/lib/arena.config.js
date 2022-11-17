"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const arena_1 = __importDefault(require("@colyseus/arena"));
const monitor_1 = require("@colyseus/monitor");
const core_1 = require("@mikro-orm/core");
const express_1 = __importDefault(require("express"));
const logger = require("./helpers/logger");
const database_config_1 = require("./config/database.config");
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
/**
 * Import your Room files
 */
const tictactoe_1 = require("./rooms/tictactoe");
const cors_1 = __importDefault(require("cors"));
const LobbyRoomOverride_1 = require("./rooms/LobbyRoomOverride");
exports.default = arena_1.default({
    getId: () => "8adedd4622e4f7d0f2e47172a62d129d",
    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        // Expose the "lobby" room.
        gameServer.define("lobby", LobbyRoomOverride_1.LobbyRoomOverride);
        gameServer.define('tictactoe', tictactoe_1.TicTacToe).enableRealtimeListing();
    },
    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
        app.use(cors_1.default());
        // Body parser - reads data from request body into json object
        app.use(express_1.default.json());
        app.use(express_1.default.urlencoded({ extended: true, limit: "10kb" }));
        //
        // MikroORM: it is important to create a RequestContext before registering routes that access the database.
        // See => https://mikro-orm.io/docs/identity-map/
        //
        app.use((req, res, next) => core_1.RequestContext.create(database_config_1.DI.orm.em, next));
        // Register routes for our simple user auth
        app.use("/users", userRoutes_1.default);
        // // Connect to our database
        // connect().then(async () => {
        //     logger.silly(`*** Connected to Database! ***`);
        // });
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });
        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor_1.monitor());
    },
    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});
