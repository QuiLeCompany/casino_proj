
import { _decorator, Component, Node, Prefab, log, Label, assert, warn, Rect, Vec2, resources, TweenSystem, tween, Vec3, instantiate, Animation } from 'cc';
import { AudioManager } from '../frameworks/audioManager';
import { nativeEvent } from '../frameworks/nativeEvent';
import { poolManager } from '../frameworks/poolManager';
import { StorageManager } from '../frameworks/storageManager';
import { uiManager } from '../frameworks/uiManager';
import { constants } from '../shared/constants';
import { utils } from '../shared/utils';
import { BlockInfo, BlockSprite, BLSTATE, BSIZE, MahjongGame, OFFSET, STYLE } from './BlockSprite';
import { LEVELDATA } from './MahjongLevel';
import { MahjongSingleton, MHJ_GAME_SAVE, PATH_UI } from './mahjongSingleton';
const { ccclass, property } = _decorator;

type PosBlock = {
    row : number;
    col: number;
    floor: number;
    siblingId: number;
}

type PosInput = {
    x: number;
    y: number;
}

interface History {
    blockOne: BlockSprite;
    blockTwo: BlockSprite;
}

export interface PlayHistory {
    playTime: number;           //playing time
    completeFlag: number;       //completing flag 0 or 1
    nlevel: number;             //game level
    timeInfo: string;           //date and time when finishing a level
    stars: number;              //number of stars
}

export const MAXHISTORY = 300;

@ccclass('FightMahjong')
export class FightMahjong extends Component {

    @property(Node) public gameOverEffect: Node = null!;
    @property(Node) public blockGroup: Node = null!;
    @property(Node) public blockAnim: Node = null!;
    @property(Prefab) public blockItemPrefab: Prefab = null!;
    @property(Label) public levelTxt: Label = null!;
    @property(Label) public tileCntLabel: Label = null!;
    @property(Label) public pointLabel: Label = null!;
    @property(Prefab) public blockAnimSpark: Prefab = null!;
    @property(Label) public timeCountDown: Label = null!;

    private level: number = MahjongSingleton.LEVEL_START;
    private _historyLevel: number[][][] = [];
    private _blockInfos: Array<BlockInfo> = [];
    private _style = 0;
    private _blocks: Array<BlockSprite> = [];
    private _point: number = 10000;
    private _focusIdx = -1;
    private hintFirstBlock = -1;
    private hintSecondBlock = -1;
    private _isTimeMode = false;
    private _isEndGame = false;
    private _isEnableWinloseDebug = false;
    private _history: Array<History> = [];
    private _sparkAnim: Node = null!;
    private _timeCountSecond = 0;
    private countDownInterval: any;


    onLoad () {
        this.loadMhjGameData();
        MahjongSingleton.mahjongFight = this;
        this.initSparkAnim();
        this.buildPanel();
        this.updateTimeUi();
    }

    onDisable() {
        clearInterval(this.countDownInterval);
        this.saveMhjData();
    }
    
    private updateTimeUi() {
        this.timeCountDown.node.active = this._isTimeMode;
        
    }
    private initSparkAnim() {
        this._sparkAnim = instantiate(this.blockAnimSpark);
        this._sparkAnim.parent = this.blockAnim;
        this._sparkAnim.active = false;
    }

    public buildPanel() {
        nativeEvent.getInstance().screenTrack(this.level);
        this.loadMahjongLevel();
        log(`***** After Load Level **** total blockCnt = ${this._blockInfos.length}`);
        assert((this._blockInfos.length % 2) == 0, `Should be fix level : ${this.level} to correct.`);
        this.createBlocks();
        this.shufflePanel(false);
    
        // this.updateLevel(this.level);
        this.updateTileCnt(this._blocks.length);
        // this.updatePoint(0);
        this.startTimeCountLevel();
    }

    private updateTimeCountDownString(time: number) {
        if (this.timeCountDown == null) return;
        this.timeCountDown.string = (utils.formatTimeForMillisecond(time * 1000)).toString();//`.. ${time}`
    }

