
import { _decorator, Component, Node, log, Vec2, UITransform, Vec3, CCObject, EventKeyboard, input, Input, KeyCode } from 'cc';
import { MahjongSingleton } from './mahjongSingleton';
const { ccclass, property } = _decorator;

/**
 * Predefined variables
 * Name = MahjongGameContent
 * DateTime = Sat Aug 20 2022 21:09:43 GMT+0700 (Indochina Time)
 * Author = QuiLeVan
 * FileBasename = MahjongGameContent.ts
 * FileBasenameNoExtension = MahjongGameContent
 * URL = db://assets/scripts/mahjong/MahjongGameContent.ts
 * ManualUrl = https://docs.cocos.com/creator/3.4/manual/en/
 *
 */
 
@ccclass('MahjongGameContent')
export class MahjongGameContent extends Component {

    onEnable() {
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        input.on(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onDisable() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnded, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchCancel, this);
        input.off(Input.EventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyUp = (event: EventKeyboard) => {
        log(`event keycode: ${event.keyCode}`);
        switch (event.keyCode) {
            case KeyCode.KEY_S: //show debug
                log(`Show debug 2 match blocks`);
                MahjongSingleton.mahjongFight?.showHint();
                break;
            case KeyCode.KEY_R: //remove 2 blocks
                log(`Remove 2 blocks`);
                MahjongSingleton.mahjongFight?.removeDebug2Block();
                break;
            case KeyCode.KEY_W: //enable / disable win/lose
                MahjongSingleton.mahjongFight?.enableWinLoseDebug();
                break;
        }
    }

    onTouchStart(touchEvent: any) {

        // log(` Touch Pos : ${touchEvent.getUILocation()}`);
        // TODO:
        /**
         * get block at touch
         * set block 1
         * check another touch to get block 2 
         * compare 2 touch ( 2 block)
         */

        let pos = this.getLocalBoardInput(touchEvent.getUILocation());
        MahjongSingleton.mahjongFight?.onTouchPanel(pos);
    }

    onTouchMove(touchEvent: any) {
        log(`Touch Move : pos ${touchEvent.getUILocation()}`);
    }

    onTouchEnded(touchEvent: any) {
        log(`Touch End ... ${touchEvent.getUILocation()}`);
        this.touchOver();
    }

    onTouchCancel(touchEvent: any) {
        log(`Touch Cancel ... ${touchEvent.getUILocation()}`);
        this.touchOver();
    }

    touchOver() {
        // TODO:
    }

    getLocalBoardInput(touchInput: Vec3) {
        let startPos = this.getComponent(UITransform)!.convertToWorldSpaceAR(new Vec3(0, 0, 0));
        let offsetPos = touchInput.clone().subtract(startPos);
        return offsetPos;
    }

}

