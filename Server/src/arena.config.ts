import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import { MikroORM } from "@mikro-orm/core";
import { RequestContext } from "@mikro-orm/core";
import express from "express";

const logger = require("./helpers/logger");
import { connect, DI } from "./config/database.config";
import userRoutes from "./routes/userRoutes";

/**
 * Import your Room files
 */
import { TicTacToe } from "./rooms/tictactoe";
import cors from "cors";
import { LobbyRoomOverride } from "./rooms/LobbyRoomOverride";

export default Arena({
    getId: () => "8adedd4622e4f7d0f2e47172a62d129d",

    initializeGameServer: (gameServer) => {

        /**
         * Define your room handlers:
         */
        // Expose the "lobby" room.
        gameServer.define("lobby", LobbyRoomOverride);
        gameServer.define('tictactoe', TicTacToe).enableRealtimeListing();
    },

    initializeExpress: (app) => {
        /**
         * Bind your custom express routes here:
         */
         app.use(cors());
        // Body parser - reads data from request body into json object
        app.use(express.json());
        app.use(express.urlencoded({ extended: true, limit: "10kb" }));

        //
        // MikroORM: it is important to create a RequestContext before registering routes that access the database.
        // See => https://mikro-orm.io/docs/identity-map/
        //
        app.use((req, res, next) => RequestContext.create(DI.orm.em, next));

        // Register routes for our simple user auth
        app.use("/users", userRoutes);

        // Connect to our database
        connect().then(async () => {
            logger.silly(`*** Connected to Database! ***`);
        });

        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor
         * It is recommended to protect this route with a password.
         * Read more: https://docs.colyseus.io/tools/monitor/
         */
        app.use("/colyseus", monitor());
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    }
});