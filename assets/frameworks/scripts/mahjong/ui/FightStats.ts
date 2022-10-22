
import { _decorator, Component, Node, log, Slider, Label, Sprite, Color } from 'cc';
import { uiManager } from '../../frameworks/uiManager';
import { SceneManager } from '../../ui/loading/sceneManager';
import { STYLE } from '../BlockSprite';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;

export enum TAB_STATS {
    SUMMARY,
    TOP_TIME,
    RECENT_TIME
}

@ccclass('FightStats')
export class FightStats extends Component {
    readonly TAB_COLOR_SELECT = `#530EE6`;
    readonly TAB_COLOR_NORMAL = `#FFFFFF`;
    readonly TEXT_COLOR_SELECT = `#FFFFFF`;
    readonly TEXT_COLOR_NORMAL = `#000000`;

    @property({type: Node,}) tabsArray: Node[] = [];
    @property({type: Node,}) tabsContentArray: Node[] = [];

    private tabSelected = TAB_STATS.SUMMARY;


    show() {
        this.updateUI();
    }

    onBtnCloseClick() {
        this.hideStatsPopup();
    }

    onBtnShuffleClick() {
        //do shuffle
        this.hideStatsPopup();
    }

    setTab(event: Event, customEventData : string) {
        // log(`SET TAB : ${customEventData}`);
        this.tabSelected = parseInt(customEventData) ;
        this.updateUI();
    }

    private hideStatsPopup() {
        uiManager.instance.hideDialog(PATH_UI.fightStats);
    }

    private updateUI() {
        this.updateTabsUI();
        this.updateContent();
    }

    private updateTabsUI() {
        this.tabsArray.forEach((tab, index) => {
            if(tab){
                this.updateTabUI(index, this.tabSelected === index);
            }
        });

    }

    private updateTabUI(index: number ,isSelect: boolean) {
        let sprite = this.tabsArray[index]?.getComponent(Sprite);
        let label = this.tabsArray[index]?.children[0]?.getComponent(Label);

        if( sprite == null || label == null ) return;
        if (isSelect) {
            sprite.color = new Color(this.TAB_COLOR_SELECT);
            label.color = new Color(this.TEXT_COLOR_SELECT);
        }
        else {
            sprite.color = new Color(this.TAB_COLOR_NORMAL);
            label.color = new Color(this.TEXT_COLOR_NORMAL);
        }
    }

    private updateContent() {
        this.tabsContentArray.forEach((content, id) => {
            if(content) {
                content.active = id === this.tabSelected;
            }
        });
    }
}
