/**
 * @description 结构OCX控件
 * @author skz
 * @date 2016/3/29.
 */

/**
 * @class
 * @classdesc OCX工具类
 * @description OCX工具类
 * @type {Object}
 */
var OCXUtils = {};
/**
 * @description 构建原型中间件
 *      构建中间件的目的是避免通过组合方式实现继承时，两次实例化父级对象(构造函数，prototype),浪费空间
 *      构建一个空的中间件构造函数,分配的内存占据很少
 * @type {function}
 * @param {Object} parent    继承的父级对象
 * @returns {ProtoMiddleWare}  中间件实例对象,继承{@param parent}
 */
OCXUtils.createProtoMiddleWare = function(parent){
    function ProtoMiddleWare(){}
    ProtoMiddleWare.prototype = parent.prototype;
    ProtoMiddleWare.prototype.constructor = ProtoMiddleWare;
    return new ProtoMiddleWare();
};
/**
 * @description     继承方法
 * @param {Object} child     继承子类
 * @param {Object} parent    继承父类
 * @type {function}
 */
OCXUtils.extends = function(child,parent){
    child.prototype = this.createProtoMiddleWare(parent);
    child.prototype.constructor = child;
};

/**
 * @description 结构化OCX类
 * @param {object} ocxObj   OCX控件对象
 * @constructor
 */
function OCXComm(ocxObj){
	/** @member {Object} */
    this.ocxObj = ocxObj;
}
/**
 * @description 当前窗口数
 * @type {number}
 */
OCXComm.prototype.currentViews = 4;
/**
 * @param {Object} ocxObj
 * @description 设置ocxObj对象
 */
OCXComm.prototype.setOcxObj = function(ocxObj){
    this.ocxObj = ocxObj;
};
/**
 * @description 判断是否为IE浏览器
 * @returns {boolean}
 */
OCXComm.prototype.isIE = function(){
    if(!!window.ActiveXObject || "ActiveXObject" in window) {
        return true;
    }else{
        return false;
    }
};
/**
 * @description 生成OCX参数
 * @param {String} action     操作行为
 * @param {Object} [params]   参数
 * @returns {Object}          JSON数据
 */
OCXComm.prototype.generateOcxParamJson = function(action,params){
    var data = {},paramJson;
    if(!action){
        throw new Error("参数错误，请确认参数传递正确！");
    }
    data.action = action;
    data.arguments = params || {};
    return JSON.stringify(data);
};
/**
 * @description 注册控件消息回调函数，用于控件消息回调给web
 * @type inte
 * @param{function} callbackFunc    回调函数
 */
OCXComm.prototype.registerCallback = function(callbackFunc){};
/**
 * @description 系统相关调度接口
 * @param {object} paramJson    generateOcxParamJson生成的参数
 */
OCXComm.prototype.sysFunc = function(paramJson){};
/**
 * @description 初始化控件,全局初始化一次
 * @returns {Object}
 *  data.code = 0,成功;其他，错误;
 *  data.action="Init"
 */
