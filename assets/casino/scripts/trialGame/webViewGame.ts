import { _decorator, Component, Node, WebView, log } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('webViewGame')
export class webViewGame extends Component {
    @property(WebView) webView: WebView = null!;

    // public urlGame: string = "https://cdn.oryxgaming.com/badges/GMT/_OD1/v2.0.20/index.html?token=token&gameCode=GMT_HAWAIIAN_DREAM&languageCode=ENG&playMode=FUN&lobbyUrl=https://play-prodcopy.oryxgaming.com/agg_plus_public/close/wallets/GENERIC&historyType=INGAME&isGameBridge=true";

    public urlGame: string = "https://cdn.oryxgaming.com/badges/GMT/_OD1/v2.0.20/index.html?token=token&gameCode=GMT_HAWAIIAN_DREAM&languageCode=ENG&playMode=FUN&isGameBridge=true";


    onLoad() {
        log(`********** ON LOOAD ***********`);
    }
    
    onEnable() {
        log(`********** ON ENABLE ***********`);
        this.webView.url = this.urlGame;
    }    

    onDisable() {
        log(`********** ON DISABLE ***********`);
        this.webView.url = "";
    }

    onBtnShow() {
        this.node.active = true;
    }

    onBtnHide() {
        this.node.active = false;
    }

}

