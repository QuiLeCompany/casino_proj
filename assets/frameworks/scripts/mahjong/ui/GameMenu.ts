
import { _decorator, Component, Node, log, Slider, Label } from 'cc';
import { nativeEvent } from '../../frameworks/nativeEvent';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../../ui/loading/sceneManager';
import { STYLE } from '../BlockSprite';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;

@ccclass('GameMenu')
export class GameMenu extends Component {

    private enableCheatAddPoint: boolean = false;
    private countTouchCheatButton = 0;

    show() {
        this.enableCheatAddPoint = false;
        this.countTouchCheatButton = 0;
    }

    onBtnBackToMenu() {
        this.hideGameMenu();
        SceneManager.instance.loadScene('home', [], (err: any, result: any) => {
            if (err) {
                console.error(err.message || err);
                return;
            }
        });
    }

    onStatsClick() {
        this.hideGameMenu();
        uiManager.instance.showDialog(PATH_UI.fightStats);
    }

    onTutorialClick() {
        this.hideGameMenu();
        uiManager.instance.showDialog(PATH_UI.gameTutorial);
    }

    onBtnAreYouStumped() {
        this.hideGameMenu();
        uiManager.instance.showDialog(PATH_UI.fightStumped);
    }

    onBtnTellYourFriend() {
        nativeEvent.getInstance().shareWithFriend();
    }

    onBtnMoreGameClick() {
        nativeEvent.getInstance().showMoreGame();
    }

    onBtnCloseClick() {
        this.hideGameMenu();
    }

    private hideGameMenu() {
        uiManager.instance.hideDialog(PATH_UI.gameMenu);
    }

    onBtnCheatAddPoint() {
        if (this.enableCheatAddPoint) {
            this.enableCheatAddPoint = false;
            this.countTouchCheatButton = 0;
            console.log(`BINGO ............................`);
            MahjongSingleton.mahjongFight?.setPoint(1000);
        }
        else {
            this.countTouchCheatButton ++;
            if (this.countTouchCheatButton > 2) {
                this.enableCheatAddPoint = true;
            }
        }
    }
}
