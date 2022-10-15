
import { _decorator, Component, Node, Sprite, log, Prefab, SpriteFrame, Size, Vec2 } from 'cc';
import { resourceUtil } from '../frameworks/resourceUtil';
import { constants } from '../shared/constants';
import { utils } from '../shared/utils';
const { ccclass, property } = _decorator;

export class BlockInfo {
    floor: number = 0;
    row: number = 0;
    col: number = 0;
    idx: number = 0;
    state: BLSTATE = BLSTATE.ST_NORMAL;
    siblingId: number = 0; //-> this will be set when create, we will have math to get siblingId dependon row,cow, floor
}

export enum BLSTATE {
    ST_NORMAL,
    ST_LOCKED
}

export enum STYLE {
    CHINESE,
    EMOJI
}

export const BSIZE = new Size(73,80);
export const OFFSET = new Vec2(7, 8);

export const MahjongGame = {
    kRowCnt: 8,
    kColCnt: 8,
    kFBCnt : 8 * 8,
    kBlockKind : 36,
    kBlockKindE: 56,
    kFloorCnt: 4,
    kLevelCnt: 200
}
 
@ccclass('BlockSprite')
export class BlockSprite extends Sprite {   
    private _style: number = 0;
    private _info: BlockInfo = null!;
    private _hasFocus: boolean = false;
    private _isRemoved: boolean = false;

    
    clone() : BlockSprite {
        const block = new BlockSprite();

        block._style = this._style;
        block._info = utils.clone(this._info);
        block._hasFocus = this._hasFocus;
        block._isRemoved = this._isRemoved;
        block.name = this.name;
        // console.log(`clone block name : ${block.name}`);

        return block;
    }

    start () {
    }

    private getNumber3Digit(n : number) : string {
        return (n < 9 ? "00" : n < 99 ? "0" : "") + (n + 1);
    }

    private checkResourceImageName(imgString: string) : boolean {
        // TODO: check resource with file name 
        console.warn(`BlockSprite .... check Resource img: ${imgString}`);
        
        return false;
    }

    public static create(blockInfo: BlockInfo, style: number = 0): BlockSprite | null {
        if (blockInfo == null) return null;
        let bl: BlockSprite = new BlockSprite();
        bl.initBlock(blockInfo, style);
        return bl;
    }

    protected async initBlock(blockInfo: BlockInfo, style: number) {
        this.setInfo(blockInfo, style);
        this._hasFocus = false;
        this._isRemoved = false;
    }

    private loadBlockSprite(blockInfo: BlockInfo) {
        let path: string = "mahjong/fight/";
        const chineseStype = "chinese";
        const emojiStype = "emoji";
        const strStyle = this._style == 0 ? chineseStype : emojiStype;
        const strTypeBlock = this.getNumber3Digit(blockInfo.idx);
        const strBlockType = this._hasFocus ? "focus" : blockInfo.state == BLSTATE.ST_NORMAL ? "normal" : "disable";
        const strFormatEmoji = this._style == 0 ? "" : "e_";
        const strFormatHasFocus = this._hasFocus ? "f_" : "";
        const strFormatDisable = blockInfo.state == BLSTATE.ST_NORMAL ? "" : "d_";
        const strFileName = `block_${strFormatEmoji}${strFormatHasFocus}${strFormatDisable}${strTypeBlock}`; //block_e_f_001, block_f_001, block_001, block_d_001

        path = path + `${strStyle}/${strBlockType}/${strFileName}`;
        // console.log(`block path : ${path}`);

        resourceUtil.setSpriteFrame(path, this, (cb: any) => {
            if (cb == null) {
                // console.log(`DONE ..........loaded : ${path}`);
            }
            else {
                log(`........ has error ... ${cb}`);
            }
        });
    }

    // attributes
    public getIdx(): number {
        return this._info.idx;
    }

    public getFloor(): number {
        return this._info.floor;
    }

    public getRow(): number {
        return this._info.row;
    }

    public getCol(): number {
        return this._info.col;
    }

    public getState(): BLSTATE {
        return this._info.state;
    }

    public getInfo(): BlockInfo {
        return this._info;
    }

    public setIdx(idx: number) {
        this._info.idx = idx;
        this.loadBlockSprite(this._info);
    }

    public setState(state: BLSTATE) {
        this._info.state = state;
        this.loadBlockSprite(this._info);
    }

    public setInfo(blockInfo: BlockInfo, style: number) {
        this._style = style;
        this._info = blockInfo;
        this.loadBlockSprite(blockInfo);

        const x = blockInfo.col * BSIZE.width + OFFSET.x * this._info.floor;
        const y = (MahjongGame.kRowCnt - blockInfo.row - 1) * BSIZE.height + OFFSET.y * this._info.floor;
        // log(`pos of block id [${blockInfo.col},${blockInfo.row}] -> x: ${x}, -> y: ${y}`);
        //update siblingId depend on pos r,c,f
        this.node.setPosition(x, y);
        this.node.name = `block_f${blockInfo.floor}_r${blockInfo.row}_c${blockInfo.col}` ;
        // this.node.name = "" + blockInfo.siblingId;
        // this.node.setSiblingIndex(blockInfo.siblingId);
    }

    public updateSiblingId() {
        this.node.setSiblingIndex(this._info.siblingId);
    }

    public hasFocus() : boolean { return this._hasFocus;}
    public setFocus(bFocus: boolean) {
        if (this._hasFocus == bFocus) return;
        this._hasFocus = bFocus;
        this.loadBlockSprite(this._info);
    }

    public isRmoved() : boolean { return this._isRemoved;}
    public setRemoved (bRemoved: boolean) { this._isRemoved = bRemoved;}
    public updateStyle(style: number) {this._style = style; }
    public resetNormal() {
        this._isRemoved = false;
        this._hasFocus = false;
        this.node.active = true;
    }
}

