import { _decorator, Component, Node, native, sys, ValueType } from 'cc';
const { ccclass, property } = _decorator;

let className = "";
let nativeFuncName = "";

if (sys.isNative && sys.os == sys.OS.IOS) {
    className = "NativeEvent";
    nativeFuncName = "call_native:";
} else if (sys.isNative && sys.os == sys.OS.ANDROID) {
    nativeFuncName = "call_native";
    className = "org/cocos2dx/javascript/NativeEvent";
}

export enum NATIVE_KEY_MAP{
    // test
    KEY_TEST_CALL,
    KEY_TEST_CALL_ASYN,

    // device
    KEY_IS_NETWORK_AVAILABLE,
    KEY_GET_CURRENT_BATTERY_LEVEL,  // cc.sys.getBatteryLevel()
    KEY_GET_SYSTEM_VOLUME,
    KEY_IS_BATTERY_CHARGE,
    KEY_GET_WIFI_STENGTH,
    KEY_GET_PASTEBOARD_STRING,
    KEY_SET_PASTEBOARDSTRING,
    KEY_IS_PAD,
    KEY_GET_DEVICE_NAME,
    KEY_GET_DEVICE_MODE,
    KEY_GET_NETWORK_TYPE,   // cc.sys.getNetworkType()
    KEY_GET_DEVICE_UUID,
    KEY_IS_DEVICE_ROOT,
    KEY_GET_DEVICE_SYSTEM_VERSION,
    KEY_IS_SIMULATOR,
    KEY_GET_DEVICE_INO,
    KEY_MAC_ADDRESS,
    

    // location
    KEY_GET_LOCATION,
    KEY_HAVE_GPS,
    KEY_CHECK_NEAR,

    // tools
    KEY_TOAST_MESSAGE,
    KEY_JUMP_TO_UPDATE_SITE,
    KEY_OPEN_URL,
    KEY_GET_SYS_LANGUAGE,
    KEY_SAVE_TO_ABLM,
    KEY_IS_CONTAINS_EMOJI,
    KEY_REMOVE_ALL_EMOJIS,
    KEY_EMOJI_LIB_IS_EMOJI,
    KEY_EMOJI_LIB_REMOVE_ALL_EMOJIS,

    // 3rd
    KEY_CALL_WECHAT_PAY,    // todo: android only

    //ImagePicker
    KEY_OPEN_PHOTO,
    KEY_OPEN_CAMERA,
    KEY_SAVETO_PHOTO,
    //Shop
    KEY_CALL_OPEN_URL,

    //模竖屏
    KEY_CALL_CHANGEORIENTATION,

    //RECORD
    KEY_CALL_AUTH_MICPHONE,
    KEY_RECORD_START_RECORD, 
    KEY_RECORD_STOP_RECORD,
    KEY_RECORD_PLAY_RECORD, 
    KEY_RECORD_PLAY_LOCALFILE,
    KEY_RECORD_PLAY_ROOMFILE,
    KEY_RECORD_STOP_PLAY, 

    //IOS保存账号密码
    KEY_SAVE_USERNAME_INKEY,
    KEY_SAVE_PASSWORD_INKEY,
    KEY_GET_USERSUCC_INKEY,
    KEY_GET_USERNAME_INKEY,
    KEY_GET_PASSWORD_INKEY,

    KEY_IS_HAVE_GPS,
    KEY_IS_AUTHLOCATION,
    //震动
    KEY_VIBRATE,
    KEY_ERROR_DATA,
    KEY_CLEAR_ERROR_DATA,

    KEY_GETDEVICEMODEL,
    KEY_CALL_SCREEN_LIGHTING,

    KEY_EDIT_BOX_POS,
}

