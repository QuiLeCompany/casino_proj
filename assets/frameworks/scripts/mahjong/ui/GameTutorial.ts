
import { _decorator, Component, Node, log, Slider, Label } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../../ui/loading/sceneManager';
import { STYLE } from '../BlockSprite';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;

@ccclass('GameTutorial')
export class GameTutorial extends Component {

    show() {
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
    }

    onTutorialClick() {
        this.hideGameMenu();
    }

    onBtnAreYouStumped() {
        this.hideGameMenu();
    }

    onBtnTellYourFriend() {
        log(`Implement function share...`);
    }

    onBtnMoreGameClick() {
        log(`redirect to developer page`);
    }

    onBtnCloseClick() {
        this.hideGameMenu();
    }

    private hideGameMenu() {
        uiManager.instance.hideDialog(PATH_UI.gameTutorial);
    }
}
