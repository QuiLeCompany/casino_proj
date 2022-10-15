
import { _decorator, Component, Node, log, Slider, Label } from 'cc';
import { AudioManager } from '../../frameworks/audioManager';
import { uiManager } from '../../frameworks/uiManager';
import { STYLE } from '../BlockSprite';
import { MahjongSingleton, PATH_UI } from '../mahjongSingleton';
const { ccclass, property } = _decorator;

@ccclass('GameSettingMahjong')
export class GameSettingMahjong extends Component {

    @property(Slider) musicSlider: Slider = null!;
    @property(Slider) soundSlider: Slider = null!;
    @property(Label) tileStyleLab: Label = null!;
    @property(Label) timeModeLab: Label = null!;



    show() {
        let soundVolume = AudioManager._instance.getSoundVolume();
        let musicVolume = AudioManager._instance.getMusicVolume();
        this.musicSlider.progress = musicVolume;
        this.soundSlider.progress = soundVolume;

        log(`this is tyle chines ? ${this.isChineStyle()}`);
        this.tileStyleLab.string = `Tile Style: ${this.isChineStyle() ? "Chinese" : "Emoji"}`;
        this.timeModeLab.string = `Time ${!this.isTimeMode() ? "ON" : "OFF"}`;
    }

    onHandleSlideSound(slider: Slider) {
        // log(`$$$$$$ progress Sound : ${slider!.progress}`);
        if (slider) {
            AudioManager._instance.setSound(slider.progress);
        }
    }

    onHandleSlideMusic(slider: Slider) {
        // log(`$$$$$$ progress Music : ${slider!.progress}`);
        if (slider) {
            AudioManager._instance.setMusic(slider.progress);
        }
    }

    onBtnCloseClick() {
        uiManager.instance.hideDialog(PATH_UI.gameSettingMahjong);
        //save
        AudioManager._instance.saveAudioVolume();
    }

    onBtnTimModeClick() {
        MahjongSingleton.mahjongFight?.setTimeMode(!this.isTimeMode());
        this.show();
    }

    onBtnTileStyleClick() {
        MahjongSingleton.mahjongFight?.setBlockStyle(this.isChineStyle() ? STYLE.EMOJI : STYLE.CHINESE);
        MahjongSingleton.mahjongFight?.buildPanel();
        this.show();
    }

    private isChineStyle() : boolean {
        if (MahjongSingleton.mahjongFight?.getBlockStyle() == STYLE.CHINESE) return true;
        return false;
    }

    private isTimeMode(): boolean {
        return MahjongSingleton.mahjongFight?.getTimeMode();
    }

}
