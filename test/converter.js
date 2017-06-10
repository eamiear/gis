/**
 * Created by K on 2017/6/6.
 */
const path = require('path');
const fs = require('fs');
const beautify = require('./codeformatter');
const author = 'sk_';

/* 代码结构 模板*/
const getClassStructure = (author,comments,requireMoudlePaths,requireMoudleClass,dependency,moduleName,methods) => {
  return `
${author}
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

const createAuhtor = (author,datetime)=>{
  return `
/**
* Created by ${author} on ${datetime}.
*/`;
};
/* 文件描述模板 */
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
/*方法参数模板*/
const createParam = (type,name,index) => {
  return index == 0 ? `@param {${type}} ${name}` : `\n     * @param {${type}} ${name}`;
};

/* 构造函数模板 */
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
/*使用实例模板*/
const createUsage = (modulePath,className,classParams,methodName,methodParams)=>{
  return `
     * @example
     * <caption>Usage of ${methodName}</caption>
     * require(['${modulePath}'],function(${className}){
     *   var instance = new ${className}(${classParams});
     *   instance.${methodName}(${methodParams});
     * })
     * `;
};

/* 方法模板*/
const createMethod = (description,moduleName,params,returns,method,example) => {
  return `
    /**
     * @description ${description}
     * @method
     * @memberOf module:${moduleName}#
     * ${params}
     * ${example}
     *
     * ${returns}
     */
    ${method}
  `;
};
/*方法返回值模板*/
const createReturn = (returns)=>{
  return returns ? `@returns ${returns}` : '';
};

/* 属性模板 */
const createAttributes = (moduleName,attribute) => {
  let attrs = null;
  attrs = `
  /** @member ${moduleName} */ ${attribute},
  `;
  return attrs;
};
/*require*/
const createRequireTmpl = (path)=>{
  return `\n* @requires ${path} `;
};

/*获取方法体*/
const getMethodBody = (method,boundaryStart,boundaryEnd)=>{
  let slices;
  if(boundaryEnd){
    slices = method.slice(method.indexOf(boundaryStart),method.indexOf(boundaryEnd));
  }else{
    slices = method.slice(method.indexOf(boundaryStart));
  }
  return slices;
};
/*方法中的参数*/
const getParamsFromMethod = (method,boundaryStart,boundaryEnd)=>{
  const methodBody = getMethodBody(method,boundaryStart,boundaryEnd);
  //console.log(methodBody.match(/\:\s*\w+\((.*?)\)/));
  let params = methodBody.match(/\:\s*\w+\((.*?)\)/);

  return params ? params[1] : '';

};
/*获取方法内容*/
const getMethodBodyFromMethod = (method,boundaryStart,boundaryEnd)=>{
  const methodBody = getMethodBody(method,boundaryStart,boundaryEnd);
  //console.log(boundaryStart);
  //console.log(methodBody);
 // return boundaryEnd ? methodBody.slice(methodBody.indexOf('{')+1) : methodBody;
  return methodBody;
};
/*模块名称*/
const createMoudle = (data) => {
  const mouduleStr = data.slice(data.indexOf('dojo'),data.indexOf(";"));
  const moduleName = /\"(.+?)\"/.exec(mouduleStr)[1].replace(/\./g,'/');
  //console.log(RegExp.$1);
  return moduleName;
};
/*清除注释*/
const cleanComments = (data)=>{
  /*
  * //
  * */
  //var test = h.replace(/\/\*(\s|.)*?\*\//g,'').replace(/\/\/(\s|\w*|.*?)/,'');
  //var o = new RegExp('^\\/\\/(\\s|.)*\\n$','img');
  //console.log(h.replace( /(\/\/.*)|(\/\*(\s|\S)*?\*\/)/g,''))
  //console.log(h.match(/\/\/(\s|.)*/g));

  const http = ':\/\/';
  const httpreg = /\:\/\//g;
  const escapehttp = '@:@/@/@';
  const escapehttpreg = /@:@\/@\/@/g;
  data = data.replace(httpreg, escapehttp);
  data = data.replace(/(\/\/.*)|(\/\*(\s|\S)*?\*\/)/g,'');
  return data.replace(escapehttpreg,http);
};

const cleanClassPrefix = (data)=>{

};

const skipFile = (data)=>{
  const hasDefine = data.replace(/\s/g,'').includes('define(');
  const hasConstructor = data.includes('constructor');
  return hasDefine || !hasConstructor;
};

/*方法参数类型*/
const detectParamType = (param)=>{
  param = param.toLowerCase();
  let {keys, values, entries} = Object;
  let type = {
    'obj|option|config|param': {},
    'is|has': true,
    'max|min|num|scale|zoom|level|x|y|index|mode': 1,
    'arr|array': 'arr',
    'callback|cb|func|fn': function(){}
  };
  for (let [key, value] of entries(type)) {
    const detected = key.split('|').some((it)=>{
      return param.includes(it);
    });
    if(detected){
      return value == 'arr' ? 'array' : typeof value;
    }
  }
  return typeof '';
};

const create = (data) => {
  const mouduleStr = data.slice(data.indexOf('dojo.require'),data.indexOf("dojo.declare"));
  const requireModule = mouduleStr.match(/\"(.+?)\"/g);

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerQuery.
 * @module extras/controls/LayerQuery
 * @requires dojo/_base/declare
 */
  const moduleClassPath = createMoudle(data);
  let requirePath = '';
  if(requireModule){
    requirePath = requireModule.map((item,index) => {
      const path = item.replace(/\"/g, '');
      return createRequireTmpl(path);
    });
    requirePath = requirePath.toString().replace(/\,/g,'');
  }
  const comments = createFileOverviewDescription(moduleClassPath.slice(moduleClassPath.lastIndexOf('/')+1),moduleClassPath,requirePath);
  //console.log('fileoverview created.');
  log('fileoverview created.');

  /*
  * [
   "dojo/_base/declare",
   ]
  **/
  let requireMoudlePaths = '';
  if(requireModule){
    //console.log(requireMoudlePaths);
    requireMoudlePaths = requireModule.toString().replace(/\,/g,',\n  ').replace(/\./g,'/');
  }
  //console.log('require modoule created. (%s)',requireMoudlePaths.replace(/\s/g,''));
  log('require modoule created.',requireMoudlePaths.replace(/\s/g,''));
  /*
  * (
   declare,
   )
  */
  let requireMoudleClass = '';
  if(requireModule){
    requireMoudleClass = requireModule.toString().match(/([A-Za-z]\w+)\"/g).toString().replace(/\"/g,'').replace(/,/g,',\n  ');
  }
  //console.log('declare created.');
  log('declare created.');

  const classBody = data.slice(data.indexOf('dojo.declare'),data.lastIndexOf("});"));
  //let dependencyStr = classBody.match(/(.+?\,)+/);
  const dependencyRange = classBody.slice(0,classBody.indexOf('{'));
  let dependencyStr = dependencyRange.match(/\s*\[(.*?)\]/g);
  //console.log('----> ',' [dbs,dec]'.match(/\s*\[(.*?)\]/))
  /*
   * declare([],
   */
  let  dependency = (dependencyStr && dependencyStr[0]) ? dependencyStr[0].replace(',','') : null;
  dependency = dependencyStr == 'null' ? '[]' : dependencyStr;
  //console.log('dependency created. (%s)', dependency);
  log('dependency created. ', dependency);

  let methodBody = '';
 /* if(dependency){

    methodBody = classBody.slice((classBody.indexOf(dependency) + dependency.toString().length));
  }else{
    methodBody = classBody.slice(classBody.indexOf('{'));
  }*/
  methodBody = classBody.slice(classBody.indexOf('{'));

  /*
  *  layerQueryLayer:null,
  * */
  //const attributes = methodBody.slice(0,methodBody.indexOf('constructor')).split(',');
  //const attributes = classBody.slice(classBody.indexOf('{')+1,methodBody.indexOf('constructor')).split(',');
  const attributes = classBody.slice(classBody.indexOf('{')+1,classBody.match(/constructor/).index).split(',');

  let atrributesFormatStr = attributes.map((item,index) => {
    if(item){
      const attributeName = item.slice(0,item.indexOf(':'));
      return createAttributes(attributeName,item);
    }
  });
  atrributesFormatStr.pop();
  //console.log('attributes created.(%s)',atrributesFormatStr);
  log('attributes created.',atrributesFormatStr);

  //console.log(methodBody);
  const constructorBoundary = methodBody.match(/(\w+[\s]*\:)+[\s]*function/g);
  const constructorMethod = methodBody.slice(methodBody.indexOf(constructorBoundary[0]),methodBody.indexOf(constructorBoundary[1]));
  let constructorParams = constructorMethod.match(/\:\s*\w+\((.*?)\)/);
  constructorParams = constructorParams ? constructorParams[1] : '';
  const constructorMethodBody = constructorMethod.slice(constructorMethod.indexOf('{')+1,constructorMethod.lastIndexOf('},'));

  /*
  * * @param {Object} id	工程图层ID
   * @param {Object} where	属性条件
  * */
  let paramsFormat = '';
  if(constructorParams){
    paramsFormat = constructorParams.split(',').map((item,index) => {
      if(item){
        //const type = (item.indexOf('option') != -1 || item.indexOf('obj') != -1)? 'object' : typeof item;
        //const type = item.toLowerCase().includes('option') || item.toLowerCase().includes('obj')  || item.toLowerCase().includes('config') ? 'object' : typeof item;

        return createParam(detectParamType(item),item,index);
      }
    });
    paramsFormat = paramsFormat.join('');
  }
  const constructorFormat = createConstructor(paramsFormat,constructorParams,constructorMethodBody);
  //console.log('constructor created.');
  log('constructor created.');

  let methodsBodyStr = atrributesFormatStr.join('') + constructorFormat;

  let methodSubBodyStr = [];
  if(constructorBoundary[1]){// 除了构造函数，存在其他方法
    const methodsSubBody = methodBody.slice(methodBody.indexOf(constructorBoundary[1]));
    const methodsSubBodyBoundary = methodsSubBody.match(/(\w+[\s]*\:)+[\s]*function/g);
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
          //const type = it.toLowerCase().includes('option') || it.toLowerCase().includes('obj') || it.toLowerCase().includes('config') ?
          //  'object' : typeof it;
          return createParam( detectParamType(it),it,i);
          //return createParam(typeof it,it,i);
        }
      }).join('');

      const methodName = item.slice(0,item.indexOf(':')).trim();
      let returnType = '';
      if(methods.indexOf('return') != -1){
        let returns = methods.slice(methods.indexOf('return') + 'return'.length).split(';')[0];
        //var t = ' (d ) ';
        //console.log(t.match(/\s\((\s|\w*)*\)/g));
        const strings = returns.match(/\s*\((.*)\)/g);
        //var t = `
        //  {
        //    dsfsfd
        //  }
        //`;
        //console.log(strings[0])
        const objects = returns.match(/\s*\{(\s|\w)*\}/g);
        if(strings && strings[0]){
          returnType = createReturn('string');
        }else if(objects && objects[0]){
          returnType =  createReturn(typeof new Object(objects[0].replace(/\s/g,'')));
        }else{
          returnType = createReturn('{*}');
        }
      }
      //console.log(returnType)
      const usage = createUsage(moduleClassPath,moduleClassPath.slice(moduleClassPath.lastIndexOf('/')+1),constructorParams,methodName,methodsSubParam);
      const methodItem = createMethod(methodName,moduleClassPath,paramsFormat,returnType,methods,usage);

      methodSubBodyStr.push(methodItem);
    });
  }
  methodsBodyStr += methodSubBodyStr.join('');
  //console.log('method created.');
  log('method created.');

  const authors = createAuhtor(author,new Date().toLocaleDateString());
  return getClassStructure(authors,comments,requireMoudlePaths,requireMoudleClass,dependency,moduleClassPath,methodsBodyStr);
};

