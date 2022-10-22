import { Game, screen } from 'cc';
import { util } from "../../../frameworks/scripts/frameworks/util";

export class GameConfig {
    public static GAME_NAME = 'Casino';

    public static GAME_VERSION = '0.0.1';

    public static GAME_FRAME = 60;      //游戏当前帧率
    public static GAME_INIT_FRAME = 60; //游戏开发基础帧率

    public IS_DEBUG_MODE: boolean = !true;
    public IS_IPAD = false;

    public static SCENE = {
        HOT_UPDATE: 'hotupdate',
        LOGIN: 'login',
        LOBBY: 'lobby',
        TEST: 'tictactoe'
    }

    public static LOCAL_CACHE = {
        PLAYER: 'player',
        SETTINGS: 'settings',
        DATA_VERSION: 'dataVersion',
    }

    private static _instance: GameConfig = null!;
    public static get instance(): GameConfig {
        if (!GameConfig._instance) {
            
            GameConfig._instance = new GameConfig();
            GameConfig._instance.init();
        }
        return GameConfig._instance;
    }

    private init() {
        // let size = screen.windowSize;
        this.IS_IPAD = util.isIpad(screen.windowSize);
    }

}

