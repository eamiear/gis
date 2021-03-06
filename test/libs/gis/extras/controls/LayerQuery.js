/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerQuery.
 * @module extras/controls/LayerQuery
 *
 * @requires dojo/_base/declare
 */
define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "extras/basic/Radical",
  "extras/controls/ToolBar"
], function (
  declare,
  lang,
  array,
  Radical,
  ToolBar
) {
  return declare(Radical, /**  @lends module:extras/controls/LayerQuery */{
    className: 'LayerQuery',
    /**
     * @constructs
     */
    constructor: function (map) {
      //发布toolBarLoadedEvent监听(用来获得MAP和Toolbar)
      //dojo.subscribe("toolBarLoadedEvent", this, "initLayerQuery");

      //this.layerQueryLayer = new extras.graphic.InfoGraphicLayer({id: "GXX_GIS_QUERYRESULT_LAYER"});
      this.queryLayer = this.createLayer({layerId: this.defaultLayerIds.queryLayerId});
      this.toolbar = new ToolBar(map);
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
     * @param {boolean} isClearLayer 是否清空图层(默认 false - 不清空)
     *
     * @returns {dojo.Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    drawToSearch: function (drawOptions, isClearLayer) {
      isClearLayer && this.queryLayer.clear();
      this.map.reorderLayer(this.queryLayer, this.map._layers.length - 1);
      return this.toolbar.draw(drawOptions);
    },

    /**
     * 绘制图形并发布消息绘制结束消息
     * @memberOf module:extras/controls/LayerQuery#
     * @see {@link module:extras/controls/LayerQuery#drawToSearch}
     * @fires module:extras/controls/LayerQuery#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} options.symbol        图元样式
     * @param {object} options.attributes      图元属性
     * @param {string} options.subscribeHook    发布订阅监听钩子
     *
     * @param {boolean} isClearLayer          是否清除图层  （默认清除）
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
    domainSearch: function (options,isClearLayer) {
      var defaultOption = {
        type: 'polygon',
        extras: {type: 'search'},
        layerId: this.defaultLayerIds.queryDrawLayerId
      };
      lang.mixin(defaultOption,options);
      return this.drawToSearch(defaultOption,isClearLayer||true).then(dojo.hitch(this,function (graphic, layer) {
        layer.clear();
        this.queryLayer.add(graphic);
        /**
        * subscribeHook - 'domain-search' event.
        *
        * @event module:extras/controls/LayerQuery#subscribeHook
        * @param {eris.Graphic[]} graphics - 图元数组，更多详情请查看 [eris.Graphic](https://developers.arcgis.com/javascript/3/jsapi/graphic-amd.html)
        */
        dojo.publish(options.subscribeHook || 'domainsearch', [graphic]);
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
    pullBoxSearch: function (options) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.EXTENT,
        subscribeHook: 'pullBoxSearchFinish'
      },options||{}));
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
    polygonSearch: function (options) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.POLYGON,
        subscribeHook: 'polygonSearchFinish'
      },options||{}));
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
    lineSearch: function (options) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.FREEHAND_POLYLINE,
        subscribeHook: 'lineSearchFinish'
      },options||{}));
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
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.CIRCLE,
        subscribeHook: 'circleSearchFinish'
      },options||{}));
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
      layer = this.getLayerById(layer);
      if(!layer){
        this.logger('layer doesn\'t exist');
        return;
      }
      var graphics = layer.graphics || [];
      return array.filter(graphics, function (graphic) {
        return graphic[property] == value;
      })[0];
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
      var layer = this.getLayerById(layerId);
      if(!layer){
        this.logger('[queryByAttribute]','layer doesn\'t exist!');
        return;
      }
      return this._getGraphicByAttribute(layer, attrName, attrValue, isLike);
    },
    /**
     * 空间查询
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {string} layerId
     * @param {Object} geometry
     */
    queryByGeometry: function (layerId, geometry) {
      var layer = this.getLayerById(layerId);
      if(!layer){
        this.logger('[queryByGeometry]','layer doesn\'t exist!');
        return;
      }
      return this._getGraphicByGeometry(layer, geometry);
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
    queryByAttributeAndGeometry: function (layerId, geometry, attrName, attrValue, isLike) {
      var layer = this.getLayerById(layerId);
      if(!layer){
        this.logger('[queryByAttributeAndGeometry]','layer doesn\'t exist!');
        return;
      }
      return this._getGraphicByAttributeAndGeometry(layer, geometry, attrName, attrValue, isLike);
    },

    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @returns {*}
     */
    getAllGraphics: function (layer) {
      layer = this.getLayerById(layer);
      return layer && layer.graphics;
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
    _getGraphicByAttributeAndGeometry: function (layer, geometry, attrName, attrValue, isLike) {
      var graphics = this.getGraphicByAttribute(layer, attrName, attrValue, isLike) || [];
      return array.map(graphics, function (graphic) {
        return geometry.contains(graphic.geometry);
      });
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     *
     * @param {esri.layer.GraphicLayer | string} layer
     * @param {esri.geometry.Point} geometry
     * @returns {*}
     */
    _getGraphicByGeometry: function (layer, geometry) {
      var graphics = this.getAllGraphics(layer);
      if(!graphics || !geometry){
        this.logger('graphics or geometry doesn\'t exist!');
        return;
      }
      return array.map(graphics, function (graphic) {
        return geometry.contains(graphic.geometry);
      });
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
    _getGraphicByAttribute: function (layer, attrName, attrValue, isLike) {
      var graphics = layer.graphics || [];
      return array.map(graphics, function (graphic) {
        if(graphic && graphic.attributes){
          return (!isLike && (graphic.attributes[attrName] == attrValue)) || (graphic.attributes[attrName].indexOf(attrValue) != -1)
        }
      });
    },
    /**
     * @memberOf module:extras/controls/LayerQuery#
     */
    clear: function () {
      this.clearLayer(this.queryLayer)
    }
  })
});
