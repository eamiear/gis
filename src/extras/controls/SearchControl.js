/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a SearchControl.
 * @module extras/controls/SearchControl
 *
 * @requires dojo/_base/declare
 * @requires dojo/_base/lang
 * @requires dojo/_base/array
 * @requires extras/basic/Radical
 * @requires extras/controls/ToolBar
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
  return declare(Radical, /**  @lends module:extras/controls/SearchControl */{
    className: 'SearchControl',
    /**
     * @constructs
     */
    constructor: function (map) {
      this.queryLayer = this.createLayer({layerId: this.defaultLayerIds.queryLayerId});
      this.toolbar = new ToolBar(map);
    },
    /**
     * 绘制图形
     * @method
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {object} drawOptions
     * @param {string} drawOptions.type                  绘制图形类型
     * @param {Symbol} [drawOptions.symbol]              绘制图形样式
     * @param {object} [drawOptions.attributes]           图元属性
     * @param {function} [drawOptions.before]            绘制前的回调
     * @param {function} [drawOptions.handler]           绘制完成的回调
     * @param {object} [drawOptions.extras]              绘制的图元属性
     * @param {boolean} [drawOptions.hideZoomSlider]     绘制时是否隐藏zoomSlider
     * @param {object} [drawOptions.drawTips]            绘制时鼠标提示信息
     * @param {boolean} isClearLayer 是否清空图层(默认 false - 不清空)
     *
     * @returns {Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    drawToSearch: function (drawOptions, isClearLayer) {
      isClearLayer && this.queryLayer.clear();
      this.map.reorderLayer(this.queryLayer, this.map._layers.length - 1);
      return this.toolbar.draw(drawOptions);
    },

    /**
     * 绘制图形并发布消息绘制结束消息
     * @memberOf module:extras/controls/SearchControl#
     * @see {@link module:extras/controls/SearchControl#drawToSearch}
     * @fires module:extras/controls/SearchControl#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} [options.symbol]        图元样式
     * @param {object} [options.attributes]           图元属性
     * @param {function} [options.before]            绘制前的回调
     * @param {function} [options.handler]           绘制完成的回调
     * @param {object} [options.extras]              绘制的图元属性
     * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
     * @param {object} [options.drawTips]            绘制时鼠标提示信息
     * @param {string} options.subscribeHook    发布订阅监听钩子
     * @param {boolean} isClearLayer          是否清除图层  （默认清除）
     *
     * @example
     * <caption>Usage of domainSearch with <b><code>publish/subscribe</code></b></caption>
     * var options = {
     *   type: 'polygon',
     *   subscribeHook: 'pullCircleFinish'
     * }
     *
     * GisObject.searchControl.domainSearch(options);
     * var handler = dojo.subscribe('pullCircleFinish',function(graphics){
     *    // coding...
     *
     *    // unsubscribe this message
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of domainSearch with <b><code>promise</code></b></caption>
     *require(['extras/controls/SearchControl'],function(SearchControl){
     *  new SearchControl(map).domainSearch(options).then(function(graphics,layer){
     *    // coding....
     * })
     *})
     * @returns {Promise}
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
        * @event module:extras/controls/SearchControl#subscribeHook
        * @param {Graphic[]} graphics - 图元数组，更多详情请查看 [eris.Graphic](https://developers.arcgis.com/javascript/3/jsapi/graphic-amd.html)
        */
        dojo.publish(options.subscribeHook || 'domainsearch', [graphic]);
      }));
    },
    /**
     * draw a extent graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/SearchControl#
     * @see {@link module:extras/controls/SearchControl#domainSearch}
     * @fires module:extras/controls/SearchControl#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} [options.symbol]        图元样式
     * @param {object} [options.attributes]           图元属性
     * @param {function} [options.before]            绘制前的回调
     * @param {function} [options.handler]           绘制完成的回调
     * @param {object} [options.extras]              绘制的图元属性
     * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
     * @param {object} [options.drawTips]            绘制时鼠标提示信息
     * @param {string} options.subscribeHook        发布订阅监听钩子
     * @param {boolean} isClearLayer                是否清除图层  （默认清除）
     *
     * @example
     * <caption>Usage of pullBoxSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.searchControl.pullBoxSearch();
     * var handler = dojo.subscribe('pullBoxSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of pullBoxSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.searchControl.pullBoxSearch().then(function(graphics,layer){
     *    // coding....
     * })
     *
     * @returns {Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    pullBoxSearch: function (options,isClearLayer) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.EXTENT,
        subscribeHook: 'pullBoxSearchFinish'
      },options||{}),isClearLayer);
    },
    /**
     * draw a polygon graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/SearchControl#
     * @see {@link module:extras/controls/SearchControl#domainSearch}
     * @fires module:extras/controls/SearchControl#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} [options.symbol]        图元样式
     * @param {object} [options.attributes]           图元属性
     * @param {function} [options.before]            绘制前的回调
     * @param {function} [options.handler]           绘制完成的回调
     * @param {object} [options.extras]              绘制的图元属性
     * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
     * @param {object} [options.drawTips]            绘制时鼠标提示信息
     * @param {string} options.subscribeHook        发布订阅监听钩子
     * @param {boolean} isClearLayer                是否清除图层  （默认清除）
     *
     * @example
     * <caption>Usage of polygonSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.searchControl.polygonSearch();
     * var handler = dojo.subscribe('polygonSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of polygonSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.searchControl.polygonSearch().then(function(graphics,layer){
     *    // coding....
     * })
     *
     * @returns {Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    polygonSearch: function (options,isClearLayer) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.POLYGON,
        subscribeHook: 'polygonSearchFinish'
      },options||{}),isClearLayer);
    },
    /**
     * draw a line graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/SearchControl#
     * @see {@link module:extras/controls/SearchControl#domainSearch}
     * @fires module:extras/controls/SearchControl#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} [options.symbol]        图元样式
     * @param {object} [options.attributes]           图元属性
     * @param {function} [options.before]            绘制前的回调
     * @param {function} [options.handler]           绘制完成的回调
     * @param {object} [options.extras]              绘制的图元属性
     * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
     * @param {object} [options.drawTips]            绘制时鼠标提示信息
     * @param {string} options.subscribeHook        发布订阅监听钩子
     * @param {boolean} isClearLayer                是否清除图层  （默认清除）
     *
     * @example
     * <caption>Usage of lineSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.searchControl.lineSearch();
     * var handler = dojo.subscribe('lineSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of lineSearch with <b><code>promise</code></b></caption>
     *
     * GisObject.searchControl.lineSearch().done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    lineSearch: function (options,isClearLayer) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.FREEHAND_POLYLINE,
        subscribeHook: 'lineSearchFinish'
      },options||{}),isClearLayer);
    },
    /**
     * draw a circle graphic on the map and publish an event letting listeners know whether the action is completed.
     * @memberOf module:extras/controls/SearchControl#
     * @see {@link module:extras/controls/SearchControl#domainSearch}
     * @fires module:extras/controls/SearchControl#subscribeHook
     *
     * @param {object} options
     * @param {string} options.type          图形类型
     *                               <code>polygon, polyline, extent, circle... </code>
     * @param {object} [options.symbol]        图元样式
     * @param {object} [options.attributes]           图元属性
     * @param {function} [options.before]            绘制前的回调
     * @param {function} [options.handler]           绘制完成的回调
     * @param {object} [options.extras]              绘制的图元属性
     * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
     * @param {object} [options.drawTips]            绘制时鼠标提示信息
     * @param {string} options.subscribeHook        发布订阅监听钩子
     * @param {boolean} isClearLayer                是否清除图层  （默认清除）
     *
     * @example
     * <caption>Usage of circleSearch with <b><code>publish/subscribe</code></b></caption>
     *
     * GisObject.searchControl.circleSearch();
     * var handler = dojo.subscribe('circleSearchFinish',function(graphics){
     *    // coding...
     *    dojo.unsubscribe(handler);
     * })
     *
     * @example
     * <caption>Usage of circleSearch with <b><code>promise</code></b></caption>
     * GisObject.searchControl.circleSearch().done(function(graphics){
     *    // coding....
     * })
     *
     * @returns {Promise}
     * return a promise object. see the link [dojo.promise](http://dojotoolkit.org/reference-guide/1.10/dojo/promise.html) for more details.
     */
    circleSearch: function (options,isClearLayer) {
      return this.domainSearch(lang.mixin({
        type: esri.toolbars.draw.CIRCLE,
        subscribeHook: 'circleSearchFinish'
      },options||{}),isClearLayer);
    },

    /**
     * find graphic by property and value
     * @memberOf module:extras/controls/SearchControl#
     * @param {GraphicLayer | string} layer     the object of Layer or layer's id
     * @param {string} property                            layer's property name,e.g. id
     * @param {string|number} value                        value of the property,e.g. id = 1
     *
     * @example
     * <caption>Usage of getGraphicBy</caption>
     * var graphic = new SearchControl(map).getGraphicBy('smart_gis_query_layer','id','graphic_1021');
     *
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
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {string} layerId          layer's id
     * @param {string} attrName         the name of graphic's property
     * @param {string} attrValue        then value of graphic's property
     * @param {boolean} isLike          set <b>true</b> to use fuzzy query
     *
     * @example
     * <caption>Usage of queryByAttribute</caption>
     * var graphic = new SearchControl(map).queryByAttribute('smart_gis_query_layer','id','graphic_1021',true);
     *
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
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {string} layerId
     * @param {object} geometry     geometry of the graphic queried
     *
     * @example
     * <caption>Usage of queryByGeometry</caption>
     * var graphic = new SearchControl(map).queryByGeometry('smart_gis_query_layer',geometry);
     *
     * @returns {*}
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
     * 组合查询
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {string} layerId
     * @param {Point} geometry      geometry of the graphic queried
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     *
     * @example
     * <caption>Usage of queryByAttributeAndGeometry</caption>
     * var graphic = new SearchControl(map).queryByGeometry('smart_gis_query_layer',geometry,'id','graphic_1022',true);
     *
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
     * find all graphics of the layer
     * @memberOf module:extras/controls/SearchControl#
     * @example
     * <caption>Usage of getAllGraphics</caption>
     * var graphic = new SearchControl(map).getAllGraphics('smart_gis_query_layer');
     *
     * @param {object | string} layer        a layer object or layer's id
     * @returns {*}
     */
    getAllGraphics: function (layer) {
      layer = this.getLayerById(layer);
      return layer && layer.graphics;
    },
    /**
     * @private
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {GraphicLayer | string} layer
     * @param {Point} geometry
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
     * @private
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {GraphicLayer | string} layer
     * @param {Point} geometry
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
     * @private
     * @memberOf module:extras/controls/SearchControl#
     *
     * @param {GraphicLayer | string} layer
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
     * remove all graphics of the query layer.
     * @memberOf module:extras/controls/SearchControl#
     *
     * @example
     * <caption>Usage of queryByAttributeAndGeometry</caption>
     * new SearchControl(map).clear();
     */
    clear: function () {
      this.clearLayer(this.queryLayer)
    }
  })
});
