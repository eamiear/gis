/**
 * Created by K on 2017/6/6.
 */
const path = require('path');
const fs = require('fs');

/* 代码结构 */
const getClassStructure = (comments,requireMoudlePaths,requireMoudleClass,dependency,moduleName,methods) => {
  return `
${comments}
define([
  ${requireMoudlePaths}
], function (
   ${requireMoudleClass}
) {
  return declare(${dependency}, /**  @lends module:${moduleName} */{
     ${methods}
  })
});
`;
};

/* 文件描述 */
const createFileOverviewDescription = (className,modulePath,requirePath) => {
  let comments = `
/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a ${className}.
* @module ${modulePath}
*
* ${requirePath}
*/`;
  return comments;
};

const createParam = (type,name,index) => {
  return index == 0 ? `@param {${type}} ${name}` : `\n     * @param {${type}} ${name}`;
};

/* 构造函数 */
const createConstructor = (params,options,constructorBody) => {
  return `
    /**
     * @constructs
     * ${params}
     */
    constructor: function (${options}) {
      ${constructorBody}
    },
  `;
};

/* 方法*/
const createMethod = (description,moduleName,params,returns,method,methodName) => {
  return `
    /**
     * @description ${description}
     * @method
     * @memberOf module:${moduleName}#
     * ${params}
     * @example
     * <caption>Usage of ${methodName}</caption>
     *
     * ${returns}
     */
    ${method}
  `;
};

const createReturn = (returns)=>{
  return returns ? `@returns ${returns}` : '';
};

/* 属性 */
const createAttributes = (moduleName,attribute) => {
  let attrs = null;
  attrs = `
  /** @member ${moduleName} */${attribute},
  `;
  return attrs;
};

const getMethodBody = (method,boundaryStart,boundaryEnd)=>{
  let slices;
  if(boundaryEnd){
    slices = method.slice(method.indexOf(boundaryStart),method.indexOf(boundaryEnd));
  }else{
    slices = method.slice(method.indexOf(boundaryStart));
  }
  return slices;
};

const getParamsFromMethod = (method,boundaryStart,boundaryEnd)=>{
  const methodBody = getMethodBody(method,boundaryStart,boundaryEnd);
  let params = methodBody.match(/\:\s*\w+\((.*?)\)/)[1];
  //console.log(methodBody.match(/\:\s*\w+\((.*?)\)/)[1]);
  return params = params ? params : '';

};

const getMethodBodyFromMethod = (method,boundaryStart,boundaryEnd)=>{
  const methodBody = getMethodBody(method,boundaryStart,boundaryEnd);
  //console.log(boundaryStart);
  //console.log(methodBody);
 // return boundaryEnd ? methodBody.slice(methodBody.indexOf('{')+1) : methodBody;
  return methodBody;
};

const createMoudle = (data) => {
  const mouduleStr = data.slice(data.indexOf('dojo'),data.indexOf(";"));
  const moduleName = /\"(.+?)\"/.exec(mouduleStr)[1].replace(/\./g,'/');
  //console.log(RegExp.$1);
  return moduleName;
};

