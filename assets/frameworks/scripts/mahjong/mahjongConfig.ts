
import { _decorator, screen } from 'cc';
import { util } from '../frameworks/util';
const { ccclass, property } = _decorator;
export let MAHJONG = `Mahjong`;
export let IPAD_NAME = `-ipad`;

@ccclass('mahjongConfig')
export class mahjongConfig {
    // FOR CONFIG
    public IS_DEBUG_MODE: boolean = !true;

    private static _instance: mahjongConfig;
    public isMahjongGame: boolean = true;
    public IS_IPAD = false;
    
    static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new mahjongConfig();
        this._instance.init();
        return this._instance;
    }

    private init() {
        // let size = screen.windowSize;
        this.IS_IPAD = util.isIpad(screen.windowSize);
    }

    private _callback: Function = new Function();

    public mahjongConfig (cb: Function) {
        this._callback = cb;
    }

    public isLoaded = false;
}

