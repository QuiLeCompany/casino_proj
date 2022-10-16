import { Room, Delayed, ServerError, Client, updateLobby } from 'colyseus';
import { type, Schema, MapSchema, ArraySchema } from '@colyseus/schema';
import logger from '../helpers/logger';
import { DI } from '../config/database.config';
import { User } from "../entities/UserEntity";

const TURN_TIMEOUT = 10
const BOARD_WIDTH = 3;

class State extends Schema {
  @type("string") currentTurn: string;
  @type({ map: "boolean" }) players = new MapSchema<boolean>();
  @type(["number"]) board: number[] = new ArraySchema<number>(0, 0, 0, 0, 0, 0, 0, 0, 0);
  @type("string") winner: string;
  @type("boolean") draw: boolean;
}

export class TicTacToe extends Room<State> {
  maxClients = 2;
  randomMoveTimeout: Delayed;

  onCreate () {
    this.setState(new State());
    this.onMessage("action", (client, message) => this.playerAction(client, message));
    console.log("Room Created!");

    this.clock.setTimeout(() => {

      this.setMetadata({
        customData: "Hello world!"
      }).then(() => updateLobby(this));

    }, 5000);
  }

  /** onAuth is called before onJoin */
  async onAuth(client: Client, options: any, request: any) {
    logger.info(`*********************** TIC TAC TOE CLIENT JOIN ${client.sessionId} option: ${JSON.stringify(options)}*********************** `);
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

  onJoin (client: Client, options: any) {
    
    logger.silly(`*** On Join Tic Tac Toe - ${client.sessionId} option : ${JSON.stringify(options)}***`);
    logger.info(`*********************** TIC TAC TOE CLIENT JOIN ${client.sessionId} *********************** `);

    this.state.players.set(client.sessionId, true);

    if (this.state.players.size === 2) {
      this.state.currentTurn = client.sessionId;
      this.setAutoMoveTimeout();

      // lock this room for new users
      this.lock();
    }
  }

  playerAction (client: Client, data: any) {
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

        } else if (this.checkBoardComplete()) {
          this.state.draw = true;

        } else {
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

  checkBoardComplete () {
    return this.state.board
      .filter(item => item === 0)
      .length === 0;
  }

  doRandomMove () {
    const sessionId = this.state.currentTurn;
    for (let x=0; x<BOARD_WIDTH; x++) {
      for (let y=0; y<BOARD_WIDTH; y++) {
        const index = x + BOARD_WIDTH * y;
        if (this.state.board[index] === 0) {
          this.playerAction({ sessionId } as Client, { x, y });
          return;
        }
      }
    }
  }

  checkWin (x: any, y: any, move: any) {
    let won = false;
    let board = this.state.board;

    // horizontal
    for(let y = 0; y < BOARD_WIDTH; y++){
      const i = x + BOARD_WIDTH * y;
      if (board[i] !== move) { break; }
      if (y == BOARD_WIDTH-1) {
        won = true;
      }
    }

    // vertical
    for(let x = 0; x < BOARD_WIDTH; x++){
      const i = x + BOARD_WIDTH * y;
      if (board[i] !== move) { break; }
      if (x == BOARD_WIDTH-1) {
        won = true;
      }
    }

    // cross forward
    if(x === y) {
      for(let xy = 0; xy < BOARD_WIDTH; xy++){
        const i = xy + BOARD_WIDTH * xy;
        if(board[i] !== move) { break; }
        if(xy == BOARD_WIDTH-1) {
          won = true;
        }
      }
    }

    // cross backward
    for(let x = 0;x<BOARD_WIDTH; x++){
      const y =(BOARD_WIDTH-1)-x;
      const i = x + BOARD_WIDTH * y;
      if(board[i] !== move) { break; }
      if(x == BOARD_WIDTH-1){
        won = true;
      }
    }

    return won;
  }

  async onLeave (client: Client) {
    const userRepo = DI.em.fork().getRepository(User);
    // Find the user object in the database by their activeSessionId
    let user: User = await userRepo.findOne({ activeSessionId: client.sessionId });
    if (user) {
      user.activeSessionId = "";
      user.activeTokenId = "";
      
      // Save the user's changes to the database
      await userRepo.flush();
    }

    this.state.players.delete(client.sessionId);

    if (this.randomMoveTimeout) {
      this.randomMoveTimeout.clear()
    }

    let remainingPlayerIds = Array.from(this.state.players.keys());
    if (remainingPlayerIds.length > 0) {
      this.state.winner = remainingPlayerIds[0]
    }
  }

}