    private startTimeCountLevel() {
        clearInterval(this.countDownInterval);
        let self = this;
        this.countDownInterval = setInterval(() => {
            self._timeCountSecond ++;
            StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.timeCount, self._timeCountSecond);
            // log(`######### TIME :::: ${self._timeCountSecond}`);
            self.updateTimeCountDownString(self._timeCountSecond);
        }, 1000);
    }


    shufflePanel(needPay: boolean, cb?: Function) {
        if (this._blocks.length <= 0)
            return;
        
            if (needPay)
            {
                if (this._point < 1000)
                {
                    log(`your point is low, show popup about that *****`);
                    // alert(`There are no points to use SHUFFLE...`);
                    uiManager.instance.showDialog(PATH_UI.informationPopup, ["Oops","There are no points to use SHUFFLE..."]);
                    return;
                }
                else
                {
                    this.removeSelectBlock();
                    this.updatePoint(-1000);
                    cb && cb();
                }
            }

            this.clearHistory();
            this.shufflePanelFlatFloor();
            this.shuffleReverseBlock();
            this.BlockSortZOrder();
            this.estimatePanel();
    }

    estimatePanel() {
        if (this.processEndGame()) return;
        log(`do check .......`);
        let timeToWait = 1;
        if (MahjongSingleton.isFirstLoad) {
            timeToWait = 1000;
            MahjongSingleton.isFirstLoad = false;
        }
        setTimeout(this.estimateBlockState.bind(this),timeToWait);//need delay to waiting finsh load old data
    }

    checkGameOver() {
        if (!this.checkAnyPairToRemove()) {
            this.showGameOverPopup();
        }
    }

    showGameOverPopup() {
        if (!this._isEndGame)
        {
            this._isEndGame = true;
            uiManager.instance.showDialog(`fightMahjong/fightFailed`);
        }
            
    }

    resetGame(needPay: boolean, cb?: Function) {
        if (needPay) {
            if (this._point < MahjongSingleton.POINT_RESET_GAME)
            {
                uiManager.instance.showDialog(PATH_UI.informationPopup, ["Oops", "Not enough Point to Retset Game..."])
                return;
            }
            else {
                this.setPoint(-MahjongSingleton.POINT_RESET_GAME);
            }
        }
        cb && cb();
        this._isEndGame = false;
        this.buildPanel();
    }

    continueGame() {
        this._isEndGame = false;
    }

    checkAnyPairToRemove(): boolean {
        // check have any pair to player continue to play, if not should shulffle auto.
        for (let b = this._blocks.length - 2; b > 0; b--)
        {
            let block = this._blocks[b];
            if (block.getState() === BLSTATE.ST_NORMAL)
            {
                for (let o = this._blocks.length - 1; o > b + 1; o--)
                {
                    let other = this._blocks[o];
                    if (other.getState() === BLSTATE.ST_NORMAL && block.getIdx() === other.getIdx())
                    {
                        this.hintFirstBlock = b;
                        this.hintSecondBlock = o;


                        log(`first ::
                            this._block[b] status : ${this._blocks[b].getState()} name : ${this._blocks[b].name}
                            second
                            this._block[o] status : ${this._blocks[o].getState()} name : ${this._blocks[o].name}
                        `);

                        return true;
                    }
                }
            }
        }
        log(`[CheckAnyPairToRemove] ==== NO MATCH`);
        this.hintFirstBlock = -1;
        this.hintSecondBlock = -1;
        return false;
    }

    showHint(isNeedPay = false) {
        if (isNeedPay) {
            if (this._point < MahjongSingleton.POINT_SHOW_HINT)
            {
                // alert(`There are no points to use SHOW HINT...`);
                uiManager.instance.showDialog(PATH_UI.informationPopup, ["Oops","There are no points to use SHOW HINT..."]);
                return;
            }
            this.updatePoint(-MahjongSingleton.POINT_SHOW_HINT);
        }
        if (this.hintFirstBlock == -1 || this.hintSecondBlock == -1) return;
        //show info
        const one = this._blocks[this.hintFirstBlock];
        const second = this._blocks[this.hintSecondBlock];

        log(`First Block:
            name: ${one.name}
            at : ${one.getFloor()}_${one.getRow()}_${one.getCol()}
            status : ${one.getState()}
        `);
        one.setFocus(true);

        log(`Second Block:
            name: ${second.name}
            at : ${second.getFloor()}_${second.getRow()}_${second.getCol()}
            status : ${second.getState()}
        `);
        second.setFocus(true);
    }

    enableWinLoseDebug() {
        this._isEnableWinloseDebug = !this._isEnableWinloseDebug;
    }

    resetHint2Block() {
        if (this.hintFirstBlock == -1 || this.hintSecondBlock == -1) return;
        const one = this._blocks[this.hintFirstBlock];
        const second = this._blocks[this.hintSecondBlock];

        if (one == null || second == null) return;
        one.setFocus(false);
        second.setFocus(false);
        this.hintFirstBlock == -1;
        this.hintSecondBlock == -1;
    }

    removeDebug2Block() {
        if (this.hintFirstBlock == -1 || this.hintSecondBlock == -1) return;
        const one = this._blocks[this.hintFirstBlock];
        const second = this._blocks[this.hintSecondBlock];

        if (one == null || second == null) return;
        this.doMatchTwoBlock(one, second);
    }

    estimateBlockState() {
        log(`START check .......`);
        // update each element with state to : ST_NORMAL/ ST_LOCKED
        const panel: BlockSprite [][][] = [];
        for(let floor = 0; floor < MahjongGame.kFloorCnt; floor++)
        {
            panel[floor] = [];
            for (let row = 0; row < MahjongGame.kRowCnt; row++){
                panel[floor][row] = [];
                for (let col = 0; col < MahjongGame.kColCnt; col++) {
                    panel[floor][row][col] = new BlockSprite();
                }
            }
        }
               
        // deep clone current panel
        for (let b = 0; b < this._blocks.length; b++) {
            let blockClone = this._blocks[b].clone();
            if (panel[blockClone.getFloor()] == null) panel[blockClone.getFloor()] = [];
            if (panel[blockClone.getFloor()][blockClone.getRow()] == null) panel[blockClone.getFloor()][blockClone.getRow()] = [];
            panel[blockClone.getFloor()][blockClone.getRow()][blockClone.getCol()] = blockClone;
        }

        for (let b = 0; b < this._blocks.length; b++) {
            let block = this._blocks[b];
            // log(`check block@@@ : ${block.name} at ${block.getFloor()}_${block.getRow()}_${block.getCol()}`);
            if (block.isRmoved())
                continue;
            
            //check above direction floor
            if (block.getFloor() < MahjongGame.kFloorCnt - 1) {
                let behine = false;
                for (let above = block.getFloor() + 1; above < MahjongGame.kFloorCnt; above++) {
                    if (panel[above][block.getRow()][block.getCol()].getInfo() != null)
                    {
                        // log(`----------- block LOCK : ${block.name} has above : at ${above}_${block.getRow()}_${block.getCol()} name: ${panel[above][block.getRow()][block.getCol()].name}`);
                        block.setState(BLSTATE.ST_LOCKED);
                        behine = true;
                        break;
                    }
                }
                if (behine)
                    continue;
            }

            //TODO: check about edge blocks
            const f = block.getFloor(), r = block.getRow(), c = block.getCol();
            const mask: number[][] = [
                [-1, 0], // left
                [1, 0], // right
                [0, -1], // top
                [0, 1], // bottom
            ]
            let dir: boolean[] = [false, false, false, false];
            let openCnt = 0;

            // log(`****** check edge : f${f}_r${r}_c${c} block name: ${block.name}`);

            for (let d = 0; d < 4; d++) {
                let row = r + mask[d][1];
                let col = c + mask[d][0];
                // log(`** at id[${d}]: 
                // row: ${row}, 
                // col : ${col} 
                // panel is null : ${panel?.[f]?.[row]?.[col]?.getInfo() == null }
                // `);//
                if (row < 0 || row >= MahjongGame.kRowCnt || col < 0 || col >= MahjongGame.kColCnt || panel?.[f]?.[row]?.[col]?.getInfo() == null) {
                    dir[d] = true;
                    openCnt++;
                }
            }

            // log(`status openCnt : ${openCnt}`);
            if (openCnt >= 3) {
                block.setState(BLSTATE.ST_NORMAL);
            } 
            else if (openCnt == 2) {
                if ((dir[0] && dir[2]) || (dir[0] && dir[3]) || // left-top, left-bot
                    (dir[1] && dir[2]) || (dir[1] && dir[3]) || // right-top, right-bot
                    (dir[0] && dir[1]))                         // left-right
                {
                    block.setState(BLSTATE.ST_NORMAL);
                }
                else {
                    block.setState(BLSTATE.ST_LOCKED);
                }
            }
            else if (openCnt == 1) {
                if (dir[0] || dir[1]) {                         // left or right
                    block.setState(BLSTATE.ST_NORMAL);
                }
                else {
                    block.setState(BLSTATE.ST_LOCKED);
                }
            } 
            else {
                block.setState(BLSTATE.ST_LOCKED);
            }
        }

        this.checkGameOver();
    }

    processEndGame(): boolean {
        if (this._blocks.length <= MahjongSingleton.NUM_BLOCK_TARGET_WIN || (this._blocks.length <= MahjongSingleton.NUM_BLOCK_DEBUG_WIN && this._isEnableWinloseDebug)) 
        {
            this.saveData(1, 1);
            // Save Data to go next level
            // Reset timer = 0
            // report score

            if (this.level < MahjongGame.kLevelCnt) {
                let needShowRate = nativeEvent.getInstance().isEnableReviewPopupWhenCompleteGame();
                needShowRate && nativeEvent.getInstance().showRateGame();
                this.buildPanel();
                AudioManager.instance.playSound(constants.AUDIO_SOUND.MAHJONG_COMPLETE, false);
            }
            else {
                uiManager.instance.showDialog(PATH_UI.fightCleanAll);
            }

            return true;
        }
        return false;
    }

    resetAllLevel() {
        this.level = MahjongSingleton.LEVEL_START;
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.level, this.level);
        this.buildPanel();
    }

    saveData(inc: number, cFlag: number) {

        // let playHistory: PlayHistory;
        
        
        
        //Update PlayHistory (playTime, completeFlag, nLevel, timeInfo, stars)
        this.level += inc;
        MahjongSingleton.historyCnt += inc;
        
        log(`
        MahjongSingleton.historyCnt = ${MahjongSingleton.historyCnt}
        MahjongSingleton.gPlayHistory.length = ${MahjongSingleton.gPlayHistory.length}
        `);
        if (MahjongSingleton.historyCnt >= MAXHISTORY) MahjongSingleton.historyCnt = 0;
        if (MahjongSingleton.gPlayHistory.length < MAXHISTORY){
            log(`PUSH`);
            MahjongSingleton.gPlayHistory.push({
                playTime : this._timeCountSecond ? this._timeCountSecond : 0,
                completeFlag: cFlag,
                nlevel: this.level,
                timeInfo: Date.now.toString(),
                stars: 0
            });
        }
        else {
            log(`UPDATE`);
            MahjongSingleton.gPlayHistory[MahjongSingleton.historyCnt].playTime = this._timeCountSecond ? this._timeCountSecond : 0;
            MahjongSingleton.gPlayHistory[MahjongSingleton.historyCnt].completeFlag = cFlag;
            MahjongSingleton.gPlayHistory[MahjongSingleton.historyCnt].nlevel = this.level;
            MahjongSingleton.gPlayHistory[MahjongSingleton.historyCnt].timeInfo = Date.now.toString();
            MahjongSingleton.gPlayHistory[MahjongSingleton.historyCnt].stars = 0;
        }
        

        // Save to RMS
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.level, this.level);
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.historyCnt, MahjongSingleton.historyCnt);
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.historyPlay, MahjongSingleton.gPlayHistory);

        if(cFlag) {
            //clear history
            // clear timeCountdown
            this._timeCountSecond = 0;
            StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.timeCount, this._timeCountSecond);
        }
    }

    shuffleReverseBlock() {
        // log(`Suffle from block total -############START##########-`);
        let tmpInfo: BlockInfo;
        let blockCnt = this._blocks.length;
        let tmpIdx = 0;

        while (--blockCnt)
        {
            let rnd = utils.getRandomInt(0, blockCnt);
            // log(`reverse ----- block: ${blockCnt} --- 
            //     randomID : ${rnd}
            // `);

            // swipe 2 blocks
            let one = this._blocks[rnd];
            let revreseBlockNum = blockCnt; // already descrease
            let two = this._blocks[revreseBlockNum];

            // log(`INFO BEFORE SWAP ------ 
            //     one: ${JSON.stringify(one.getInfo())}
            //     two: ${JSON.stringify(two.getInfo())}
            // `);
            
            tmpInfo = utils.clone(one.getInfo());
            one.setInfo(utils.clone(two.getInfo()), this._style);
            two.setInfo(tmpInfo, this._style);

            // log(`INFO AFTER SWAP ------ 
            //     one: ${JSON.stringify(one.getInfo())}
            //     two: ${JSON.stringify(two.getInfo())}
            // `);

            tmpIdx = one.getIdx();
            one.setIdx(two.getIdx());
            two.setIdx(tmpIdx);
        }
        // log(`Suffle from block total -############END##########-`);
    }

    shufflePanelFlatFloor() {
        let blockCnt = this._blocks.length;
        const DEF_TOTAL_BLOCK_TO_FLAT_SUFFLE = 20;
        if (blockCnt <= DEF_TOTAL_BLOCK_TO_FLAT_SUFFLE)
        {
            const panelBoard: Array<PosBlock> = [];
            let siblingId = 0;
            for (let r = 0; r < MahjongGame.kRowCnt; r++)
                for (let c = MahjongGame.kColCnt - 1; c >= 0; c--) {
                    if (LEVELDATA[this.level][0][r][c] == 1)
                    {
                        const row = r;
                        const col = c;
                        log(`########## r${r}_c${c}_sibling${siblingId}`);
                        panelBoard.push({row: row, col: col, floor: 0, siblingId: siblingId});
                        siblingId++;
                    }
                }

            // check status of items in current panel with RawData
            if (panelBoard.length >= blockCnt)
            {
                // shuffle panel as flat
                for (let b = 0; b < blockCnt; b++) {
                    let block = this._blocks[b];
                    if (block) {
                        let rnd = utils.getRandomInt(0, panelBoard.length - 1);
                        let posBlock: PosBlock = panelBoard[rnd];
                        const blockInfo: BlockInfo = block.getInfo();
                        blockInfo.col = posBlock.col;
                        blockInfo.row = posBlock.row;
                        blockInfo.siblingId = posBlock.siblingId;// this.getSiblingIndex(posBlock);
                        // log(`update block f${posBlock.floor}_r${posBlock.row}_c${posBlock.col} : sibling:${posBlock.siblingId}`);
                        block.setInfo(blockInfo, this._style);
                        panelBoard.splice(rnd,1);
                    }
                }
            }
        }
    }

    private BlockSortZOrder() {
        let blockCnt = this._blocks.length;
        this._blocks = this._blocks.sort((a, b) => a.getInfo().siblingId - b.getInfo().siblingId);
        for (let b = 0; b < blockCnt; b++) {
            let block = this._blocks[b];
            if (block) {
                block.updateSiblingId();
                // log(`---- set block name : ${block.name} ---- sibling: ${block.getInfo().siblingId} --- infact: ${block.node.getSiblingIndex()}`);

            }
        }
    }

    getSiblingIndex(posBlock: PosBlock) : number{
        return (MahjongGame.kColCnt - posBlock.col - 1) + MahjongGame.kRowCnt * posBlock.row + posBlock.floor * MahjongGame.kRowCnt * MahjongGame.kColCnt;
    }

    clearHistory() {
        this.cleanSoftLevel();
    }

    updatePoint(point: number) {
        this.setPoint(point);
    }
    
    updateLevel(level: number) {
        throw new Error('Method not implemented.');
    }

    updateTileCnt(length: number) {
        this.tileCntLabel.string = `${length}`;
    }

    private createBlocks() {
        let bId = 0, startIdx = 0, endIdx = 0;
        if (this._style == STYLE.EMOJI) {
            bId = utils.getRandomInt(0, MahjongGame.kBlockKindE - MahjongGame.kBlockKind - 1);
            startIdx = bId;
            endIdx = startIdx + MahjongGame.kBlockKind - 1;
        }

        for (let i = 0; i < this._blockInfos.length; i += 2){
            this._blockInfos[i].idx = bId;
            bId++;
            if ((this._style == STYLE.CHINESE && bId >= MahjongGame.kBlockKind))
                bId = 0;
            else if ((this._style == STYLE.EMOJI && bId >= endIdx))
                bId = startIdx;

            //create one
            this.createBlock(this._blockInfos[i]);
            
            //create two
            this._blockInfos[i+1].idx = this._blockInfos[i].idx;
            this.createBlock(this._blockInfos[i+1]);
        }
        
    }

    private loadMahjongLevel() {
        this.updateLevelUI();
        this.cleanUpBoard();
        const level = this.level;
        //check resum or load old level
        // if have data
        // load old data to this._historyLevel
        //else
        this.loadLevelHistoryOrCreateNew(level);
        log(`*******************************`);
        // let f = 0;
        for (let f = 0; f < MahjongGame.kFloorCnt; f++)
            for (let r = 0; r < MahjongGame.kRowCnt; r++)
                for (let c = MahjongGame.kColCnt - 1; c >= 0; c--) {
                    // log(`@@@@@@ Board data at f: ${i}, r : ${j}, c: ${k}} : ${currentBoardData[i][j][k]}`);
                    if (this._historyLevel[f][r][c] == 1){
                        const blockInfo: BlockInfo = new BlockInfo();
                        blockInfo.col = c;
                        blockInfo.row = r;
                        blockInfo.floor = f;
                        this._blockInfos.push(blockInfo);
                    }
                }
        log(`*******************************`);
        this.updateUIPoint();
    }

    private loadLevelHistoryOrCreateNew(level: number) {

        let data = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.historyLevel + this.level);
        this._historyLevel = data ? data : LEVELDATA[level];
    }

    private saveLevelHistory() {
        // log(`SAVE LEVEL HISTORY....`);
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.historyLevel + this.level, this._historyLevel);
        // for (let f = 0; f < MahjongGame.kFloorCnt; f++)
        //     for (let r = 0; r < MahjongGame.kRowCnt; r++)
        //         for (let c = MahjongGame.kColCnt - 1; c >= 0; c--) {
        //             log(`====== SAVE :::: ${f}, r : ${r}, c: ${c}} : ${this._historyLevel[f][r][c]}`);
        //         }
    }

    private updateLevelUI() {
        this.levelTxt.string = "" + this.level;
    }

    private createBlock (blockInfo: BlockInfo) {
        let block = poolManager.instance.getNode(this.blockItemPrefab, this.blockGroup);
        // block.name = `${block.name}_f${blockInfo.floor}_r${blockInfo.row}_c${blockInfo.col}` ;
        const blockSprite: BlockSprite | null = block.getComponent(BlockSprite);
        if (blockSprite)
        {
            blockInfo.siblingId = blockSprite.node.getSiblingIndex();
            blockSprite.setInfo(blockInfo, this._style);
            this._blocks.push(blockSprite);
        }
        else {
            warn(`BlockSprite is null has block info : ${JSON.stringify(blockInfo)}`);
        }
    }

    private cleanUpBoard() {
        this._blocks.splice(0, this._blocks.length);
        this.blockGroup.removeAllChildren();
        this._blockInfos.splice(0,this._blockInfos.length);
        this.cleanSoftLevel();
    }

    private cleanSoftLevel()
    {
        this._focusIdx = -1;
        this.resetHint2Block();
        this._history.splice(0, this._history.length);
    }

    public loadNextLevel()
    {
        this.level++;
        if (this.level >= MahjongGame.kLevelCnt)
        {
            this.level = 0;
        }
        this.buildPanel();
    }

    public loadPrevLevel()
    {
        this.level--;
        if (this.level < 0)
        {
            this.level = MahjongGame.kLevelCnt - 1;
        }
        this.buildPanel();
    }

    public onTouchPanel(touchInput: PosInput) {
        log(`TOUCH START : ##################################################################################################################################`);

        // log(`***** INFO BLOCKS START:
        //     ---- lenght : ${this._blocks.length}
        //     ---- obj: ${this._blocks}
        // `);

        let bTouched = false;
        let rect : Rect = new Rect();
        let checkThroughCnt = 0;
        //1. for all blocks and check pos inside blocks pos.
        for (let b = this._blocks.length - 1; b > 0; b --) {
            const block = this._blocks[b];

            // log(`------ 
            //          onTouchPanel block id : ${b}
            //         info block : ${block.getFloor()}_${block.getRow()}_${block.getCol()} 
            //         info block name: ${block.name}
            //         ---------
            //     `);

            if (block.getState() != BLSTATE.ST_NORMAL || block.isRmoved()) continue;
            let offsetX = OFFSET.x * block.getFloor();
            let offsetY = OFFSET.y * block.getFloor();
            let x = block.node.getPosition().x + offsetX;
            let y = block.node.getPosition().y + offsetY;
            let w = BSIZE.width;
            let h = BSIZE.height;
            rect.set(x, y, w, h);
            checkThroughCnt ++;

            if (rect.contains(touchInput as Vec2)) 
            {
                this.resetHint2Block();
                // play snd effect
                AudioManager.instance.playSound(constants.AUDIO_SOUND.MAHJONG_CLICK, false);
                //2. mark touch one.
                bTouched = true;
                if (this._focusIdx == -1) {
                    this._focusIdx = b;
                    block.setFocus(true);
                } 
                //3. if has mark already -> check new one
                else {
                    const fBlock = this._blocks[this._focusIdx];
                    if (this._focusIdx == b) { //deselect
                        this.removeSelectBlock();
                    }
                    //check fblock & current one
                    //4. if same type id => remove 2 blocks
                    else {
                        log(` ############## focus ${fBlock.getIdx()} AND currentBlock ${block.getIdx()}`);
                        if (fBlock.getIdx() == block.getIdx()) {
                            log(`********** MATCHING & DO REMOVE + UPDATE GAME STATUS`);

                            this.doMatchTwoBlock(fBlock, block);
                        }
                        else {
                            fBlock.setFocus(false);
                            block.setFocus(true);
                            this._focusIdx = b;
                        }
                    }
                }
                break;
            }
        }
        if (!bTouched && this._focusIdx != -1) {
            this._blocks[this._focusIdx].setFocus(false);
            this._focusIdx = -1;
        }
    }

    private removeSelectBlock() {
        if (this._focusIdx == -1) return;
        const fBlock = this._blocks[this._focusIdx];
        if (fBlock) { //deselect
            fBlock.setFocus(false);
            this._focusIdx = -1;
        }
    }

    private doMatchTwoBlock(fBlock: BlockSprite, block: BlockSprite) {
        
        // let one = utils.clone(fBlock.getInfo());
        // let two = utils.clone(block.getInfo());
        this._history.push({blockOne: fBlock, blockTwo: block});

        fBlock.setFocus(false);
        block.setFocus(false);

        // Do animation to remove
        this.doAnimationRemove2Blocks(fBlock, block);

        // Remove 2 objs from data list ..
        this._blocks = this._blocks.filter(item => item.name !== fBlock.name);
        this._blocks = this._blocks.filter(item => item.name !== block.name);

        this._historyLevel[fBlock.getFloor()][fBlock.getRow()][fBlock.getCol()] = 0;
        this._historyLevel[block.getFloor()][block.getRow()][block.getCol()] = 0;
        this.saveLevelHistory();

        // update debug hint
        this.hintFirstBlock = -1;
        this.hintSecondBlock = -1;
        // update status game
        this._focusIdx = -1;
        // update tile cnt
        this.updateTileCnt(this._blocks.length);
        // update Point
        this.setPoint(200);
        // arrage panel
        this.estimatePanel();
        // log(`***** INFO BLOCKS:
        //     ---- lenght : ${this._blocks.length}
        //     ---- obj: ${this._blocks}
        // `);
    }

    private doAnimationRemove2Blocks(fBlock: BlockSprite, block: BlockSprite) {
        let backupPosBlockOne = fBlock.node.position.clone();
        let backupPosBlockTwo = block.node.position.clone();
        let midPos2Block = (block.node.position.clone().add(fBlock.node.position.clone())).divide3f(2, 2, 1);
        let distance = midPos2Block.clone().subtract(fBlock.node.position).length();
        this.doAnimationBlockMove(fBlock, distance, midPos2Block, backupPosBlockOne);
        this.doAnimationBlockMove(block, distance, midPos2Block, backupPosBlockTwo, true);
    }

    private doAnimationBlockMove(block: BlockSprite, distance: number, midPos2Block: Vec3, backupPosBlock: Vec3, isPlayAnimSpark = false) {
        let self = this;
        TweenSystem.instance.ActionManager.removeAllActionsFromTarget(block.node);
        tween(block.node)
            .call(() => {
                block.node.parent = self.blockAnim;
            })
            .to(distance / 1000, { position: midPos2Block }, { easing: 'sineOut' })
            // .parallel(
            //     tween(block.node).to(distance / 1000, { position: new Vec3(midPos2Block.x, block.node.position.y, 0) }, { easing: 'sineOut' }),
            //     tween(block.node).to(distance / 1000, { position: new Vec3(block.node.position.x, midPos2Block.y, 0) }, { easing: 'sineOut' })
            // )
            .call(() => {
                log(`@@@@@@@@@@@ ############ moving done .....`);

                let hideBlock = () => {
                    block.node.parent = self.blockGroup;    
                    block.node.active = false;
                    block.node.setPosition(backupPosBlock);
                    block.setRemoved(true);
                }
                
                if (isPlayAnimSpark) {
                    let anim = self._sparkAnim.getComponent(Animation);
                    if (anim) {
                        self._sparkAnim.parent = block.node;
                        self._sparkAnim.setPosition(Vec3.ZERO);
                        self._sparkAnim.active = true;

                        anim.play();
                        anim.once(Animation.EventType.FINISHED, () => {
                            AudioManager.instance.playSound(constants.AUDIO_SOUND.MAHJONG_MATCH, false);
                            self._sparkAnim.active = false;
                            hideBlock();
                        }, self);
                    }
                    else {
                        hideBlock();    
                    }
                }
                else {
                    hideBlock();
                }

            })
            .start();
    }

    public setBlockStyle(style: STYLE) {
        this._style = style;
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.style, this._style);
    }

    public getBlockStyle(): STYLE {
        return this._style;
    }

    public getPoint(): number {
        return this._point;
    }

    public setPoint(value: number) {
        this._point += value;
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.point, this._point);
        this.updateUIPoint();
    }

    private updateUIPoint() {
        this.pointLabel.string = `${this._point}`;
    }

    public getTimeMode(): boolean{
        return this._isTimeMode;
    }

    public setTimeMode(isTimeMode: boolean) {
        this._isTimeMode = isTimeMode;
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.timeMode, this._isTimeMode);
        this.updateTimeUi();
    }

    public loadMhjGameData() {
        this._isTimeMode = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.timeMode) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.timeMode) : false;
        this._point = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.point) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.point) : 0;
        this._style = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.style) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.style) : 0;
        this._timeCountSecond = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.timeCount) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.timeCount) : 0;
        MahjongSingleton.historyCnt = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.historyCnt) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.historyCnt) : 0;
        this.level = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.level) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.level) : 0;
        MahjongSingleton.gPlayHistory = StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.historyPlay) ? StorageManager.instance.getGlobalData(MHJ_GAME_SAVE.historyPlay) : [];
    }

    public saveMhjData() {
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.timeMode, this._isTimeMode);
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.point, this._point);
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.style, this._style);
        StorageManager.instance.setGlobalData(MHJ_GAME_SAVE.timeCount, this._timeCountSecond);
        this.saveData(0,0);
    }

    public getTileCount(): number {
        if (this._blocks?.length) return this._blocks.length;
        return 0;
    }

    public undoGame(isPay = false, cb?: Function) {
        let undoGameSuccess = false;
        log(`action undo game ....`);

        if (this._history.length > 0) {
            let isPayOk = isPay && this._point >= MahjongSingleton.POINT_UNDO_STEP || !isPay;
            if (!isPayOk) 
            {
                // alert(`Not enough Point to UNDO...`);
                uiManager.instance.showDialog(PATH_UI.informationPopup, ["Oops","Not enough Point to UNDO..."]);
                return;
            }

            isPay && this.updatePoint(-MahjongSingleton.POINT_UNDO_STEP);

            let history = this._history.pop();
            let blockOne = history?.blockOne;
            let blockTwo = history?.blockTwo;
            if (blockOne == null || blockTwo == null) return;
            // log(`status:
            //     one: ${blockOne.floor}_${blockOne.col}_${blockOne.row}
            //     two: ${blockTwo.floor}_${blockTwo.col}_${blockTwo.row}
            // `);
            // this.createBlock(blockOne);
            // this.createBlock(blockTwo);
            blockOne.resetNormal();
            blockTwo.resetNormal();
            this._blocks.push(blockOne);
            this._blocks.push(blockTwo);
            
            this.BlockSortZOrder();
            this.estimatePanel();
            this.updateTileCnt(this._blocks.length);
            undoGameSuccess = true;
            cb && cb(undoGameSuccess);
        }

        
    }
}
