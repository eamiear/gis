/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a Radical.
 * @module extras/basic/Radical
 *
 * @requires dojo._base.declare
 * @requires dojo._base.lang
 * @requires dojo._base.array
 * @requires extras/utils/MapConstant
 * @requires esri/layers/GraphicsLayer
 * @requires esri/geometry/Geometry
 * @requires extras/graphics/InfoGraphicLayer
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "extras/utils/SymbolUtils",
    "extras/utils/MapConstant",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Geometry",
    "esri/symbols/Symbol",
    "extras/graphics/InfoGraphicLayer"
  ],
  function (declare,lang,array,SymbolUtils,MapConstant,GraphicsLayer,Geometry,Symbol,InfoGraphicLayer) {
    return declare([SymbolUtils,MapConstant], /**  @lends module:extras/basic/Radical */  {
      className: 'Radical',
      /**
       * @constructs
       *
       */
      constructor: function (map) {
        this.map = map;
      },
      /**
       * get current project's name
       * @memberOf module:extras/basic/Radical#
       * @returns {*}
       */
      getProjectName: function () {
        return location.pathname.split('/')[1];
      },
      /**
       * get root path the project
       * @memberOf module:extras/basic/Radical#
       * @returns {string}
       */
      getRootPath: function () {
        return [location.protocol, '//', location.host, '/', this.getProjectName()].join('');
      },
      /**
       * @description 获取调整后的路径
       * @method
       * @private
       * @memberOf module:extras/basic/Radical#
       * @param basicPath
       * @example
       * <caption>Usage of getBasicPath without slash</caption>
       *   this.getBasicPath('http://127.0.0.1/map/service/image');
       *   ===> http://127.0.0.1/map/service/image/
       *
       * @example
       * <caption>Usage of getBasicPath</caption>
       *  this.getBasicPath('http://127.0.0.1/map/service/image/');
       *   ===> http://127.0.0.1/map/service/image/
       *
       * @returns {string}
       */
      getBasicPath: function (basicPath) {
        if (!basicPath) {
          this.logger(basicPath, ' is not defined');
          return;
        }
        return !this.hasLastSlash(basicPath) ? basicPath + '/' : basicPath;
      },
      /**
       * @private
       * @params {array} arguments
       * @returns {string}
       */
      getBasicAbsPath: function () {
        var path = '';
        for (var i = 1; i < arguments.length; i++) {
          path += '/' + arguments[i];
        }
        return this.getBasicPath(arguments[0]) + path.slice(1);
      },
      /**
       * @private
       * @description 路径最后是否包含斜杠'/',绝对路径也返回true
       * @method
       * @memberOf module:extras/basic/Radical#
       * @param {string} path
       * @returns {boolean}
       */
      hasLastSlash: function (path) {
        var lastSeparator = path.split('/')[path.split('/').length - 1];
        // an absolute path acts as a path with last slash
        return !lastSeparator || !!(lastSeparator && lastSeparator.indexOf('.') != -1);
      },
      /**
       * get paths of image relative to the project
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of getImageBasicPath</caption>
       *   this.getImageBasicPath();
       *   ===> http://127.0.0.1:4001/static/assets/gis/images/
       *
       * @returns {*|string}
       */
      getImageBasicPath: function () {
        return this.getBasicPath(gisConfig.mapImagesUrl);
      },
      /**
       * get absolute path of image which combine the arguments you pass to
       * @memberOf module:extras/basic/Radical#
       *
       * @example
       * <caption>Usage of getImageAbsPath</caption>
       *   this.getImageAbsPath();
       *   ===> http://127.0.0.1:4001/static/assets/gis/images/
       * @example
       * <caption>Usage of getImageAbsPath</caption>
       *   this.getImageAbsPath('marker','default');
       *   ===> http://127.0.0.1:4001/static/assets/gis/images/marker/default
       * @example
       * <caption>Usage of getImageAbsPath</caption>
       *   this.getImageAbsPath('marker','default','marker.png');
       *   ===>  http://127.0.0.1:4001/static/assets/gis/images/marker/default/marker.png
       * @returns {*|string}
       */
      getImageAbsPath: function () {
        [].unshift.call(arguments, gisConfig.mapImagesUrl);
        return this.getBasicAbsPath.apply(this, arguments);
      },
      /**
       * get relative path of resource
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of getResourceBasicPath</caption>
       *   this.getResourceBasicPath();
       *   ===> http://127.0.0.1:4001/static/assets/gis/resources/
       * @returns {*|string}
       */
      getResourceBasicPath: function () {
        return this.getBasicPath(gisConfig.mapResourcesUrl);
      },
      /**
       * get absolute path of resource which combine the arguments you pass to
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of getResourceAbsPath</caption>
       *   this.getResourceAbsPath();
       *   ===> http://127.0.0.1:4001/static/assets/gis/resources/
       * @example
       * <caption>Usage of getResourceAbsPath</caption>
       *   this.getResourceAbsPath('marker','default');
       *   ===> http://127.0.0.1:4001/static/assets/gis/resources/marker/default
       * @example
       * <caption>Usage of getResourceAbsPath</caption>
       *   this.getResourceAbsPath('marker','default','marker.png');
       *   ===>  http://127.0.0.1:4001/static/assets/gis/resources/marker/default/marker.png
       * @returns {*|string}
       */
      getResourceAbsPath: function () {
        [].unshift.call(arguments, gisConfig.mapResourcesUrl);
        return this.getBasicAbsPath.apply(this, arguments);
      },
      /**
       * a log method
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of logger</caption>
       *   this.logger('skz');
       *   ===>Info:
       *            skz
       * @example
       * <caption>Usage of logger</caption>
       *   var amazing = 'amazing god';
       *   this.logger('skz(%s)',amazing);
       *   ===> Info:
       *            skz(amazing god)
       */
      logger: function () {
        window.console && window.console.log("Info: \n\t" + arguments[0], [].slice.call(arguments, 1).join('\n\t'));
      },

      /**
       * create a layer for the map
       * @memberOf module:extras/basic/Radical#
       * @param {object} layerOptions
       * @param {object|string} layerOptions.layerId              layer's id
       * @param {boolean} [layerOptions.useCustomLayer]           true to use InfoGraphicLayer, otherwise GraphicLayer{default}
       * @param {boolean} [layerOptions.isCleanLayer]             remove all graphics of layer exists before call createLayer
       * @param {boolean} [layerOptions.isReorderLayer]           set true to reorder layer
       * @param {object}  [layerOptions.eventBinder]              binding events to layer after being created
       * @param {string}  [layerOptions.eventBinder.type]         type of the event.e.g. click
       * @param {function} [layerOptions.eventBinder.callback]    callback function when the event being triggered
       *
       * @example
       * <caption>Usage of createLayer</caption>
       * var layer = GisObject.toolbar.createLayer({
       *  "layerId": "skz_"
       * });
       *
       * @example
       * <caption>Usage of createLayer</caption>
       * var layer = new Toolbar(map).createLayer({
       *  "layerId": "skz_"
       * });
       *
       * @returns {*}
       */
      createLayer: function (layerOptions) {
        var layerId = layerOptions.layerId,
          useCustomLayer = layerOptions.useCustomLayer,
          isCleanLayer = layerOptions.isCleanLayer,
          isReorderLayer = layerOptions.isReorderLayer,
          eventBinder = layerOptions.eventBinder,
          layer;

        if(layerId && typeof layerId === 'string'){
          layer = this.map.getLayer(layerId);
          if(!layer){
            layer = useCustomLayer ? new InfoGraphicLayer({id: layerId}) : new GraphicsLayer({id: layerId});
            this.map.addLayer(layer);
            eventBinder && dojo.isObject(eventBinder) && layer.on(eventBinder.type, eventBinder.callback);
          }
        }else if(dojo.isObject(layerId) && (layerId instanceof GraphicsLayer || layerId instanceof InfoGraphicLayer)){
          layer = layerId;
        }else{
          this.logger('layerId 不能为空');
          return null;
        }
        isCleanLayer && layer.clear();
        isReorderLayer &&  this.map.reorderLayer(layer, this.map._layers.length - 1);
        return layer;
      },
      /**
       * @memberOf module:extras/basic/Radical#
       * @param {string | object} layer
       * @param {string | number} graphicId
       * @returns {*}
       */
      getGraphicById: function (layer, graphicId) {
        layer = this.getLayerById(layer);
        if(!layer){
          this.logger('layer doesn\'t exist');
          return;
        }
        var graphics = layer.graphics || [];
        return array.filter(graphics, function (graphic) {
          return graphic.id == graphicId;
        })[0];
      },
      /**
       * @memberOf module:extras/basic/Radical#
       * @param {object|string} layerId
       * @returns {*}
       */
      getLayerById: function (layerId) {
        return lang.isString(layerId) ? this.map.getLayer(layerId) : layerId;
      },
      /**
       * clear layer
       * @memberOf module:extras/basic/Radical#
       * @param {object|string} layer
       */
      clearLayer: function (layer) {
        layer = this.getLayerById(layer);
        layer && layer.clear();
      },
      /**
       * @memberOf module:extras/basic/Radical#
       * @param {number} x          longitude of the graphic's geometry
       * @param {number} y          latitude of the graphic's geometry
       *
       * @example
       * <caption>Usage of isGeometry</caption>
       * var trueOrfalse = new Radical().isGeometry(1231323.23,3133134.1232);
       *
       * @example
       * <caption>Usage of isGeometry</caption>
       * var trueOrfalse = new Radical().isGeometry(geometry);
       *
       * @returns {*|boolean}
       */
      isGeometry: function (x,y) {
        var longitude,latitude,regexp;

        if (arguments.length === 1 && arguments[0] instanceof Geometry){
          longitude = arguments[0].x;
          latitude = arguments[0].y;
        }else {
          regexp = new RegExp('(\\d+).\\d+');
          regexp.exec(Number(x).toString());
          longitude = RegExp.$1;
          regexp.exec(Number(y).toString());
          latitude = RegExp.$1;
        }
        return longitude && latitude && (longitude.length <= 3 || latitude.length <= 2);
      },
      /**
       * @description isWebMercator
       * @method
       * @memberOf module:extras/basic/Radical#
       * @param {SpatialReference | object} reference
       * @returns {boolean}
       */
      isWebMercator: function (reference) {
        return !!{
          100112: true,
          102113: true,
          102100: true,
          3857: true,
          3785: true,
          54004: true,
          41001: true
        }[reference.wkid];
      },
      /**
       * get center geometry of the graphic
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of getGeometryCenter</caption>
       * var center = new Radical().getGeometryCenter(geometry);
       *
       * @param {object} geometry
       * return {*}
       */
      getGeometryCenter: function (geometry) {
        if(geometry && geometry instanceof Geometry){
          return (function (geometry) {
            return {
              'point': geometry,
              'multipoint': geometry.getExtent().getCenter(),
              'polyline': geometry.getExtent().getCenter(),
              'polygon': geometry.getExtent().getCenter(),
              'extent': geometry.getCenter(),
              'circle': geometry.getExtent().getCenter()
            }[geometry.type];
          })(geometry)
        }
      },
      /**
       * get extent geometry of graphic, Point excepted.
       * @memberOf module:extras/basic/Radical#
       *
       * @example
       * <caption>Usage of getGeometryExtent</caption>
       * var center = new Radical().getGeometryExtent(geometry);
       * @param {object} geometry
       * return {*}
       */
      getGeometryExtent: function (geometry) {
        if(geometry && geometry instanceof Geometry){
          return (function (geometry) {
            return {
              'extent': geometry,
              'multipoint': geometry.getExtent(),
              'polyline': geometry.getExtent(),
              'polygon': geometry.getExtent(),
              'circle': geometry.getExtent()
            }[geometry.type];
          })(geometry)
        }
      },
      /**
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of getUUID</caption>
       * var uuid = new Radical().getUUID();
       * @returns {string}
       */
      getUUID: function () {
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (var i = 0; i < 36; i++) {
          s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = "-";

        return s.join("");
      },
      /**
       * get a random number between min and max
       * @memberOf module:extras/basic/Radical#
       * @example
       * <caption>Usage of getRandom</caption>
       * var random = new Radical().getRandom(1,100);
       * @param {number} min
       * @param {number} max
       * @returns {*}
       */
      getRandom: function (min, max) {
        return min + Math.random() * (max - min);
      },
      /**
       * create a symbol by the type of graphic
       * @memberOf module:extras/basic/Radical#
       * @param {string} graphicType
       * @param {string|Symbol} symbolAttr
       * <caption>Usage of getSymbolByGraphicType</caption>
       * var random = new Radical().getSymbolByGraphicType('point',{
       *     type: "esriSMS",
       *     style: "esriSMSCircle",
       *     angle: 0,
       *     color: [255, 0, 0, 255],
       *     outline: {
       *       type: "esriSLS",
       *       style: "esriSLSSolid",
       *       width: 1.5,
       *       color: [255, 255, 255]
       *     },
       *     size: 6.75,
       *     xoffset: 0,
       *     yoffset: 0
       * });
       * @returns {*}
       */
      getSymbolByGraphicType: function (graphicType, symbolAttr) {
        //if(!(graphicType && symbolAttr)){
        //  this.logger('graphicType and  symbolAttr should not be empty!');
        //  return null;
        //}
        if(!graphicType) return null;
        if(symbolAttr instanceof Symbol){
          return symbolAttr;
        }
        return this.symbolFactory(graphicType,symbolAttr);
      },
      /**
       * deal with default symbol
       * @memberOf module:extras/basic/Radical#
       * @param symbol
       * @returns {*}
       */
      dealWithDefaultSymbol: function (symbol) {
        if(lang.isObject(symbol)){
          if(/picture/i.test(symbol.type) &&  !symbol.url){
            symbol.url = this.getImageAbsPath('marker','default','circle.png');
          }
        }
        return symbol;
      },
      /**
       * get center geometry of the map
       * @memberOf module:extras/basic/Radical#
       * @returns {*}
       */
      getCenter: function () {
        return this.map.getCenter();
      },
      /**
       * get extent of the map
       * @memberOf module:extras/basic/Radical#
       * @returns {*}
         */
      getExtent: function () {
        return this.map.getExtent();
      },
      /**
       * get scale of the map
       * @memberOf module:extras/basic/Radical#
       * @returns {*|string}
         */
      getScale: function () {
        return this.map.getScale();
      },
      /**
       * get current level of the map
       * @memberOf module:extras/basic/Radical#
       * @returns {*}
         */
      getLevel: function () {
        return this.map.getLevel();
      }
    })
  });
