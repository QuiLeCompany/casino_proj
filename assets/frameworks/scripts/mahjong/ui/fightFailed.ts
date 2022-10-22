
import { _decorator, Component, Node } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../../ui/loading/sceneManager';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;
 
@ccclass('fightFailed')
export class fightFailed extends Component {

    show() {
        // this.lbLevel.string = playerData.instance.level;
    }

    onBtnRetryClick() {
        uiManager.instance.hideDialog(PATH_UI.fightFailed);
        MahjongSingleton.mahjongFight?.resetGame(true, () => {
            uiManager.instance.hideDialog(PATH_UI.fightFailed);
        });
    }

    onBtnUndoClick() {
        MahjongSingleton.mahjongFight?.undoGame(true, ()=>{
            uiManager.instance.hideDialog(PATH_UI.fightFailed);
            MahjongSingleton.mahjongFight?.continueGame();
        });
    }

    onBtnShuffleClick() {
        MahjongSingleton.mahjongFight?.shufflePanel(true, ()=>{
            uiManager.instance.hideDialog(PATH_UI.fightFailed);
            MahjongSingleton.mahjongFight?.continueGame();
        });
    }

}