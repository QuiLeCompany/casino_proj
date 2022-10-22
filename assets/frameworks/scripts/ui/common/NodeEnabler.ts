import { _decorator, Component, Node } from 'cc';
import cv from '../../frameworks/cv';
const { ccclass, property } = _decorator;

@ccclass('NodeEnabler')
export class NodeEnabler extends Component {
    @property public isIpadEnableNode: boolean = true; // when is IPAD check this condition to hide / show node
    start() {
        if (cv.gameConfig?.IS_IPAD) {
            this.node.active = this.isIpadEnableNode;
        }
        
    }
}

