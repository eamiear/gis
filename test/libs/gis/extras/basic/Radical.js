/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a MapUtil.
 * @module extras/basic/Radical
 *
 * @requires dojo._base.declare
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "extras/utils/SymbolUtils",
    "extras/utils/MapConstant",
    "esri/layers/GraphicsLayer",
    "esri/geometry/Geometry",
    "extras/graphics/InfoGraphicLayer"
  ],
  function (declare,lang,array,SymbolUtils,MapConstant,GraphicsLayer,Geometry,InfoGraphicLayer) {
    return declare([SymbolUtils,MapConstant], /**  @lends module:extras/basic/Radical */  {
      className: 'Radical',
      /**
       * @constructs
       *
       */
      constructor: function (map) {
        this.map = map;
      },
      getProjectName: function () {
        return location.pathname.split('/')[1];
      },
      getRootPath: function () {
        return [location.protocol, '//', location.host, '/', this.getProjectName()].join('');
      },
      /**
       * @description 获取路径
       * @method
       * @memberOf module:extras/utils/MapUtil#
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
       * @description 路径最后是否包含斜杠'/',绝对路径也返回true
       * @method
       * @memberOf module:extras/utils/MapUtil#
       * @param {string} path
       * @returns {boolean}
       */
      hasLastSlash: function (path) {
        var lastSeparator = path.split('/')[path.split('/').length - 1];
        // an absolute path acts as a path with last slash
        return !lastSeparator || !!(lastSeparator && lastSeparator.indexOf('.') != -1);
      },
      /**
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
       *
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
       *
       * @param {object} layerOptions
       * @param {object|string} layerOptions.layerId
       * @param {boolean} [layerOptions.useCustomLayer]
       * @param {boolean} [layerOptions.isCleanLayer]
       * @param {boolean} [layerOptions.isReorderLayer]
       * @param {object}  [layerOptions.eventBinder]
       * @param {string}  [layerOptions.eventBinder.type]
       * @param {function} [layerOptions.eventBinder.callback]
       *
       * @example
       * <caption>Usage of createLayer</caption>
       * var layer = GisObject.toolbar.createLayer({
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
      getLayerById: function (layerId) {
        return lang.isString(layerId) ? this.map.getLayer(layerId) : layerId;
      },
      clearLayer: function (layer) {
        layer && layer.clear();
      },
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
      }
    })
  });
