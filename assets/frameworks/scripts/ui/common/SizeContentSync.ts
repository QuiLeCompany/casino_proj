
import { _decorator, Component, Node, isValid, size, Widget, UITransform } from 'cc';
import { EDITOR } from 'cc/env';
import { resourceUtil } from '../../frameworks/resourceUtil';
const { ccclass, property } = _decorator;
 
@ccclass('SizeContentSync')
export class SizeContentSync extends Component {

    @property(Node) sourceNode: Node | null = null;
    @property syncWidth: boolean = false;
    @property syncHeight: boolean = false;
    @property adaptChildrenWidget: boolean = false;


    protected onEnable(): void {
        this.onSourceNodeSizeChanged();

        if (isValid(this.sourceNode, true) && (this.syncWidth == true || this.syncHeight == true)) {
            this.sourceNode?.on(Node.EventType.SIZE_CHANGED, this.onSourceNodeSizeChanged, this);
        }
    }

    protected onDisable(): void {
        if (isValid(this.sourceNode, true)) {
            this.sourceNode?.off(Node.EventType.SIZE_CHANGED, this.onSourceNodeSizeChanged, this);
        }
    }

    private onSourceNodeSizeChanged(): void {
        let transform = this.node?.getComponent(UITransform);
        transform?.setContentSize(size(this.syncWidth ? transform?.width : transform?.width, this.syncHeight ? transform?.height : transform?.height));
        if (!EDITOR && this.adaptChildrenWidget) {
            resourceUtil.updateWidget(this.node, true, Widget.AlignMode.ON_WINDOW_RESIZE);
        }
    }

    public changeSourceNode(node: Node) {
        if (isValid(this.sourceNode, true)) {
            this.sourceNode?.off(Node.EventType.SIZE_CHANGED, this.onSourceNodeSizeChanged, this);
        }

        if (isValid(node, true) && (this.syncWidth == true || this.syncHeight == true)) {
            this.sourceNode = node;
            this.onSourceNodeSizeChanged();
            this.sourceNode.on(Node.EventType.SIZE_CHANGED, this.onSourceNodeSizeChanged, this);
        }
    }

}
