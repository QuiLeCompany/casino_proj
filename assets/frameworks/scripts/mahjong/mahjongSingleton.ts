
import { _decorator, Component, Node } from 'cc';
import { FightMahjong, PlayHistory } from './FightMahjong';
const { ccclass, property } = _decorator;

export enum PATH_UI {
    fightFailed = 'fightMahjong/fightFailed',
    gameMenu = 'dialog/gameMenu',
    gameSettingMahjong = 'dialog/gameSettingMahjong',
    gameTutorial = 'dialog/gameTutorial',
    fightStats = 'fightMahjong/fightStats',
    fightStumped = 'fightMahjong/fightStumped',
    fightCleanAll = 'fightMahjong/fightCleanAll',
    informationPopup = 'dialog/informationPopup'
}

export enum MHJ_GAME_SAVE {
    timeMode = `mhj_b_time_mode`,
    timeCount = `mhj_n_time_count`,
    style = `mhj_n_style`,
    point = `mhj_n_point`,
    level = `mhj_n_level`,
    historyLevel = `mhj_lv_`,
    historyCnt = `mhj_history_cnt`,
    historyPlay = `mhj_playHistory`
}

@ccclass('MahjongSingleton')
export class MahjongSingleton {
    public static readonly LEVEL_START = 0;
    public static readonly NUM_BLOCK_DEBUG_WIN = 136;
    public static readonly NUM_BLOCK_TARGET_WIN = 100;
    public static readonly POINT_UNDO_STEP = 500;
    public static readonly POINT_SHOW_HINT = 500;
    public static readonly POINT_SHUFFLE_GAME = 1000;
    public static readonly POINT_RESET_GAME = 1000;
    public static readonly POINT_CLEAN_BLOCK = 200;

    public static IS_DEBUG_FROM_SND = !true;
    public static IS_DEBUG_FROM_DIALOG = !true;
    public static IS_CLEAN_DATA_DB = !true;
    public static mahjongFight: FightMahjong;
    public static isFirstLoad = true;
    public static gPlayHistory: PlayHistory[] = [];
    public static historyCnt = 0;
    
}
