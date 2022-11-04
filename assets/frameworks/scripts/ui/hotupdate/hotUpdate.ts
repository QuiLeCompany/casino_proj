import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

import * as i18n from '../../../../../extensions/i18n/assets/LanguageData';
import { CLIENT_EVENT_NAME } from '../../../../casino/scripts/config/CLIENT_EVENT_NAME';
import { GameConfig } from '../../../../casino/scripts/config/GameConfig';
import { clientEvent } from '../../frameworks/clientEvent';
import cv from '../../frameworks/cv';
import { Delay } from '../../frameworks/helpers/Delay';
import { SceneManager } from '../loading/sceneManager';

@ccclass('hotUpdate')
export class hotUpdate extends Component {

    currentStep = 0;

    onLoad() {
        i18n.init('en');

        cv.initBaseClass();
    }

    async start() {
        console.log(`*************** START HOT UPDATE ****************`);
        await Delay.delay(500);
        console.log(`*************** OK ****************`);
        cv.init();

        const _this = this;
        this.currentStep = 0;
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
                _this.enterLoginScreen(cb);
            }
        ], function (err: any, result: any) {
            if (err) {
                console.error(err.message || err);
                return;
            }
        });
    }
    enterLoginScreen(cb: any) {
        const _this = this;
        let targetScene = GameConfig.SCENE.FISH_GAME;
        var onSceneLoaded = function () {
            _this.currentStep = 4;
            cb();

            director.preloadScene(targetScene, function () {
                director.loadScene(targetScene, function () {
                    _this.currentStep = 5;
                    clientEvent.dispatchEvent(CLIENT_EVENT_NAME.ON_SCENE_CHANGE);
                });
            })
        };
        director.preloadScene(targetScene, onSceneLoaded);
    }

    loadSubPackage(cb: any) {
        cb();
    }

    loadGameSubPackage(cb: any) {
        cb();
    }
}

