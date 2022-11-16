import { _decorator, Component, director, profiler, game, Game, resources, Label, EditBox } from 'cc';
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
import { nativeEvent } from '../../frameworks/nativeEvent';
import { util } from '../../frameworks/util';
import cv from '../../frameworks/cv';
import { Delay } from '../../frameworks/helpers/Delay';
import { RequestResponse } from '../../frameworks/models/RequestResponse';
import { GameConfig } from '../../../../casino/scripts/config/GameConfig';
import { CLIENT_EVENT_NAME } from "../../../../casino/scripts/config/CLIENT_EVENT_NAME";
const { ccclass, property } = _decorator;

import { AuthResponse } from '@supabase/gotrue-js/src/lib/types';

@ccclass('LoginScene')
export class LoginScene extends Component {
    currentStep: any = null!;
    isLoadCsvFinishd: any = false;

    @property(EditBox) emailLb: EditBox = null!;
    @property(EditBox) passLb: EditBox = null!;

    private email: string = '';
    private password: string = '';
    private username: string = '';

    public updateUsername(editbox: EditBox, customEventData: CustomEvent) {
        this.username = editbox.textLabel!.string;
    }

    public updateEmail(editbox: EditBox, customEventData: CustomEvent) {
        this.email = editbox.textLabel!.string;
    }

    public updatePassword(editbox: EditBox, customEventData: CustomEvent) {
        this.password = editbox.textLabel!.string;
    }

    public emailUpdate(email: string) {
        this.emailLb.string = email;
        this.email = email;
    }

    public passUpdate(pass: string) {
        this.passLb.string = pass;
        this.password = pass;
    }

    showAdsBanner() {
        nativeEvent.getInstance().hideAdsBanner();
        nativeEvent.getInstance().setupAdsBanner();
        nativeEvent.getInstance().showAdsBanner();
    }

    onLoad() {
        this.showAdsBanner();
        if (!constants.IS_SHOW_PROFILE_STATUS)
            profiler.hideStats();

        //初始化音频
        AudioManager.instance.init();
        let soundName = constants.AUDIO_MUSIC.BACKGROUND;
        if (!AudioManager.instance.isMusicPlaying(soundName))
            AudioManager.instance.playMusic(soundName, true, true);

        //初始化玩家数据
        GameConfig.IS_CLEAN_DATA_DB && StorageManager.instance.cleanAllData();
        playerData.instance.loadGlobalCache();
        if (!playerData.instance.userId) {
            playerData.instance.generateRandomAccount();
            console.log("###生成随机userId", playerData.instance.userId);
        }

        playerData.instance.loadFromCache();

        if (!playerData.instance.playerInfo || !playerData.instance.playerInfo.createDate) {
            playerData.instance.createPlayerInfo();
        }

        this.emailUpdate(playerData.instance.playerInfo["username"] || "");
        this.passUpdate(playerData.instance.playerInfo["password"] || "");

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
    }

    showLoadingUI() {
        var _this = this;
        this.currentStep = 0;
        var loginTimeOut = function () {
            uiManager.instance.showTips(i18n.t(GameConfig.TIP.LOGIN_TIME_OUT), function () {
                _this.showLoadingUI();
            })
        };
        this.scheduleOnce(loginTimeOut, 30);

        let dialogLoading = GameConfig.POPUP.LOADING;
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
        let isIpad = cv.gameConfig?.IS_IPAD;
        let targetScene = GameConfig.SCENE.LOBBY;
        var onSceneLoaded = function () {
            _this.currentStep = 4;
            cb();

            director.preloadScene(targetScene, function () {
                director.loadScene(targetScene, function () {
                    _this.currentStep = 5;
                    clientEvent.dispatchEvent(CLIENT_EVENT_NAME.ON_SCENE_CHANGE);
                    GameLogic.instance.afterLogin();
                });
            })
        };
        director.preloadScene(targetScene, onSceneLoaded);
    }

    onBtnVisitorLoginClick() {
        this.ProcessChangeScene();
    }

    onBtnLoginByUserName() {
        console.log(`********** Login by user/ pass : ${this.email} / ${this.password}`);
        const self = this;

        if (GameConfig.USE_SUPABASE) {
            cv.supabase?.signInWithPassword(this.email, this.password, (authResponse: AuthResponse) =>{

                console.log(`SignIn SUPABASE ---
                    data: ${authResponse.data}
                    error: ${authResponse.error}
                `)

                if (authResponse.error != null) {
                    console.log(`Login Error: ${authResponse.error}`);
                    return;
                }
                
                const tokenId = authResponse?.data?.session?.access_token || "";
                playerData.instance.updatePlayerInfo("username", this.email);
                playerData.instance.updatePlayerInfo("password", this.password);
                playerData.instance.tokenId = tokenId;
                StorageManager.instance.save();

                // cv.networkManager?.connect(tokenId);
                self.ProcessLogin();
            });
        }

        else {
            cv.httpHandler?.userLogIn(this.email, this.password, (res: RequestResponse) => {
                if (res?.error == true) {
                    console.log(`Login have some error .........`);
                }
                else {
                    //do something with data from server
                    const data = res.output.user;
                    console.log(`Login data : ${JSON.stringify(data)}`);
                    // build data for user here
                    // login lobby with token.
                    const tokenId = data.pendingTokenId || '';
                    playerData.instance.updatePlayerInfo("username", this.email);
                    playerData.instance.updatePlayerInfo("password", this.password);
                    playerData.instance.tokenId = tokenId;
                    StorageManager.instance.save();
    
                    cv.networkManager?.connect(tokenId);
                    self.ProcessLogin();
                }
            });
        }
        
        
    }

    onBtnSignupByUserName() {
        console.log(`********** Signup by user/ email/ pass : ${this.username} / ${this.email} / ${this.password}`);
        const self = this;

        if (GameConfig.USE_SUPABASE) {
            cv.supabase?.signUpByEmail(this.email, this.password, (data: any, error: any) =>{
                console.log(`SignUp SUPABASE ---
                    data: ${data}
                    error: ${error}
                `)
            });
        }
        else {
            cv.httpHandler?.userSignUp(this.username, this.email, this.password, (res: RequestResponse) => {
                if (res?.error == true) {
                    console.log(`Login have some error .........`);
                }
                else {
                    //do something with data from server
                    const data = res.output.user;
                    console.log(`Login data : ${JSON.stringify(data)}`);
                    // build data for user here
                    // login lobby with token.
                    const tokenId = data.pendingTokenId || '';
                    playerData.instance.tokenId = tokenId;
                    playerData.instance.createPlayerInfo({"username": this.email, "password": this.password});
                    cv.networkManager?.connect(tokenId);
                    StorageManager.instance.save();
                    self.ProcessLogin();
                }
            });
        }
    }

    async ProcessLogin() {
        console.log(`******** START PROCESS LOGIN *****`);
        await Delay.delay(3000);
        console.log(`******** DONE PROCESS LOGIN *****`);
        this.ProcessChangeScene();
    }

    protected ProcessChangeScene() {
        if (!this.isLoadCsvFinishd) return;
        this.showLoadingUI();
    }
}