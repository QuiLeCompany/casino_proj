
import { _decorator, Component, Node, Label } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;
 
@ccclass('InformationPopup')
export class InformationPopup extends Component {

    @property(Label) title: Label = null!;
    @property(Label) content: Label = null!;

    show(title: string, content: string) {
        this.title.string = title;
        this.content.string = content;
    }

    onClosePopupClick() {
        uiManager.instance.hideDialog(PATH_UI.informationPopup);
    }

}
