import { _decorator, Component, director, profiler, game, Game, resources } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { playerData } from '../../frameworks/playerData';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../loading/sceneManager';
import { clientEvent } from '../../frameworks/clientEvent';
import { GameLogic } from '../../frameworks/gameLogic';
import * as i18n from '../../../../../extensions/i18n/assets/LanguageData';
import { constants } from '../../shared/constants';
import { localConfig } from '../../frameworks/localConfig';
import { StorageManager } from '../../frameworks/storageManager';
import { mahjongConfig, MAHJONG, IPAD_NAME } from '../../mahjong/mahjongConfig';
import { MahjongSingleton } from '../../mahjong/mahjongSingleton';
import { nativeEvent } from '../../frameworks/nativeEvent';
import { util } from '../../frameworks/util';
const { ccclass, property } = _decorator;

@ccclass('LoginScene')
export class LoginScene extends Component {
    currentStep: any = null!;
    isLoadCsvFinishd: any = false;

    showAdsBanner() {
        nativeEvent.getInstance().hideAdsBanner();
        nativeEvent.getInstance().setupAdsBanner();
        nativeEvent.getInstance().showAdsBanner();
    }

    onLoad() {
        this.showAdsBanner();

        if (mahjongConfig.instance.isMahjongGame && !mahjongConfig.instance.isLoaded) {
            this.preloadMahjongGame();
            mahjongConfig.instance.isLoaded = true;
        }
    
        if (!constants.IS_SHOW_PROFILE_STATUS)
            profiler.hideStats();

        //初始化音频
        AudioManager.instance.init();
        let soundName = mahjongConfig.instance.isMahjongGame? constants.AUDIO_MUSIC.MAHJONG_BG : constants.AUDIO_MUSIC.BACKGROUND;
        if (!AudioManager.instance.isMusicPlaying(soundName))
            AudioManager.instance.playMusic(soundName, true, true);

        //初始化玩家数据
        MahjongSingleton.IS_CLEAN_DATA_DB && StorageManager.instance.cleanAllData();
        playerData.instance.loadGlobalCache();
        if (!playerData.instance.userId) {
            playerData.instance.generateRandomAccount();
            console.log("###生成随机userId", playerData.instance.userId);
        }

        playerData.instance.loadFromCache();

        if (!playerData.instance.playerInfo || !playerData.instance.playerInfo.createDate) {
            playerData.instance.createPlayerInfo();
        }

        //记录离线时间
        game.on(Game.EVENT_HIDE, () => {
            if (!playerData.instance.settings) {
                playerData.instance.settings = {};
            }

            playerData.instance.settings.hideTime = Date.now();
            playerData.instance.saveAll();
            StorageManager.instance.save();
        })

        //加载CSV相关配置
        localConfig.instance.loadConfig(() => {
            this.isLoadCsvFinishd = true;
        })

        //For Mahjong
        mahjongConfig.instance.mahjongConfig(() => {
            console.log(`Finished init ..........mahjong config`);
        });
    }

    preloadMahjongGame() {
        //preload data
        resources.preloadDir(`mahjong/fight/chinese/normal`);
        resources.preloadDir(`mahjong/fight/chinese/disable`);
        resources.preloadDir(`mahjong/fight/chinese/focus`);

        //data of emoji
        resources.preloadDir(`mahjong/fight/emoji/normal`);
        resources.preloadDir(`mahjong/fight/emoji/disable`);
        resources.preloadDir(`mahjong/fight/emoji/focus`);
    }

    showLoadingUI() {
        var _this = this;
        this.currentStep = 0;
        var loginTimeOut = function () {
            uiManager.instance.showTips(i18n.t("login/timeout"), function () {
                _this.showLoadingUI();
            })
        };
        this.scheduleOnce(loginTimeOut, 30);

        let dialogLoading = mahjongConfig.instance.isMahjongGame? `common/loading` : `common/loading`;
        uiManager.instance.showDialog(dialogLoading);

        SceneManager.instance.load([
            function (cb: any) {
                _this.currentStep = 1;
                _this.loadSubPackage(cb);
            },
            function (cb: any) {
                _this.currentStep = 2;
                _this.loadGameSubPackage(cb);
            },
            function (cb: any) {
                _this.currentStep = 3;
                _this.unschedule(loginTimeOut);
                _this.enterMainScene(cb);
            }
        ], function (err: any, result: any) {
            if (err) {
                console.error(err.message || err);
                return;
            }
        });
    }

    loadSubPackage(cb: any) {
        cb();
    }

    loadGameSubPackage(cb: any) {
        cb();
    }

    enterMainScene(cb: any) {
        var _this = this;
        let isIpad = mahjongConfig.instance.IS_IPAD;
        let nameMahjongScene = `${MAHJONG}${isIpad ? IPAD_NAME : ''}`;
        let gameScene = mahjongConfig.instance.isMahjongGame? `fight${nameMahjongScene}` : `fight`;
        let targetScene = mahjongConfig.instance.isMahjongGame ? gameScene : playerData.instance.isNewBee ? gameScene : 'pve';
        var onSceneLoaded = function () {
            _this.currentStep = 4;
            cb();

            director.preloadScene(targetScene, function () {
                director.loadScene(targetScene, function () {
                    _this.currentStep = 5;
                    clientEvent.dispatchEvent("onSceneChanged");
                    GameLogic.instance.afterLogin();
                });
            })
        };
        director.preloadScene(targetScene, onSceneLoaded);
    }

    onBtnVisitorLoginClick() {
        if (!this.isLoadCsvFinishd) return;
        this.showLoadingUI();
    }
}