export class NativeEventCMD{
    public static METHOD_MAP = {
        // test
        [NATIVE_KEY_MAP.KEY_TEST_CALL]: {
            obj: "org.cocos2dx.javascript.NativeCallTest",
            method: "testCall",
            respMsgKey: "testCall"
        },
        [NATIVE_KEY_MAP.KEY_TEST_CALL_ASYN]: {
            obj: "org.cocos2dx.javascript.NativeCallTest",
            method: "testCallAsyn",
            respMsgKey: "testCallAsyn"
        },

        // device
        [NATIVE_KEY_MAP.KEY_IS_NETWORK_AVAILABLE]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "isNetworkAvailable",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_CURRENT_BATTERY_LEVEL]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getCurrentBatteryLevel",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_SYSTEM_VOLUME]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getSystemVolume",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_BATTERY_CHARGE]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "isBatteryCharge",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_WIFI_STENGTH]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getWifiStrength",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_PASTEBOARD_STRING]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getPasteboardString",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_SET_PASTEBOARDSTRING]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "setPasteboardString",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_PAD]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "isPad",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_DEVICE_NAME]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getDeviceName",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_DEVICE_MODE]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getDeviceMode",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_NETWORK_TYPE]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getNetworkType",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_DEVICE_UUID]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getDeviceUUID",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_DEVICE_ROOT]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "isDeviceRoot",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_DEVICE_SYSTEM_VERSION]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getDeviceSystemVersion",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_SIMULATOR]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "isSimulator",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_DEVICE_INO]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getDeviceInfo",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_MAC_ADDRESS]: {
            obj: "org.cocos2dx.javascript.DeviceMgr",
            method: "getMacAddr",
            respMsgKey: ""
        },
    
        // location
        [NATIVE_KEY_MAP.KEY_GET_LOCATION]: {
            obj: "org.cocos2dx.javascript.LocationMgr",
            method: "getLocation",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_HAVE_GPS]: {
            obj: "org.cocos2dx.javascript.LocationMgr",
            method: "haveGPS",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_CHECK_NEAR]: {
            obj: "org.cocos2dx.javascript.LocationMgr",
            method: "checkNear",
            respMsgKey: ""
        },

        // tools
        [NATIVE_KEY_MAP.KEY_TOAST_MESSAGE]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "toastMessage",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_JUMP_TO_UPDATE_SITE]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "jumpToUpdateSite",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_OPEN_URL]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "openUrl",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_SYS_LANGUAGE]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "getSysLanguage",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_SAVE_TO_ABLM]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "saveToAblm",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_CONTAINS_EMOJI]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "isContainsEmoji",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_REMOVE_ALL_EMOJIS]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "removeAllEmojis",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_EMOJI_LIB_IS_EMOJI]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "emojiLibIsEmoji",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_EMOJI_LIB_REMOVE_ALL_EMOJIS]: {
            obj: "org.cocos2dx.javascript.ToolsMgr",
            method: "emojiLibRemoveAllEmojis",
            respMsgKey: ""
        },

        [NATIVE_KEY_MAP.KEY_OPEN_PHOTO]: {
            obj: "org.cocos2dx.javascript.ImagePicker",
            method: "openPhoto",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_SAVETO_PHOTO]: {
            obj: "org.cocos2dx.javascript.ImagePicker",
            method: "saveTophoto",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_OPEN_CAMERA]: {
            obj: "org.cocos2dx.javascript.ImagePicker",
            method: "openCamera",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_CALL_OPEN_URL]: {
            obj: "org.cocos2dx.javascript.AppActivity",
            method: "openUrl",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_CALL_CHANGEORIENTATION]: {
            obj: "org.cocos2dx.javascript.AppActivity",
            method: "changeOrientation",
            respMsgKey: ""
        },

        [NATIVE_KEY_MAP.KEY_CALL_AUTH_MICPHONE]: {
            obj: "NativeEvent",
            method: "AuthMicPhone",
            respMsgKey: ""
        },

        [NATIVE_KEY_MAP.KEY_RECORD_START_RECORD]: {
            obj: "NativeEvent",
            method: "doStartRecord",
            respMsgKey: ""
        },

        [NATIVE_KEY_MAP.KEY_RECORD_STOP_RECORD]: {
            obj: "NativeEvent",
            method: "doStopRecord",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_RECORD_PLAY_RECORD]: {
            obj: "NativeEvent",
            method: "PlayRecord",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_RECORD_PLAY_ROOMFILE]: {
            obj: "NativeEvent",
            method: "PlayRoomVoice",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_RECORD_PLAY_LOCALFILE]: {
            obj: "NativeEvent",
            method: "PlayLocalVoice",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_RECORD_STOP_PLAY]: {
            obj: "NativeEvent",
            method: "StopPlay",
            respMsgKey: ""
        },

        //保存账号密码
        [NATIVE_KEY_MAP.KEY_SAVE_USERNAME_INKEY]: {   //保存用户名
            obj: "NativeEvent",
            method: "saveUsernameInKeychain",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_SAVE_PASSWORD_INKEY]: {  //保存密码
            obj: "NativeEvent",
            method: "savePasswordInKeychain",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_USERSUCC_INKEY]: {  // 获取保存密码账号是否成功
            obj: "NativeEvent",
            method: "getUseUsersuccInKeychain", 
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_USERNAME_INKEY]: {  //获取用户名
            obj: "NativeEvent",
            method: "getUsernameInKeychain",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GET_PASSWORD_INKEY]: {  //获取密码
            obj: "NativeEvent",
            method: "getUserPasswordInKeychain",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_HAVE_GPS]: {  //获取GPS
            obj: "NativeEvent",
            method: "haveGPS",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_IS_AUTHLOCATION]: {  //获取GPS
            obj: "NativeEvent",
            method: "AuthLocation",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_VIBRATE]: {  //震动
            obj: "NativeEvent",
            method: "Vibrate",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_ERROR_DATA]: {  //震动
            obj: "NativeEvent",
            method: "getErrorData",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_CLEAR_ERROR_DATA]: {  //震动
            obj: "NativeEvent",
            method: "clearErrorData",
            respMsgKey: ""
        },
        [NATIVE_KEY_MAP.KEY_GETDEVICEMODEL]: {  //获取设备信息
            obj: "NativeEvent",
            method: "getDeviceModel",
            respMsgKey: ""
        },

        [NATIVE_KEY_MAP.KEY_CALL_SCREEN_LIGHTING]: {
            obj: "NativeEvent",
            method: "Lighting",
            respMsgKey: ""
        },

        [NATIVE_KEY_MAP.KEY_EDIT_BOX_POS]: {
            obj: "NativeEvent",
            method: "setEditBoxPosYRatio",
            respMsgKey: ""
        },
        
    }
}

