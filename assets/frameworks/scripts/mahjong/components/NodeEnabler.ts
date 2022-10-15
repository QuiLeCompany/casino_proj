import { _decorator, Component, Node } from 'cc';
import { mahjongConfig } from '../mahjongConfig';
const { ccclass, property } = _decorator;

@ccclass('NodeEnabler')
export class NodeEnabler extends Component {
    @property public isIpadEnableNode: boolean = true; // when is IPAD check this condition to hide / show node
    start() {
        if (mahjongConfig.instance.IS_IPAD) {
            this.node.active = this.isIpadEnableNode;
        }
        
    }
}