const cleanComments = (data)=>{
  //var test = `
	///**
	// * 属性查询
	// * @param {Object} id	工程图层ID
	// * @param {Object} where	属性条件
	// * @param {Object} sussFunction		成功返回调用函数，以字符串格式返回数据
	// * @param {Object} errorFunction	失败返回调用函数,返回错误信息
	// */
	// dsfallglla
  //
	// /**
	// dsdfs
	// */
  //`
  //console.log(test.match(/\/\*(\s|.)*?\*\//g));
  //console.log(test.replace(/\/\*(\s|.)*?\*\//g,''))

  //var t = '的 //dsfallglla'
  //console.log(t.replace(/\/\/(\s|\w*|.*?)/,''))
  return data.replace(/\/\*(\s|.)*?\*\//g,'').replace(/\/\/(\s|\w*|.*?)/,'');
};

const createDefineHeader = (data) => {
  const mouduleStr = data.slice(data.indexOf('dojo.require'),data.indexOf("dojo.declare"));
  const requireModule = mouduleStr.match(/\"(.+?)\"/g);

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerQuery.
 * @module extras/controls/LayerQuery
 *
 * @requires dojo/_base/declare
 * @requires dojo/_base/Deferred
 * @requires esri/graphic
 * @requires esri/layers/GraphicsLayer
 * @requires esri/geometry/Point
 * @requires esri/symbols/PictureMarkerSymbol
 * @requires esri/symbols/SimpleLineSymbol
 * @requires esri/symbols/SimpleFillSymbol
 * @requires esri/geometry/webMercatorUtils
 */
  const moduleClassPath = createMoudle(data);
  let requirePath = requireModule.map((item,index) => {
    const path = item.replace(/\"/g, '');
    return `\n* @requires ${path} `;
  });
  requirePath = requirePath.toString().replace(/\,/g,'');
  const comments = createFileOverviewDescription(moduleClassPath.slice(moduleClassPath.lastIndexOf('/')+1),moduleClassPath,requirePath);

  /*
  * [
   "dojo/_base/declare",
   "dojo/_base/Deferred",
   "esri/graphic",
   "esri/layers/GraphicsLayer",
   "esri/geometry/Point",
   "esri/symbols/PictureMarkerSymbol",
   "esri/symbols/SimpleLineSymbol",
   "esri/symbols/SimpleFillSymbol",
   "esri/geometry/webMercatorUtils"
   ]
  **/
  const requireMoudlePaths = requireModule.toString().replace(/\,/g,',\n  ').replace(/\./g,'/');

  /*
  * (
   declare,
   Deferred,
   Graphic,
   GraphicsLayer,
   Point,
   PictureMarkerSymbol,
   SimpleLineSymbol,
   SimpleFillSymbol,
   webMercatorUtils
   )
  */
  const requireMoudleClass = requireModule.toString().match(/([A-Za-z]\w+)\"/g).toString().replace(/\"/g,'').replace(/,/g,',\n  ');

  const classBody = data.slice(data.indexOf('dojo.declare'),data.lastIndexOf("});"));
  const dependencyStr = classBody.match(/(.+?\,)+/)[1].replace(',','');
  /*
   * declare([],
   */
  const dependency = dependencyStr == 'null' ? '[]' : dependencyStr;

  const methodBody = classBody.slice((classBody.indexOf(dependencyStr) + dependencyStr.length + 2));

  /*
  *  layerQueryLayer:null,
     coords: null,
     screenCoords: null,
     _frameIndex: 0,
     _framesAdvancing: true,
     _interval: null,
  * */
  const attributes = methodBody.slice(0,methodBody.indexOf('constructor')).split(',');
  let atrributesFormatStr = attributes.map((item,index) => {
    if(item){
      return createAttributes(moduleClassPath,item);
    }
  });
  atrributesFormatStr.pop();

    //console.log(atrributesFormatStr.pop())

  const constructorBoundary = methodBody.match(/(\w+[\s]*\:)+[\s]*function/g);
  const constructorMethod = methodBody.slice(methodBody.indexOf(constructorBoundary[0]),methodBody.indexOf(constructorBoundary[1]));
  let constructorParams = constructorMethod.match(/\:\s*\w+\((.*?)\)/)[1];
  constructorParams = constructorParams ? constructorParams : '';
  const constructorMethodBody = constructorMethod.slice(constructorMethod.indexOf('{')+1,constructorMethod.lastIndexOf('},'));

  /*
  * * @param {Object} id	工程图层ID
   * @param {Object} where	属性条件
  * */
  const paramsFormat = constructorParams.split(',').map((item,index) => {
    if(item){
      return createParam(typeof item,item,index);
    }
  });

  //console.log(paramsFormat.join(''));
  //console.log(atrributesFormatStr.join(''));
  // atrributes + constructor + method

  const constructorFormat = createConstructor(paramsFormat.join(''),constructorParams,constructorMethodBody);
  //console.log(constructorMethodBody);
  //console.log(methodBody.slice(methodBody.indexOf('constructor')));
  let methodsBodyStr = atrributesFormatStr.join('') + constructorFormat;

  const methodsSubBody = methodBody.slice(methodBody.indexOf(constructorBoundary[1]));
  const methodsSubBodyBoundary = methodsSubBody.match(/(\w+[\s]*\:)+[\s]*function/g);
  let methodSubBodyStr = [];
  //console.log(methodsSubBodyBoundary);

  methodsSubBodyBoundary.forEach((item,index)=>{
    let methodsSubParam;
    let methods;
    if(index != methodsSubBodyBoundary.length-1){
      methodsSubParam = getParamsFromMethod(methodsSubBody,item,methodsSubBodyBoundary[index+1]);
      methods = getMethodBodyFromMethod(methodsSubBody,item,methodsSubBodyBoundary[index+1]);
    }else{
      methodsSubParam = getParamsFromMethod(methodsSubBody,item);
      methods = getMethodBodyFromMethod(methodsSubBody,item);
    }
    const paramsFormat = methodsSubParam.split(',').map((it,i) => {
      if(it){
        return createParam(typeof it,it,i);
      }
    }).join('');

    const methodName = item.slice(0,item.indexOf(':')).trim();
    let returnType = '';
    if(methods.indexOf('return') != -1){
      let returns = methods.slice(methods.indexOf('return') + 'return'.length).split(';')[0];
      //var t = ' (d ) ';
      //console.log(t.match(/\s\((\s|\w*)*\)/g));
      const strings = returns.match(/\s\((\s|\w*)*\)/g);
      //var t = `
      //  {
      //    dsfsfd
      //  }
      //`;
      console.log(returns)
      const objects = returns.match(/\{.*\}/g);
      //console.log(objects)
      if(strings && strings[0]){
        returnType = createReturn('string');
      }else if(objects){

      }
    }
    //console.log(returnType)
    const methodItem = createMethod('',moduleClassPath,paramsFormat,returnType,methods,methodName);



    methodSubBodyStr.push(methodItem);
  });
  methodsBodyStr += methodSubBodyStr.join('');
  //console.log(methodSubBodyStr.join(''));
  const st = getClassStructure(comments,requireMoudlePaths,requireMoudleClass,dependency,moduleClassPath,methodsBodyStr);
  return st;
};

const generate = (path,out,fileReg) => {
  const files = fs.readdirSync(path);
  files.forEach((item) => {
    if(fileReg.test(item)){
      const filepath = path + '/' + item;
      const outputPath = out + '/' + item;
      let data = fs.readFileSync(filepath,'utf-8');
      data = cleanComments(data);
      fs.writeFile(outputPath,createDefineHeader(data),(err) => {
        err ? console.log('convert fail: ' + err) : console.log(item + ' convert success!')
      })
    }
  })
};
generate(path.resolve(__dirname, 'convert/src'),path.resolve(__dirname, 'convert/dist'), /\.js/);