@ccclass('nativeEvent')
export class nativeEvent extends Component {
    
    private static instance: nativeEvent;

    public static getInstance(): nativeEvent {
        if (!this.instance) {
            this.instance = new nativeEvent();
        }
        return this.instance;
    }

    private callNativeEvent(method: any, param: any, isSync: boolean): string {
        let strParam = JSON.stringify(param);
        let argObj = {
            param: strParam,
            isSync: isSync ? 1 : 0,
            method: method
        }
        let jsonParam = JSON.stringify(argObj);

        let ret = "";
        if (sys.os == sys.OS.IOS) {
            ret = native.reflection.callStaticMethod(className, nativeFuncName, jsonParam);
        } else if (sys.os == sys.OS.ANDROID) {
            console.log(`callNativeEvent for @@@@ android ::::: => Will implement later ......`);
            
            // let sig = "(Ljava/lang/String;)Ljava/lang/String;";
            // ret = native.reflection.callStaticMethod(className, nativeFuncName, sig, jsonParam);
        }
        //console.log("callNativeEvent:" + ret);
        return ret;
    }

    public showRateGame(): string{
        return this.invokeAsynFunc("showReview");
    }

    public isEnableShowReviewPopupStartGame(): boolean {
        return this.invokeAsynFunc("isEnableShowReviewPopupStartGame") == "1" ? true : false;
    }

    public isEnableReviewPopupWhenCompleteGame(): boolean {
        return this.invokeAsynFunc("isEnableShowReviewPopupCompleteGame") == "1" ? true : false;
    }

    public shareWithFriend(): string {
        return this.invokeAsynFunc("shareWithFriend");
    }

    showMoreGame() {
        return this.showAdsInterestial();
    }

    showAdsInterestial() {
        return this.invokeAsynFunc("showAdsInterestial");
    }

    screenTrack(level: number) {
        return this.invokeAsynFunc("screenTrack", {level: level});
    }

    setupAdsBanner() {
        return this.invokeAsynFunc("setupAdBanner");
    }

    showAdsBanner() {
        return this.invokeAsynFunc("showAdBanner");
    }

    hideAdsBanner() {
        return this.invokeAsynFunc("hideAdBanner");
    }

    
    private invoke(method: string, param: any = {}, isSync: boolean): string {
        if (sys.isNative && (sys.os == sys.OS.ANDROID || sys.os == sys.OS.IOS)) {
            return this.callNativeEvent(method, param, isSync);
        } else {
            console.log(`Not Implement on simu ... call method : ${method}`);
            return "";
            // return this.callSimulatorEvent(nativeKey, respMsgKey);
        }
    }

    private callSimulatorEvent(nativeKey: any, respMsgKey: any): string {
        return "";
    }

    // Android下: 在gl线程调用原生函数
    public invokeSyncFunc(nativeKey: string, param: any = {}): string {
        return this.invoke(nativeKey, param, true);
    }

    // Android下: 在UI线程调用原生函数，此时返回值没有意义
    public invokeAsynFunc(nativeKey: string, param: any = {}): string {
        return this.invoke(nativeKey, param, false);
    }

    public getDeviceAgent(): string {
        let deviceAgent: string = "";
        if (sys.isBrowser) {
            deviceAgent = window.navigator.userAgent;
        }
        return deviceAgent;
    }

    public IsPad(): boolean {
        if (sys.isNative && (sys.os == sys.OS.ANDROID || sys.os == sys.OS.IOS)) {
            return this.invokeSyncFunc("getIpad") == "true";
        }
        else {
            return false;
        }
    }
}

