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
define([
  "dojo/_base/declare",
  "dojo/_base/Deferred",
  "esri/graphic",
  "esri/layers/GraphicsLayer",
  "esri/geometry/Point",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleFillSymbol",
  "esri/geometry/webMercatorUtils"
], function (
   declare,
   Deferred,
   Graphic,
   GraphicsLayer,
   Point,
   PictureMarkerSymbol,
   SimpleLineSymbol,
   SimpleFillSymbol,
   webMercatorUtils
) {
  return declare([], /**  @lends module:extras/controls/LayerQuery */{
    /** @member layerQueryLayer */
    layerQueryLayer: null,
    /**
     * 默认样式
     * @member defaultSymbol
     */
    defaultSymbol: {
      "POINT": {
        type: "esriSMS",
        style: "esriSMSCircle",
        angle: 0,
        color: [255, 0, 0, 255],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 255, 255]
        },
        size: 6.75,
        xoffset: 0,
        yoffset: 0
      },
      "IMAGE": {
        type: "esriPMS",
        angle: 0,
        width: 32,
        height: 32,
        xoffset: 0,
        yoffset: 0,
        url: this.getRootPath() + "/themes/default/images/tt.png"
      },
      "TEXT": {
        type: "esriTS",
        angle: 0,
        color: [51, 51, 51, 255],
        font: {
          family: "微软雅黑",
          size: 9,
          style: "normal",
          variant: "normal",
          weight: "normal"
        },
        horizontalAlignment: "center",
        kerning: true,
        rotated: false,
        text: "默认文本",
        xoffset: 0,
        yoffset: 0
      },
      "LINE": {
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      },
      "POLYLINE": {
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      },
      "POLYGON": {
        type: "esriSFS",
        style: "esriSFSSolid",
        color: [0, 0, 0, 64],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 0, 0, 255]
        }
      }
    },
    /**
     * @constructs
     */
    constructor: function () {
      //发布toolBarLoadedEvent监听(用来获得MAP和Toolbar)
      dojo.subscribe("toolBarLoadedEvent", this, "initLayerQuery");

      this.mapCommonUtils = new extras.utils.MapCommonUtils();
      this.layerQueryLayer = new extras.graphic.InfoGraphicLayer({id: "GXX_GIS_QUERYRESULT_LAYER"});
    },
    /**
     * @method
     * @private
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @listens module:extras/controls/ToolBar~event:toolBarLoadedEvent
     */
    initLayerQuery: function (toolbar) {
      this.toolbar = toolbar;
      this.map = this.toolbar.map;
      this.map.addLayer(this.layerQueryLayer);
    },
    /**
     * 绘制图形
     * @private
     * @method
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {string} type          图形类型
     * @param {object} symbol      图形样式
     * @param {boolean} isNotClearLayer 是否不清空图层(默认 false - 清空)
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    startDraw: function (type, symbol, isNotClearLayer) {
      var deferred = new Deferred();
      !isNotClearLayer && this.layerQueryLayer.clear();
      this.map.reorderLayer(this.layerQueryLayer, this.map._layers.length - 1);
      this.toolbar.draw(type, symbol || this.defaultSymbol[type.toUpperCase()], dojo.hitch(this, function (graphic) {
        deferred.resolve(graphic);
      }));
      return deferred.promise;
    },
    /**
     * A Method With Default Symbol For StartDraw
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#startDraw}
     *
     * @param {string} type
     * @param {object} symbol
     * @param {boolean} isNotClearLayer 是否不清空图层(默认 false - 清空)
     * @param {function} callback
     *
     * @example
     * <caption>Usage of basicSearch</caption>
     *
     * GisObject.layerQuery.basicSearch('extent').done(function(graphics){
		 *      // Something of your code
		 * });
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    basicSearch: function (type, symbol, isNotClearLayer, callback) {
      var renderSymbol;
      symbol = symbol || {};
      switch (type) {
        case "point":
        case "multipoint":
          //dojo.mixin({}, this.defaultSymbol.POINT,symbol);
          break;
        case "polyline":
        case "freehandpolyline":
          renderSymbol = new SimpleLineSymbol(dojo.mixin({}, this.defaultSymbol.LINE, symbol));
          break;
        default:
          renderSymbol = new SimpleFillSymbol(dojo.mixin({}, this.defaultSymbol.POLYGON, symbol));
          break;
      }
      return this.startDraw(type, renderSymbol, isNotClearLayer).then(function (graphic) {
        callback && callback(graphic);
      });
    },
    /**
     * 绘制图形并发布消息绘制结束消息
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#basicSearch}
     * @fires module:extras/controls/LayerQuery#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} options.symbol        图元样式
     * @param {boolean} options.isNotClearLayer      是否不清除图层  （默认不清除）
     * @param {object} options.attributes      图元属性
     * @param {string} options.subscribeHook    发布订阅监听钩子
     *
     * @example
     * <caption>Usage of domainSearch with <b><code>publish/subscribe</code></b></caption>
     * var options = {
     *   type: 'polygon',
     *   subscribeHook: 'pullCircleFinish'
     * }
     *
     * GisObject.layerQuery.domainSearch(options);
     * var handler = dojo.subscribe('pullCircleFinish',function(graphics){
     *    // coding...
     *
     *    // unsubscribe this message
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of domainSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.layerQuery.domainSearch(options).done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    domainSearch: function (options) {
      options = options || {};
      return this.basicSearch(options.type || esri.toolbars.draw.POLYGON, options.symbol, options.isNotClearLayer || true).then(dojo.hitch(this, function (graphic) {
        dojo.mixin(graphic.attributes, options.attributes, {type: 'search'});
        this.toolbar.drawLayer.clear();
        this.layerQueryLayer.add(graphic);
        /**
         * subscribeHook - 'domain-search' event.
         *
         * @event module:extras/controls/LayerQuery#subscribeHook
         * @param {eris.Graphic[]} graphics - 图元数组，更多详情请查看 [eris.Graphic](https://developers.arcgis.com/javascript/3/jsapi/graphic-amd.html)
         */
        dojo.publish(options.subscribeHook || 'domain-search', [graphic]);
      }));
    },
    /**
     * draw a extent graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#domainSearch}
     * @fires module:extras/controls/LayerQuery#subscribeHook
     *
     * @example
     * <caption>Usage of pullBoxSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.layerQuery.pullBoxSearch();
     * var handler = dojo.subscribe('pullBoxSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of pullBoxSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.layerQuery.pullBoxSearch().done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    pullBoxSearch: function () {
      return this.domainSearch({
        type: esri.toolbars.draw.EXTENT,
        symbol: SimpleFillSymbol(this.defaultSymbol.POLYGON),
        subscribeHook: 'pullBoxSearchFinish'
      });
    },
    /**
     * draw a polygon graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#domainSearch}
     * @fires module:extras/controls/LayerQuery#subscribeHook
     *
     * @example
     * <caption>Usage of polygonSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.layerQuery.polygonSearch();
     * var handler = dojo.subscribe('polygonSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of polygonSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.layerQuery.polygonSearch().done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    polygonSearch: function () {
      return this.domainSearch({
        type: esri.toolbars.draw.POLYGON,
        symbol: SimpleFillSymbol(this.defaultSymbol.POLYGON),
        subscribeHook: 'polygonSearchFinish'
      });
    },
    /**
     * draw a line graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#domainSearch}
     * @fires module:extras/controls/LayerQuery#subscribeHook
     *
     * @example
     * <caption>Usage of lineSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.layerQuery.lineSearch();
     * var handler = dojo.subscribe('lineSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of lineSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.layerQuery.lineSearch().done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    lineSearch: function () {
      return this.domainSearch({
        type: esri.toolbars.draw.FREEHAND_POLYLINE,
        symbol: SimpleLineSymbol(this.defaultSymbol.LINE),
        subscribeHook: 'lineSearchFinish'
      });
    },
    /**
     * draw a circle graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#domainSearch}
     * @fires module:extras/controls/LayerQuery#subscribeHook
     *
     * @example
     * <caption>Usage of circleSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.layerQuery.circleSearch();
     * var handler = dojo.subscribe('circleSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of circleSearch with <b><code>promise</code></b></caption>
     * GisObject.layerQuery.circleSearch().done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    circleSearch: function () {
      return this.domainSearch({
        type: esri.toolbars.draw.CIRCLE,
        symbol: SimpleFillSymbol(this.defaultSymbol.POLYGON),
        subscribeHook: 'circleSearchFinish'
      });
    },

    /**
     * 属性查询
     *
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {string} layerId
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * @returns {*}
     */
    queryByAttribute: function (layerId, attrName, attrValue, isLike) {
      var param = new SpatialQueryParam();
      param.layerId = layerId;
      param.attrName = attrName;
      param.attrValue = attrValue;
      param.isLike = isLike || true;
      return this.queryByLayerId(1, param)
    },
    /**
     * 空间查询
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {string} layerId
     * @param {Object} geometry
     */
    queryByGeometry: function (layerId, geometry) {
      var param = new SpatialQueryParam();
      param.layerId = layerId;
      param.geometry = geometry;
      return this.queryByLayerId(2, param)
    },
    /**
     * 综合查询
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {string} layerId
     * @param {eris.geometry.Point} geometry
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * @returns {*}
     */
    queryByAttrAndGeo: function (layerId, geometry, attrName, attrValue, isLike) {
      var param = new SpatialQueryParam();
      param.layerId = layerId;
      param.geometry = geometry;
      param.attrName = attrName;
      param.attrValue = attrValue;
      return this.queryByLayerId(3, param)
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {string} type
     * @param {object} param
     * @param {string} param.layerId;
     * @param {string} param.attrName;
     * @param {string} param.attrValue;
     * @param {eris.geometry.Point} param.geometry;
     * @param {boolean} param.isLike;
     * @returns {*}
     */
    queryByLayerId: function (type, param) {
      var layerId = param.layerId;
      var attrName = param.attrName;
      var attrValue = param.attrValue;
      var geometry = param.geometry || null;
      var isLike = param.isLike || true; //默认是模糊查询
      var layer = this.map.getLayer(layerId);
      var resultData = null;
      if (layer) {
        if (type == 1) { // 属性是查询
          resultData = this.getGraphicByAttribute(layer, attrName, attrValue, isLike);
        } else if (type == 2) { //空间查询
          resultData = this.getGraphicByGeometry(layer, geometry);
        } else if (type == 3) { //属性空间联合查询
          resultData = this.getGraphicByAttributeAndGeometry(layer, geometry, attrName, attrValue, isLike);
        }
      }
      return resultData;
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @param {string} property
     * @param {string} value
     * @returns {*}
     */
    getGraphicBy: function (layer, property, value) {
      var feature = null;
      if (layer) {
        if (typeof layer === "string") {
          layer = this.map.getLayer(layer);
        }
        var graphics = layer.graphics;
        if (!graphics || !graphics.length) return null;

        for (var i = 0, len = graphics.length; i < len; ++i) {
          var graphic = graphics[i];
          // Handle For Cluster Graphic
          if (graphic[property] == undefined && graphic['attributes']['clusterCount']) {
            for (var k = 0; k < graphic.attributes.clusterCount; k++) {
              if (graphic.attributes.data[k][property] == value) {
                //feature = graphics[i];
                // Add At 2017/04/25 处理智能追踪时，设备聚合情况下，获取不了图元得问题
                var tgraphic = graphic.attributes.data[k];
                tgraphic.layerId = graphic.getLayer()._id;
                tgraphic.rawNode = graphic.getShape().rawNode;
                tgraphic.spatialReference = graphic.geometry && graphic.geometry.spatialReference;
                feature = this.mapCommonUtils.buildClusterGraphic(tgraphic);
                break;
              }
            }
          } else if (graphics[i][property] == value) {
            feature = graphics[i];
            break;
          }
        }
      }
      return feature;
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @param {string} idKey
     * @returns {*}
     */
    getGraphicById: function (layer, idKey) {
      return this.getGraphicBy(layer, 'id', idKey);
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @returns {*}
     */
    getAllGraphic: function (layer) {
      if (typeof layer === "string") {
        layer = this.map.getLayer(layer);
      }
      return layer.graphics;
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @param {esri.geometry.Point} geometry
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * @returns {*}
     */
    getGraphicByAttributeAndGeometry: function (layer, geometry, attrName, attrValue, isLike) {
      var foundGraphics = null;
      var resultData = this.getGraphicByAttribute(layer, attrName, attrValue, isLike);
      if (resultData && resultData.lenght > 0) {
        foundGraphics = [];
        dojo.forEach(resultData, function (graphic, index) {
          if (geometry.contains(graphic.geometry)) {
            foundGraphics.push(graphic);
          }
        });
      }
      return foundGraphics;
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @param {esri.geometry.Point} geometry
     * @returns {*}
     */
    getGraphicByGeometry: function (layer, geometry) {
      var foundGraphics = null;
      if (layer && geometry) {
        foundGraphics = [];
        var allGraphic = this.getAllGraphic(layer);
        for (var i = 0, len = allGraphic.length; i < len; i++) {
          var g = allGraphic[i];
          if (geometry.contains(g.geometry)) {
            foundGraphics.push(g);
          }
        }
      }
      return foundGraphics;
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * @returns {*}
     */
    getGraphicByAttribute: function (layer, attrName, attrValue, isLike) {
      var foundGraphics = null;
      if (layer) {
        var feature = null;
        foundGraphics = [];
        var graphics = layer.graphics;
        if (!graphics || !graphics.length) return null;

        for (var i = 0, len = graphics.length; i < len; i++) {
          feature = graphics[i];

          if (feature && feature.attributes) {
            if (feature['attributes']['clusterCount']) {
              for (var k = 0; k < feature.attributes.clusterCount; k++) {
                var graphic = feature.attributes.data[k];
                graphic.layerId = feature.getLayer()._id;
                graphic.spatialReference = feature.geometry && feature.geometry.spatialReference;

                if (!isLike && (graphic[attrName] == value)) {
                  graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
                  foundGraphics.push(graphic);
                } else if (graphic[attrName].indexOf(attrValue) != -1) {
                  graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
                  foundGraphics.push(graphic);
                }
              }
            } else if (!isLike && (feature.attributes[attrName] == attrValue)) {
              foundGraphics.push(feature);
            } else if (feature.attributes[attrName].indexOf(attrValue) != -1) {
              foundGraphics.push(feature);
            }
          }
        }
      }
      return foundGraphics;
    },
    getRootPath: function () {
      return [location.protocol, "//", location.host, "/", location.pathname.split('/')[1]].join('');
    },
    /**
     * @private
     * @memberOf module:extras/controls/LayerQuery#
     */
    clear: function () {
      this.layerQueryLayer && this.layerQueryLayer.clear();
    }
  })
});
