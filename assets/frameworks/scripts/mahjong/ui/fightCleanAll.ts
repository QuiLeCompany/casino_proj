
import { _decorator, Component, Node } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../../ui/loading/sceneManager';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;
 
@ccclass('fightCleanAll')
export class fightCleanAll extends Component {

    show() {
        // this.lbLevel.string = playerData.instance.level;
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog(PATH_UI.fightCleanAll);
        this.resetAllData();
    }

    private resetAllData() {
        MahjongSingleton.mahjongFight.resetAllLevel();
    }

}