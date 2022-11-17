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
exports.logIn = exports.signUp = exports.prepEmail = void 0;
const database_config_1 = require("../config/database.config");
const UserEntity_1 = require("../entities/UserEntity");
const logger_1 = __importDefault(require("../helpers/logger"));
const utils_1 = require("../helpers/utils");
// Middleware
//===============================================
/**
 * Forces the email to be all lower case for consistency
 */
function prepEmail(req, res, next) {
    if (req.body.email) {
        try {
            req.body.email = req.body.email.toLowerCase();
        }
        catch (err) {
            logger_1.default.error(`Error converting email to lower case`);
        }
    }
    next();
}
exports.prepEmail = prepEmail;
//===============================================
/**
 * Update the user for a new room session; updates user's pending session Id and resets their position and rotation
 * @param user The user to update for the new session
 * @param tokenId The new session Id
 */
function updateUserForNewSession(user, tokenId) {
    user.pendingTokenId = tokenId;
    user.pendingTokenTimestamp = Date.now();
    user.updatedAt = new Date();
    // user.position = new Position().assign({
    //     x: 0,
    //     y: 1,
    //     z: 0
    // });
    // user.rotation = new Rotation().assign({
    //     x: 0,
    //     y: 0,
    //     z: 0
    // });
}
/**
 * Simple function for creating a new user account.
 * With successful account creation the user will be matchmaked into the first room.
 * @param req
 * @param res
 * @returns
 */
function signUp(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Check if the necessary parameters exist
            if (req.body.username == null || req.body.email == null || req.body.password == null) {
                logger_1.default.error(`*** Sign Up Error - New user must have a username, email, and password!`);
                throw "New user must have a username, email, and password!";
                return;
            }
            const userRepo = database_config_1.DI.em.fork().getRepository(UserEntity_1.User);
            // Check if an account with the email already exists
            let user = yield userRepo.findOne({ email: req.body.email });
            // let seatReservation;
            if (user == null) {
                // Create a new user
                user = userRepo.create({
                    username: req.body.username,
                    email: req.body.email,
                    password: req.body.password
                });
                const passTokenHash = new Date() + '';
                const tokenId = utils_1.Utils.generateHash(passTokenHash);
                // // Match make the user into a room
                // seatReservation = await matchmakerHelper.matchMakeToRoom("lobby_room");
                updateUserForNewSession(user, tokenId);
                // Save the new user to the database
                yield userRepo.persistAndFlush(user);
            }
            else {
                logger_1.default.error(`*** Sign Up Error - User with that email already exists!`);
                throw "User with that email already exists!";
                return;
            }
            const newUserObj = Object.assign({}, user);
            delete newUserObj.password; // Don't send the user's password back to the client
            res.status(200).json({
                error: false,
                output: {
                    user: newUserObj
                }
            });
        }
        catch (error) {
            res.status(400).json({
                error: true,
                output: error
            });
        }
    });
}
exports.signUp = signUp;
/**
 * Simple function to sign user in.
 * It performs a simple check if the provided password matches in the user account.
 * With a successful sign in the user will be matchmaked into the room where they left off or into the first room.
 * @param req
 * @param res
 */
function logIn(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userRepo = database_config_1.DI.em.fork().getRepository(UserEntity_1.User);
            // Check if the necessary parameters exist
            if (req.body.email == null || req.body.password == null) {
                throw "Missing email or password";
                return;
            }
            // Check if an account with the email exists
            let user = yield userRepo.findOne({ email: req.body.email });
            // Check if passwords match
            let validPassword = user != null ? user.password == req.body.password : false;
            if (user == null || validPassword == false) {
                throw "Incorrect email or password";
                return;
            }
            // Check if the user is already logged in
            if (user.activeTokenId) {
                logger_1.default.error(`User is already logged in- \"${user.activeTokenId}\"`);
                throw "User is already logged in";
                return;
            }
            // Wait a minimum of 30 seconds when a pending session Id currently exists
            // before letting the user sign in again
            if (user.pendingTokenId && user.pendingTokenTimestamp && (Date.now() - user.pendingTokenTimestamp) <= 30000) {
                let timeLeft = (Date.now() - user.pendingTokenTimestamp) / 1000;
                logger_1.default.error(`Can't log in right now, try again in ${timeLeft} seconds!`);
                throw `Can't log in right now, try again in ${timeLeft} seconds!`;
                return;
            }
            // Match make the user into a room filtering based on the user's progress
            // const seatReservation: matchMaker.SeatReservation = await matchmakerHelper.matchMakeToRoom("tictactoe", user.progress);
            const passTokenHash = new Date() + '';
            const tokenId = utils_1.Utils.generateHash(passTokenHash);
            updateUserForNewSession(user, tokenId);
            // Save the user updates to the database
            yield userRepo.flush();
            // Don't include the password in the user object sent back to the client
            const userCopy = Object.assign({}, user);
            delete userCopy.password;
            // Send the user data and seat reservation back to the client
            // where the seat reservation can be used by the client to
            // consume the seat reservation and join the room.
            res.status(200).json({
                error: false,
                output: {
                    user: userCopy
                }
            });
        }
        catch (error) {
            res.status(400).json({
                error: true,
                output: error
            });
        }
    });
}
exports.logIn = logIn;
