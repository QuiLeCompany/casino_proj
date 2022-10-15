export enum APAspectRatioFitType {
    None,
    FitVertical,
    FitHorizontal,
    Envelope,
    FitInside,
    Stretch
}

export const ON_SPRITE_FRAME_CHANGED = "OnSpriteFrameChanged";

import { _decorator, Component, Node, Enum, isValid, Rect, Size, Sprite, Widget, UITransform } from 'cc';
const { ccclass, property, executeInEditMode } = _decorator;
 
@ccclass('APAspectRatioFitter')
@executeInEditMode
export default class APAspectRatioFitter extends Component {

    @property(Sprite) sprite: Sprite | null = null;

    @property({ type: Enum(APAspectRatioFitType), serializable: true, visible: false })
    private _fitMode: APAspectRatioFitType = APAspectRatioFitType.Envelope;
    @property({ type: Enum(APAspectRatioFitType) })
    get fitMode() {
        return this._fitMode;
    }
    set fitMode(value) {
        this._fitMode = value;
        this.validateFitMode();
        this.onSizeChanged();
    }

    @property({ type: Node })
    private _relativeTo: Node | null = null;
    @property({ type: Node })
    get relativeTo(): Node | null {
        return this._relativeTo ? this._relativeTo : null;
    }
    set relativeTo(value: Node | null) {
        if (this._relativeTo?.uuid != value?.uuid) {
            if (isValid(this._relativeTo, true))
                this._relativeTo?.off(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
            this._relativeTo = value;
            if (isValid(this._relativeTo, true))
                this._relativeTo?.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
            this.validateFitMode();
            this.onSizeChanged();
        }
    }

    private editorFocus: boolean = false;
    private lastSpriteName: string | null = null;
    private _nodeTransform: UITransform | null = null;


    onLoad() {
        if (this.sprite == null)
            this.sprite = this.getComponent(Sprite);
        if (this._relativeTo == null)
            this._relativeTo = this.node.parent;
        if (this._nodeTransform == null)
            this._nodeTransform = this.node?.getComponent(UITransform);
    }

    onEnable() {
        this.onSizeChanged();
        this._relativeTo?.on(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
        this.node.on(ON_SPRITE_FRAME_CHANGED, this.onSizeChanged, this);
        if (this._nodeTransform == null)
            this._nodeTransform = this.node?.getComponent(UITransform);
    }

    onDisable() {
        if (isValid(this.node, true)) {
            this._relativeTo?.off(Node.EventType.SIZE_CHANGED, this.onSizeChanged, this);
            this.node.off(ON_SPRITE_FRAME_CHANGED, this.onSizeChanged, this);
        }
    }

    protected validateFitMode(): void {
        if (this._relativeTo?.uuid == this.node.uuid) {
            if (this._fitMode == APAspectRatioFitType.Envelope || this._fitMode == APAspectRatioFitType.FitInside || this._fitMode == APAspectRatioFitType.Stretch)
                this._fitMode = APAspectRatioFitType.None;
        }
    }

    public onFocusInEditor(): void {
        this.editorFocus = true;
    }

    public onLostFocusInEditor(): void {
        this.editorFocus = false;
    }

    protected update(dt: number): void {
        if (this.editorFocus) {
            this.onSizeChanged();
        }
        else if (this.lastSpriteName != this.getSpriteName()) {
            this.onSizeChanged();
        }
    }


    protected getSpriteName(): string {
        return this.sprite?.spriteFrame?.name || "";
    }

    onSizeChanged() {
        if (this.sprite == null || this._relativeTo == null)
            return;

        this.lastSpriteName = this.getSpriteName();
        if (this.sprite == null || this.sprite.spriteFrame == null)
            return;

        var spriteSize: Size = this.sprite.spriteFrame.getOriginalSize();
        if (this.sprite.trim) {
            let _rect: Rect = this.sprite.spriteFrame.getRect();
            spriteSize = new Size(_rect.width, _rect.height);
        }
        let relateUITransform = this._relativeTo?.getComponent(UITransform);
        var widthFactor: number = relateUITransform ? relateUITransform.width / spriteSize.width : 0;
        var heightFactor: number = relateUITransform ? relateUITransform.height / spriteSize.height : 0;

        switch (this.fitMode) {
            case APAspectRatioFitType.Envelope:
                var multFactor: number = Math.max(widthFactor, heightFactor);
                if (this._nodeTransform)
                {
                    this._nodeTransform.width = spriteSize.width * multFactor;
                    this._nodeTransform.height = spriteSize.height * multFactor;
                }
                
                break;
            case APAspectRatioFitType.FitVertical:
                if (this._nodeTransform)
                {
                    this._nodeTransform.height = relateUITransform ? relateUITransform.height : 0;
                    this._nodeTransform.width = spriteSize.width * heightFactor;
                }
                break;
            case APAspectRatioFitType.FitHorizontal:
                if (this._nodeTransform)
                {
                    this._nodeTransform.width = relateUITransform ? relateUITransform.width : 0;
                    this._nodeTransform.height = spriteSize.height * widthFactor;
                }
                break;
            case APAspectRatioFitType.FitInside:
                var multFactor: number = Math.min(widthFactor, heightFactor);
                if (this._nodeTransform)
                {
                    this._nodeTransform.width = spriteSize.width * multFactor;
                    this._nodeTransform.height = spriteSize.height * multFactor;
                }
                break;
            case APAspectRatioFitType.Stretch:
                if (this._nodeTransform)
                {   
                    this._nodeTransform.width = relateUITransform ? relateUITransform.width : 0;
                    this._nodeTransform.height = relateUITransform ? relateUITransform.height : 0;
                }
                break;
            default:
                break;
        }

        let _widget: Widget|null = this.getComponent(Widget);
        if (_widget) {
            _widget.alignMode = Widget.AlignMode.ALWAYS;
        }
    }

}
