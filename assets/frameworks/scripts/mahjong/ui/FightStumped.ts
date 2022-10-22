import { _decorator, Component, Node, log, Slider, Label } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../../ui/loading/sceneManager';
import { STYLE } from '../BlockSprite';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;

@ccclass('FightStumped')
export class FightStumped extends Component {

    show() {
    }

    onBtnRetryClick() {
        MahjongSingleton.mahjongFight?.resetGame(true, () => {
            this.hideGameMenu();
        });
    }
    
    onBtnShuffleClick() {
        MahjongSingleton.mahjongFight?.shufflePanel(true, ()=>{
            this.hideGameMenu();
            MahjongSingleton.mahjongFight?.continueGame();
        });
    }

    onBtnCloseClick() {
        this.hideGameMenu();
    }

    private hideGameMenu() {
        uiManager.instance.hideDialog(PATH_UI.fightStumped);
    }
}