const writeFile = (outputPath,data)=>{
  fs.writeFile(path.resolve(__dirname,outputPath),data,(err) => {
    err ? console.log('wrote fail: ' + err) : console.log(' wrote success!(%s)',path.resolve(__dirname,outputPath))
  })
};
const log = (description,msg)=>{
  console.log('*********\n   %s (%s)\n',description,msg||'');
};

const makedir = (path)=>{
  if (!fs.existsSync(path)) {
    //console.log('directory made \(%s\)', path);
    log('directory made ', path);
    fs.mkdirSync(path);
  }
};

const explorer = (path,out,fileReg)=>{
  makedir(out);
  const files = fs.readdirSync(path);
  files.forEach((file) => {
    const stat = fs.statSync(path + "/" + file);
    if (stat.isDirectory()) {
      let outputdir = out + "\\" + file;
      explorer(path + "\\" + file, outputdir, fileReg);

    } else {
      if (fileReg.test(file)) {
        const filepath = path + "\\" + file;
        let outputdir = out + "\\";
        let outputPath = outputdir + file;
        //if(filepath.includes('test')) return;
        let data = fs.readFileSync(filepath, 'utf-8');
        data = cleanComments(data);
        const isSkip = skipFile(data);
        //if(!data) return;

        console.log(`
=============================== IM =========================================
  extracting file(%s)
============================================================================
        `,filepath);

        if(!isSkip){
          log('formatter starting.......');
          data = create(data);
          log('formatter done.......');
          //console.log(beautify.js_beautify);
          log('file beautifiy... .',file);
          data = beautify.js_beautify(data, 2/*, tabchar*/);
          log('file beautified....',file);
        }
        //writeFile('convert/dist/test.js',data);
        fs.writeFile(outputPath,data,(err) => {
          err ? console.log('convert fail: ' + err) : console.log(file + ' convert success!')
        })
      }
    }
  });
};

const generate = (path,out,fileReg) => {
  explorer(path,out,fileReg);
};

/*converter*/
generate(path.resolve(__dirname, 'convert/src/extras'),path.resolve(__dirname, 'convert/dist/extras'), /\.js/);

//generate('../src/extras','../src/extras', /\.js/);
