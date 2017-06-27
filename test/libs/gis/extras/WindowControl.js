/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a WindowControl.
* @module extras/WindowControl
*
* 
*/
define([

],
function(

) {
  return declare(null,
  /**  @lends module:extras/WindowControl */
  {

    /**
     * @constructs
     * @param {object} config
     */
    constructor: function(config) {

      this.name = config.name;
      this.platIp = config.platip;
      this.platPort = config.platPort;
      this.username = config.username;
      this.passwd = config.pwd;

      this.subscribe('/ocx/playrealvideo', this, "onPlayRealtimeVideoCallBack");
      this.subscribe('/ocx/imageframereceive', this, "onReceiveImageFrame");
      this.subscribe('/ocx/stoprealvideo', this, "onStopRealCloseVideo");

      this.ocxComm = null;
      this.hasInited = false;
      this.hasLogin = false;
      this.COUNT_WIN = 16;

      this.focusWin = null;
      this.lastSelectIndex = 1;
      this.voice = 5;
      this.isMaxShow = false;
      this.toBeMaxShow = false;
      this.isMaxShowHasChangeWin = false;

      this.stopGetInstantReplayProgress = false;

      this.nodeType = Gosun.ChannelTreePanel.nodeType;

      this.windowSplitNumArr = [1, 4, 6, 8, 9, 13, 16, 1000],
      this.nowWindowNum = 1;
      this.xSplit = 0;
      this.ySplit = 0;
      this.beforeMaxShowWindowNum = 0;

      this.windowNotVisableWithOcxPlaying = {};
      for (var i = 1; i <= this.COUNT_WIN; i++) {
        this.windowNotVisableWithOcxPlaying[i] = null;
      }

    },

    /**
     * @description createOcxPlayer
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {boolean} isSingle
     * 
     * @example
     * <caption>Usage of createOcxPlayer</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.createOcxPlayer(isSingle);
     * })
     * 
     *
     * @returns {*}
     */
    createOcxPlayer: function(isSingle) {
      var ocxPlayer = window.document.createElement("object");
      ocxPlayer.classid = "CLSID:455791d4-4095-4f70-b2b3-f5c424f25ad9";
      ocxPlayer.style.width = "100%";
      ocxPlayer.style.height = "100%";
      if (isSingle) {
        ocxComm = new OCXComm(ocxPlayer.id, ocxPlayer);
        return ocxComm;
      } else {
        ocxPlayer.id = "map_realtime_player";
        this.ocxComm = new OCXComm(ocxPlayer.id, ocxPlayer);
      }
    },

    /**
     * @description initParam
     * @method
     * @memberOf module:extras/WindowControl#
     * 
     * 
     * @example
     * <caption>Usage of initParam</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.initParam();
     * })
     * 
     *
     * 
     */
    initParam: function() {
      this.ocxComm.initPara(this.ocxComm.id);
    },

    /**
     * @description pollingOperateDynamic
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {number} szNodeIDArray
     * @param {string} pollingInterval
     * @param {boolean} nDispSplit
     * @param {boolean} nDispWndArray
     * 
     * @example
     * <caption>Usage of pollingOperateDynamic</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.pollingOperateDynamic(szNodeIDArray,pollingInterval,nDispSplit,nDispWndArray);
     * })
     * 
     *
     * @returns {*}
     */
    pollingOperateDynamic: function(szNodeIDArray, pollingInterval, nDispSplit, nDispWndArray) {
      if (this.ocxComm == null) {
        Gsui.Msg.alert("提示", "OCX对象尚未初始化");
      }
      nDispSplit = nDispSplit || 4;
      nDispWndArray = nDispWndArray || [1, 2, 3, 4];
      if (_app.currentUser.maxViews != -1 && _app.currentUser.maxViews < 4) {
        var array = [];
        for (var i = 0; i < _app.currentUser.maxViews; i++) {
          array.push(i + 1);
        }
        nDispWndArray = array;
      }
      pollingInterval = pollingInterval || 5;
      ret = this.ocxComm.pollingOperateDynamic(nDispSplit, nDispWndArray, szNodeIDArray, pollingInterval);

      return ret;
    },

    /**
     * @description stopPollingOperate
     * @method
     * @memberOf module:extras/WindowControl#
     * 
     * 
     * @example
     * <caption>Usage of stopPollingOperate</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.stopPollingOperate();
     * })
     * 
     *
     * @returns {*}
     */
    stopPollingOperate: function() {
      if (this.ocxComm == null) {
        Gsui.Msg.alert("提示", "OCX对象尚未初始化");
      }
      ret = this.ocxComm.pollingOperate(1, 0);

      return ret;
    },

    /**
     * @description playRealTimeVideo
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {string} szNodeId
     * @param {number} index
     * @param {boolean} isAlarm
     * @param {string} channelName
     * @param {string} detailInfo
     * @param {number} streamType
     * @param {string} facade
     * @param {number} controlType
     * 
     * @example
     * <caption>Usage of playRealTimeVideo</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.playRealTimeVideo(szNodeId,index,isAlarm,channelName,detailInfo,streamType,facade,controlType);
     * })
     * 
     *
     * @returns {*}
     */
    playRealTimeVideo: function(szNodeId, index, isAlarm, channelName, detailInfo, streamType, facade, controlType) {

      if (this.ocxComm == null) {
        Gsui.Msg.alert("提示", "OCX对象尚未初始化");
      }
      if (!this.hasLogin) {
        this.loginIntoPmsByFocusOcx(this.ocxComm);
      }
      var reqType = extras.VodWindow.requestType.manual;
      if (isAlarm) reqType = extras.VodWindow.requestType.alarm;
      ret = this.ocxComm.playRealVideo(szNodeId, streamType, index, reqType);
      if (ret.code != 0) {
        return ret.code;
      }
      return ret;
    },

    /**
     * @description onPlayRealtimeVideoCallBack
     * @method
     * @memberOf module:extras/WindowControl#
     * 
     * 
     * @example
     * <caption>Usage of onPlayRealtimeVideoCallBack</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.onPlayRealtimeVideoCallBack();
     * })
     * 
     *
     * 
     */
    onPlayRealtimeVideoCallBack: function() {
      if (params.code != 0) {
        if (params.code == 26) {
          Gsui.Msg.alert("提示", "您没有点流的权限！请与管理人员联系");
        } else {
          Gsui.Msg.alert("提示", "错误ID:" + params.code + ",错误原因：" + Gosun.getErrorInfoByCode(params.code));
        }
      }
    },

    /**
     * @description onReceiveImageFrame
     * @method
     * @memberOf module:extras/WindowControl#
     * 
     * 
     * @example
     * <caption>Usage of onReceiveImageFrame</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.onReceiveImageFrame();
     * })
     * 
     *
     * @returns {*}
     */
    onReceiveImageFrame: function() {
      if (params.code == 0) {
        var winInfo = this.getWindowInfoByIndex(params.data.nIndex);
        if (!winInfo.isBlank()) {

          if (winInfo.isPolling()) return false;
          this.publish("/windowchange/channelstartplaying", params.data.szNodeID);

          if (this.checkIndexIsFocus(params.data.nIndex)) {
            this.publish("/windowchange/onfocuswinchange", winInfo);
          }
          return true;
        }
      } else {
        Gsui.Msg.alert("提示", "错误ID:" + params.code + ",错误原因：" + Gosun.getErrorInfoByCode(params.code));
        return false;
      }
    },

    /**
     * @description initOcxPlayerParams
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {number} maxWinNum
     * 
     * @example
     * <caption>Usage of initOcxPlayerParams</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.initOcxPlayerParams(maxWinNum);
     * })
     * 
     *
     * 
     */
    initOcxPlayerParams: function(maxWinNum) {
      if (!this.hasLogin) {
        this.loginIntoPmsByFocusOcx(this.ocxComm);
      }

      this.ocxComm.initMonitorWnd(parseInt(this.nowWindowNum), maxWinNum);
      if (maxWinNum > 1) {
        this.ocxComm.setLiveWndStyle(0);
      } else {
        this.ocxComm.SetElcMapFlag(1);
      }

    },

    /**
     * @description loginIntoPmsByFocusOcx
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {number} ocxComm
     * 
     * @example
     * <caption>Usage of loginIntoPmsByFocusOcx</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.loginIntoPmsByFocusOcx(ocxComm);
     * })
     * 
     *
     * @returns {*}
     */
    loginIntoPmsByFocusOcx: function(ocxComm) {
      if (ocxComm == null) {
        Gsui.Msg.alert("警告", "页面OCX初始化失败！");
        return false;
      }
      var ret = ocxComm.login(this.platIp, this.platPort, this.username, this.passwd);
      if (ret.code != 0) {

        return false;
      }
      this.hasLogin = true;
    },

    /**
     * @description closeWin
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {number} index
     * @param {string} forceClose
     * @param {function} cb
     * @param {string} scope
     * @param {object} params
     * 
     * @example
     * <caption>Usage of closeWin</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.closeWin(index,forceClose,cb,scope,params);
     * })
     * 
     *
     * @returns {*}
     */
    closeWin: function(index, forceClose, cb, scope, params) {
      var windowInfo = this.getWindowInfoByIndex(index);
      if (forceClose) {
        this.closeWinImplement(windowInfo, cb, scope, params);
      } else {
        if (windowInfo.isPlaying()) {
          if (windowInfo.isLocalRecording()) {
            var msg = "窗口正在本地录像，是否确认关闭？";

            Gsui.Msg.confirm("警告", msg,
            function(flag) {
              if (flag == 'yes') {
                this.closeWinImplement(windowInfo, cb, scope, params);
              }
            },
            this);
            return false;
          }
        }
        this.closeWinImplement(windowInfo, cb, scope, params);
      }
    },

    /**
     * @description closeWinImplement
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {string} win
     * @param {function} cb
     * @param {string} scope
     * @param {object} params
     * 
     * @example
     * <caption>Usage of closeWinImplement</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.closeWinImplement(win,cb,scope,params);
     * })
     * 
     *
     * @returns {*}
     */
    closeWinImplement: function(win, cb, scope, params) {
      var szNodeId = win.szNodeId;
      if (win.isBlank() == true) {
        return false;
      }

      ret = this.ocxComm.closeRealVideo(win.index);

      if (win.isPlaying()) {
        this.winCloseAffectView(szNodeId, win.index);
      }

      if (cb) {
        if (scope) cb.call(scope, win.szNodeId, params);
        else cb.call(this, szNodeId, params);
      }
      return ret;
    },

    /**
     * @description winCloseAffectView
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {string} szNodeId
     * @param {number} index
     * 
     * @example
     * <caption>Usage of winCloseAffectView</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.winCloseAffectView(szNodeId,index);
     * })
     * 
     *
     * 
     */
    winCloseAffectView: function(szNodeId, index) {

      this.publish("/windowchange/closevideo", szNodeId);
      if (this.checkIndexIsFocus(index)) {
        var windowInfo = this.getWindowInfoByIndex(index);

        this.publish("/windowchange/onfocuswinchange", windowInfo);
      }
    },

    /**
     * @description onReceiveOcxCloseVideo
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {string} data
     * 
     * @example
     * <caption>Usage of onReceiveOcxCloseVideo</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.onReceiveOcxCloseVideo(data);
     * })
     * 
     *
     * 
     */
    onReceiveOcxCloseVideo: function(data) {
      this.winCloseAffectView(data.data.szNodeID, data.data.nIndex);
    },

    /**
     * @description onStopRealCloseVideo
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {string} data
     * 
     * @example
     * <caption>Usage of onStopRealCloseVideo</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.onStopRealCloseVideo(data);
     * })
     * 
     *
     * 
     */
    onStopRealCloseVideo: function(data) {

      var szNodeId = data.data.szNodeID;
      if (szNodeId) {
        this.publish("/windowchange/closevideo", szNodeId);
        this.publish("/ocxchange/closevideo", szNodeId);
      }
    },

    /**
     * @description checkIndexIsFocus
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {number} index
     * 
     * @example
     * <caption>Usage of checkIndexIsFocus</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.checkIndexIsFocus(index);
     * })
     * 
     *
     * @returns {*}
     */
    checkIndexIsFocus: function(index) {
      var focusWin = this.getFocusWin();
      if (index == focusWin.index) {
        return true;
      } else {
        return false;
      }
    },

    /**
     * @description getFocusWin
     * @method
     * @memberOf module:extras/WindowControl#
     * 
     * 
     * @example
     * <caption>Usage of getFocusWin</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.getFocusWin();
     * })
     * 
     *
     * @returns {*}
     */
    getFocusWin: function() {
      var index = 0;
      var vodWindow = this.getWindowInfoByIndex(index);
      return vodWindow;
    },

    /**
     * @description getWindowInfoByIndex
     * @method
     * @memberOf module:extras/WindowControl#
     * @param {number} index
     * 
     * @example
     * <caption>Usage of getWindowInfoByIndex</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.getWindowInfoByIndex(index);
     * })
     * 
     *
     * @returns {*}
     */
    getWindowInfoByIndex: function(index) {
      var vodWindow = null;
      var jsonObj = this.ocxComm.getLiveDispWndInfo(index).data;

      vodWindow = new VodWindow();
      vodWindow.index = jsonObj.nIndex;
      vodWindow.szNodeId = jsonObj.szNodeID;
      vodWindow.status = jsonObj.dispStatus;
      vodWindow.requestType = jsonObj.videoReqType;
      vodWindow.recordStatus = jsonObj.localRecord;

      return vodWindow;
    },

    /**
     * @description getOcxPlayer
     * @method
     * @memberOf module:extras/WindowControl#
     * 
     * 
     * @example
     * <caption>Usage of getOcxPlayer</caption>
     * require(['extras/WindowControl'],function(WindowControl){
     *   var instance = new WindowControl(config);
     *   instance.getOcxPlayer();
     * })
     * 
     *
     * @returns {*}
     */
    getOcxPlayer: function() {
      return this.ocxComm.ocxObj;
    }

  })
});