OCXComm.prototype.init = function(){
    var paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    paramJson = this.generateOcxParamJson("Init");
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 反初始化控件
 * @returns {Object}
 *   data.code = {number} 0,成功;其他，错误;
 *   data.action="UnInit"
 */
OCXComm.prototype.unInit = function(){
    var paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    paramJson = this.generateOcxParamJson("UnInit");
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 获取控件版本
 * @returns {Object}
 *     data.code = {number} 0,成功;其他，错误;
 *     data.action="GetVersion";
 *     data.version = 1.0.0.1 版本号
 */
OCXComm.prototype.getVersion = function(){
    var paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    paramJson = this.generateOcxParamJson("GetVersion");
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 实时图片显示相关处理接口，包括实时图片窗口处理、打开和关闭实时图片浏览等
 * @param {String} paramJson    generateOcxParamJson生成的json数据
 */
OCXComm.prototype.sysFuncVideo = function(paramJson){};
/**
 * @description 切换实时图片显示分屏
 * @param {Integer} splitNum    分配数[-1,0,1,4,6,8,9,13,16,1000]==>[退出全屏,全屏,单屏....]
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="ChangeViewSplit"
 */
OCXComm.prototype.changeViewSplit = function(splitNum){
    var params = {},paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    params.nDispSplit = parseInt(splitNum);
    paramJson = this.generateOcxParamJson("ChangeViewSplit",params);
    ret = this.sysFuncVideo(paramJson);
    return ret;
};
/**
 * @description 退出全屏
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.exitFullScreen = function(){
    return this.changeViewSplit(-1);
};
/**
 * @description 全屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewFullScreen = function(){
    return this.changeViewSplit(0);
};
/**
 * @description 单屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewSingleScreen = function(){
	this.currentViews = 1;
    return this.changeViewSplit(1);
};
/**
 * @description 四屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewFourScreen = function(){
	this.currentViews = 4;
    return this.changeViewSplit(4);
};
/**
 * @description 六屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewSixScreen = function(){
	this.currentViews = 6;
    return this.changeViewSplit(6);
};
/**
 * @description 八屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewEightScreen = function(){
	this.currentViews = 8;
    return this.changeViewSplit(8);
};
/**
 * @description 九屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewNightScreen = function(){
	this.currentViews = 9;
    return this.changeViewSplit(9);
};
/**
 * @description 十三屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewThirteenScreen = function(){
	this.currentViews = 13;
    return this.changeViewSplit(13);
};
/**
 * @description 十六屏查看
 * @see {@link changeViewSplit}
 * @returns {Object}
 */
OCXComm.prototype.viewSixteenScreen = function(){
	this.currentViews = 16;
    return this.changeViewSplit(16);
};
/**
 * @description 结构化控件
 * @alias SOCXComm
 ----------------------------------------------------------*/
/**
 * @description 结构化控件
 * @param ocxObj    ocxObj对象
 * @constructor
 * @extends OCXComm
 * @see {@link OCXComm}
 */
function SOCXComm(ocxObj){
    /**
     * @description 传递值给父类,此处OCXComm仅初始化一次
     */
    OCXComm.call(this,ocxObj);
}
/**
 * @readonly
 * @description SOCXComm继承OCXComm
 */
OCXUtils.extends(SOCXComm,OCXComm);
/**
 * @description 注册控件消息回调函数，用于控件消息回调给web
 * @override 复写父类的系统回调函数
 * @see {@link OCXComm#registerCallback}
 * @param{function} callbackFunc    回调函数
 */
SOCXComm.prototype.registerCallback = function(callbackFunc){
    this.ocxObj.GS_CPGRegJsFunctionCallback(callbackFunc);
};
/**
 * @description 系统相关调度接口，主要是控件初始化、反初始化、服务登录登出等
 * @override 复写父类的系统函数
 * @see {@link OCXComm#sysFunc}
 * @param {object} paramJson    generateOcxParamJson生成的参数
 */
SOCXComm.prototype.sysFunc = function(paramJson){
    var result;
    if(!this.isIE()) return;
    try{
        result = this.ocxObj.GS_CPGSysFunc(paramJson);
        result = JSON.parse(result);
    }catch (e){
        throw new Error("sysFunc Error! "+e,result);
    }
    return result;
};
/**
 * @description 登录卡口网关服务
 * @example <caption>Example usage of <b>loginCPG</b>.</caption>
 *  var params = {};
 *      params.szServerIP = "192.168.15.38";
 *      params.nPort = 13320;
 *      params.szUser = "admin";
 *      params.szPassword = "admin";
 *
 *      // Login method
 *      loginCPG(params);
 * @param {Object} params
 * @param {String} params.szServerIP    服务IP
 * @param {Integer} params.nPort        服务端口
 * @param {String} params.szUser        用户名
 * @param {String} params.szPassword    密码
 * @returns {Object}
 *      data.code = {number} 0,成功;其他，错误;
 *      data.action="LoginCPG"
 */
SOCXComm.prototype.loginCPG = function(params){
    var paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    paramJson = this.generateOcxParamJson("LoginCPG",params);
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 登出卡口网关服务
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="LogoutCPG"
 */
SOCXComm.prototype.logoutCPG = function(){
    var paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    paramJson = this.generateOcxParamJson("LogoutCPG");
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 判断IP地址是否已为信任站点
 * @example <caption>Example usage of <b>isTrustSite</b>.</caption>
 *  var szIP = "192.168.16.95";
 *      isTrustSite(szIP);
 * @param {String} szIP     服务IP
 * @returns {Object}
 *   data.code = {number} 0,成功;其他，错误;
 *   data.action="IsTrustSite"
 */
SOCXComm.prototype.isTrustSite = function(szIP){
    var params = {},paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    params.szIP = szIP;
    paramJson = this.generateOcxParamJson("IsTrustSite",params);
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 设置信任站点
 * @example <caption>Example usage of <b>isTrustSite</b>.</caption>
 *  var szIP = "192.168.16.95";
 *      setTrustSite(szIP);
 * @param {String} szIP     服务IP
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="SetTrustSite"
 */
SOCXComm.prototype.setTrustSite = function(szIP){
    var params = {},paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    params.szIP = szIP;
    paramJson = this.generateOcxParamJson("SetTrustSite",params);
    ret = this.sysFunc(paramJson);
    return ret;
};
/**
 * @description 播放器播放调度函数
 ------------------------------------------------------------*/
/**
 * @description 实时图片显示相关处理接口，包括实时图片窗口处理、打开和关闭实时图片浏览等
 * @param {String} paramJson
 * @see{@link OCXComm#generateOcxParamJson}生成的json数据
 */
SOCXComm.prototype.sysFuncVideo = function(paramJson){
    var result;
    if(!this.isIE()) return;
    try{
        result = this.ocxObj.GS_CPGLivePicPlayFunc(paramJson);
        result = JSON.parse(result);
    }catch (e){
        throw new Error("sysFuncVideo Error!"+e,result);
    }
    return result;
};
/**
 * @description 实时图片显示窗口初始化
 * @example <caption>Example usage of <b>initLivePicPlayWnd</b>.</caption>
 *  var strOcxID = "RealPicPlay";
 *      eOcxType = 5;
 *      initLivePicPlayWnd(strOcxID,eOcxType);
 * @param {String} strOcxID    自定义ID
 * @param {Integer} eOcxType  目前设置为 5
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="InitLivePicPlayWnd"
 */
SOCXComm.prototype.initLivePicPlayWnd = function(strOcxID,eOcxType){
    var params = {},paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    params.strOcxID = strOcxID;
    params.eOcxType = parseInt(eOcxType) || 5;
    paramJson = this.generateOcxParamJson("InitLivePicPlayWnd",params);
    ret = this.sysFuncVideo(paramJson);
    return ret;
};
/**
 * @description 实时图片显示窗口初始化
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="DeleteView"
 */
SOCXComm.prototype.unInitLivePicPlayWnd = function(){
    var paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    paramJson = this.generateOcxParamJson("DeleteView");
    ret = this.sysFuncVideo(paramJson);
    return ret;
};
/**
 *@description 打开实时图片显示
 * @example <caption>Example usage of <b>openLivePic</b>.</caption>
 *  var nWndNo = 1;
 *      nChlID = 4;
 *      openLivePic(nWndNo,nChlID);
 * @param {Integer} nWndNo    图片显示窗口号
 * @param {Integer} nChlID   显示的通道ID
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="OpenLivePic"
 */
SOCXComm.prototype.openLivePic = function(nWndNo,nChlID){
    var params = {},paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    params.nWndNo = parseInt(nWndNo);
    params.nChlID = parseInt(nChlID);
    paramJson = this.generateOcxParamJson("OpenLivePic",params);
    ret = this.sysFuncVideo(paramJson);
    return ret;
};
/**
 * @description 关闭实时图片显示
 * @example <caption>Example usage of <b>closeLivePic</b>.</caption>
 *  var nWndNo = 1;
 *      closeLivePic(nWndNo);
 * @param {Integer} nWndNo   图片显示窗口号
 * @returns {Object}
 *  data.code = {number} 0,成功;其他，错误;
 *  data.action="CloseLivePic"
 */
SOCXComm.prototype.closeLivePic = function(nWndNo){
    var params = {},paramJson,ret;
    if(!this.ocxObj){
        throw new Error("OCX对象尚未初始化");
    }
    params.nWndNo = parseInt(nWndNo);
    paramJson = this.generateOcxParamJson("CloseLivePic",params);
    ret = this.sysFuncVideo(paramJson);
    return ret;
};
/**
 * @description 结构化播放器
 * @alias SPlayer
 ----------------------------------------------------------*/
/**
 * @class
 * @classdesc 播放器工具类
 * @type {Object}
 */
var PlayerUtils = {};
/**
 * @description 构建播放器DOM对象
 * @param {String} id
 * @param {String} classId
 * @returns {HTMLElement}
 */
PlayerUtils.createPlayerDom = function(id,classId){
    var $playerDom = window.document.createElement("object");
    $playerDom.style.width = "100%";
    $playerDom.style.height = "100%";
    $playerDom.classid = classId;
    $playerDom.id = id;
    $playerDom.appendChild(this.createObjParam("wmode","transparent"));
    return $playerDom;
};
/**
 * @description 构建播放器Object DOM对象的Param参数
 * @param {String} key      参数key
 * @param {String} value    参数值
 * @returns {HTMLElement}
 */
PlayerUtils.createObjParam = function(key,value){
    var $param = document.createElement("param");
    $param.name = key;
    $param.value = value;
    return $param;
};
 /**
 * @description 结构化播放器
 * @param {String} id       播放器唯一标识,自定义
 * @param {String} target   DOM元素选择器, 构建的播放器将放在target元素内
 * @param {String} classId  与ocx建立通信的标识id ,由ocx开发方提供
 * @constructor
 * @entends SOCXComm    @see {@link SOCXComm}
 */
function SPlayer(id,target,classId){
	/** @member {String} */
    this.id = id;
    /** @member {String} */
    this.target = target;
    /** @member {String} */
    this.classId = classId;
    /** @member {Object} */
    this.ocxDom = PlayerUtils.createPlayerDom(this.id,this.classId);
    /**
     * @description 传递值给父类,此处SOCXComm仅初始化一次
     */
    SOCXComm.call(this,this.ocxDom);
}
/**
 * @readonly
 * @description SPlayer继承SOCXComm
 */
OCXUtils.extends(SPlayer,SOCXComm);
/**
 * @description 是否初始化控件/控件是否可用
 * @type {boolean}
 */
SPlayer.prototype.hasOcx = false;
/**
 * @description 结构化OCX类型
 * @constant
 * @type {number}
 */
SPlayer.prototype.EOCXTYPE = 5;
/**
 * @todo 搞清楚初始化流程
 * @description 启动，加载控件
 * @type {function}
 */
SPlayer.prototype.launch = function(){
    if(!this.ocxDom) {
        throw new Error("Create DOM Error！ --->OCX Object 标签创建失败！");
    }
    try{
        $(this.target).prepend(this.ocxObj);
        this.hasOcx = true;
        this.init();
        this.initLivePicPlayWnd(this.id,this.EOCXTYPE);
    }catch (e){
        this.hasOcx = false;
        throw new Error("Launch Error!---> 加载控件失败" + e);
    }
};
/**
 * @description 关闭所有窗口
 * @type {function}
 */
SPlayer.prototype.closeAllLivePic = function(){
	var i;
	for (i = this.currentViews; i >= 1; i--) {
		this.closeLivePic(i);
	}
}

/**
 * @TODO 人数统计
 * @description 人数统计控件
 * @alias PCSOCXComm
 ----------------------------------------------------------*/
/**
 * @description 人数统计控件
 * @param ocxObj    ocxObj对象
 * @constructor
 * @extends OCXComm
 * @see {@link OCXComm}
 */
function PCSOCXComm(ocxObj){
    /**
     * @description 传递值给父类,此处OCXComm仅初始化一次
     */
    OCXComm.call(this,ocxObj);
}
/**
 * @readonly
 * @description PCSOCXComm继承OCXComm
 */
OCXUtils.extends(PCSOCXComm,OCXComm);
/**
 * @description 注册控件消息回调函数，用于控件消息回调给web
 * @override 复写父类的系统回调函数
 * @see {@link OCXComm#registerCallback}
 * @param{function} callbackFunc    回调函数
 */
PCSOCXComm.prototype.registerCallback = function(callbackFunc){
    this.ocxObj.GS_GFaceRegJsFunctionCallback(callbackFunc);
};
/**
 * @description 系统相关调度接口，主要是控件初始化、反初始化、服务登录登出等
 * @override 复写父类的系统函数
 * @see {@link OCXComm#sysFunc}
 * @param {object} paramJson    generateOcxParamJson生成的参数
 */
PCSOCXComm.prototype.sysFunc = function(paramJson){
    var result;
    if(!this.isIE()) return;
    try{
        result = this.ocxObj.GS_GFaceSysFun(paramJson);
        result = JSON.parse(result);
    }catch (e){
        throw new Error("sysFunc Error! ---> 系统调度接口操作失败 "+result);
    }
    return result;
};
/**
 * @description 实时图片显示相关处理接口，包括实时图片窗口处理、打开和关闭实时图片浏览等
 * @param {String} paramJson
 * @see{@link OCXComm#generateOcxParamJson}生成的json数据
 */
PCSOCXComm.prototype.sysFuncVideo = function(paramJson){
    var result;
    if(!this.isIE()) return;
    try{
        result = this.ocxObj.GS_GFacePlayVideoFun(paramJson);
        result = JSON.parse(result);
    }catch (e){
        throw new Error(e,result);
    }
    return result;
};