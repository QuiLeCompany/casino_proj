
import { _decorator, Component, Node, Label } from 'cc';
import { nativeEvent } from '../../frameworks/nativeEvent';
import { uiManager } from '../../frameworks/uiManager';
import { MahjongSingleton } from '../mahjongSingleton';
const { ccclass, property } = _decorator;

@ccclass('FightMahjongUI')
export class FightMahjongUI extends Component {
    onSettingClick() {
        uiManager.instance.showDialog('dialog/gameSettingMahjong');
    }
    
    onMenuClick() {
        let needShowRate = nativeEvent.getInstance().isEnableShowReviewPopupStartGame();
        needShowRate && nativeEvent.getInstance().showRateGame();
        // console.log(`sucess ..... ${test}`);
        uiManager.instance.showDialog('dialog/gameMenu');
    }

    onUndoBtnClick() {
        MahjongSingleton.mahjongFight?.undoGame(true);
    }

    onHintBtnClick() {
        MahjongSingleton.mahjongFight?.showHint(true);
    }

    onShuffleClick() {
        MahjongSingleton.mahjongFight?.shufflePanel(true);
    }
}
