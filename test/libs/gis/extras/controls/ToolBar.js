/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a ToolBar.
 * @module extras/controls/ToolBar
 *
 * @requires dojo._base.declare
 * @requires dojo._base.lang
 * @requires dojo._base.Deferred
 * @requires esri.layers.GraphicsLayer
 * @requires esri.toolbars.navigation
 * @requires esri.toolbars.draw
 * @requires esri.toolbars.edit
 * @requires esri.graphic
 * @requires esri.geometry.webMercatorUtils
 * @requires esri.geometry.Geometry
 * @requires esri.geometry.Point
 * @requires esri.geometry.Extent
 * @requires esri.geometry.Polyline
 * @requires esri.geometry.Polygon
 * @requires esri.geometry.Circle
 * @requires extras.tools.MeasureDrawTool
 * @requires extras.basic.Radical
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/Deferred",
    "esri/layers/GraphicsLayer",
    "esri/toolbars/navigation",
    "esri/toolbars/draw",
    "esri/toolbars/edit",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Geometry",
    "esri/geometry/Point",
    "esri/geometry/Extent",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "esri/geometry/Circle",
    "extras/tools/MeasureDrawTool",
    "extras/basic/Radical"],
  function (
    declare,
    lang,
    Deferred,
    GraphicsLayer,
    Navigation,
    Draw,
    Edit,
    Graphic,
    WebMercatorUtils,
    Geometry,
    Point,
    Extent,
    Polyline,
    Polygon,
    Circle,
    MeasureDrawTool,
    Radical
  ) {
    return declare(Radical, /**  @lends module:extras/control/ToolBar */ {
      className: 'ToolBar',

      /**
       * @constructs
       */
      constructor: function (map) {
        this.map = map;
        try {
          this.navToolbar = new Navigation(this.map);
          this.drawToolbar = new Draw(this.map);
          this.editToolbar = new Edit(this.map);
          this.measureToolbar = new MeasureDrawTool(this.map);

          this.drawLayer = new GraphicsLayer({ id: this.defaultLayerIds.drawLayerId});
          this.addLayer = new GraphicsLayer({id: this.defaultLayerIds.addLayerId});
          this.map.addLayer(this.drawLayer);
          this.map.addLayer(this.addLayer);
        } catch (e) {

        }
      },

      /**
       * @param {object} graphic    a graphic will be pushed in a custom layer or default layer
       * @param {string} [layerId]  an id to create a new layer when the layer doesn't exist.
       * @param {string} action     an attributes name of the Class
       *
       * @example
       * <caption>Usage of _addGraphicToLayer </caption>
       * @private
       */
      _addGraphicToLayer: function (graphic,layerId,action) {
        var layer;
        if(!graphic || !action){
          this.logger('graphic and action should not be empty value!');
          return;
        }
        layer = layerId ? this.createLayer({layerId: layerId}) : this[action];
        layer.add(graphic);
        return layer;
      },
      /**
       * add a graphic to drawLayer
       * @param {object} graphic
       * @param {object|string} layerId
       * @private
       */
      _drawToLayer: function (graphic,layerId) {
        return this._addGraphicToLayer(graphic,layerId,'drawLayer');
      },
      /**
       * add a graphic to addLayer
       * @param {object} graphic
       * @param {object|string} layerId
       * @private
       */
      _addToLayer: function (graphic,layerId) {
        return this._addGraphicToLayer(graphic,layerId,'addLayer');
      },

      /**
       * @description draw  TODO 集成plot
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} params
       * @param {string} params.type                              绘制图形类型
       * @param {Symbol} [params.symbol]                          绘制图形样式
       * @param {object} [params.attributes]                      绘制图形属性
       * @param {function} [params.before]                        绘制前的回调
       * @param {function} [params.handler]                       绘制完成的回调
       * @param {object} [params.extras]                          绘制的图元属性
       * @param {boolean} [params.hideZoomSlider]                 绘制时是否隐藏zoomSlider
       * @param {object} [params.drawTips]                        绘制时鼠标提示信息
       * @param {string} [params.drawTips.addMultipoint]          单击以开始添加点
       * @param {string} [params.drawTips.addPoint]          单击以添加点
       * @param {string} [params.drawTips.addShape]          "单击以添加几何形状，或按下鼠标以开始绘制并释放以完成绘制"
       * @param {string} [params.drawTips.complete]          "双击完成操作"
       * @param {string} [params.drawTips.convertAntiClockwisePolygon]    "以逆时针方向绘制的面将反转为顺时针方向。"
       * @param {string} [params.drawTips.finish]          "双击完成操作"
       * @param {string} [params.drawTips.freehand]        "按下鼠标以开始绘制并释放以完成绘制"
       * @param {string} [params.drawTips.invalidType]     "不支持的几何类型"
       * @param {string} [params.drawTips.resume]          "单击以继续绘制"
       * @param {string} [params.drawTips.start]          "单击以开始绘制"
       *
       * @example
       * <caption>Usage of draw</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).draw({
       *     type: 'ARROW',
       *     hideZoomSlider: true,
       *     extras: {
       *        id: 'arrow_graphic'
       *     },
       *     drawTips: {
       *        addShape: '单击添加三角形，按下绘制，释放完成绘制'
       *     }
       *  }).then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       * })
       */
      draw: function (params) {
        var type = params.type,
            symbol = params.symbol,
            before = params.before,
            handler = params.handler,
            attributes = params.attributes || {},
            extras = params.extras,
            hideZoomSlider = params.hideZoomSlider,
            layerId = params.layerId,
            renderSymbol,
            drawTips = params.drawTips,
            deferred = new Deferred();

        type = type.toLowerCase().replace(/_/g, "");
        hideZoomSlider && this.map.hideZoomSlider();
        this.deactivateToolbar();
        this.map && this.map.disableMapNavigation();

        drawTips && dojo.isObject(drawTips) && lang.mixin(esri.bundle.toolbars.draw,drawTips);
        this.drawToolbar.activate(type);

        switch (type) {
          case "point":
          case "multipoint":
            renderSymbol = symbol || this.symbols.Point;
            this.drawToolbar.setMarkerSymbol(renderSymbol);
            break;
          case "polyline":
          case "freehandpolyline":
            renderSymbol = symbol || this.symbols.Polyline;
            this.drawToolbar.setLineSymbol(renderSymbol);
            break;
          default:
            renderSymbol = symbol || this.symbols.Polygon;
            this.drawToolbar.setFillSymbol(renderSymbol);
            break;
        }
        this.drawToolbar.on('draw-end',dojo.hitch(this, function (evt) {
          var layer;
          hideZoomSlider && this.map.showZoomSlider();
          this.map && this.map.enableMapNavigation();
          this.drawToolbar.deactivate();
          before && before();
          var graphic = new Graphic(evt.geometry, renderSymbol,attributes);
          extras && lang.isObject(extras) && lang.mixin(graphic,extras);
          layer = this._drawToLayer(graphic,layerId);
          handler && handler(graphic,layer);
          deferred.resolve(graphic,layer);
        }));
        return deferred.promise;
      },
      /**
       * deactivate draw action
       * @memberOf module:extras/controls/ToolBar#
       * @example
       * <caption>Usage of deactivateDraw</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *   new ToolBar(map).deactivateDraw();
       * })
       */
      deactivateDraw: function () {
        this.drawToolbar.deactivate();
      },
      /**
       *
       * @param spec     specialize options
       * @param options
       * @returns {*}
       * @private
       */
      _drawToMap: function (spec,options) {
        lang.mixin(options || {}, spec || {});
        return this.draw(options);
      },
      /**
       * draw  a point to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of drawPoint</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).drawPoint({
       *     extras: {
       *        id: 'I_am_a_point'
       *     }
       *  }).then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       *})
       * @returns {*}
       */
      drawPoint: function (options) {
        return this._drawToMap({type: 'point'},options);
      },
      /**
       * draw  a Image to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]             绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of drawImage</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       * var imageSymbol = new PictureMarkerSymbol({
       *   type: "esriPMS",
       *   angle: 0,
       *   width: 32,
       *   height: 32,
       *   xoffset: 0,
       *   yoffset: 0,
       *   url: "http://placehold.it/16x16"
       *  })
       *  new ToolBar(map).drawPoint({
       *     extras: {
       *        id: 'I_am_a_point'
       *     },
       *     symbol: imageSymbol
       *  }).then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       *})
       * @returns {*}
       */
      drawImage: function (options) {
        return this._drawToMap({type: 'point',symbol: this.dealDrawSymbol(this.symbols.PictureMarkerSimbol)},options);
      },
      /**
       * draw  a Text to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]              绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of drawText</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).drawText({
       *     extras: {
       *        id: 'I_am_a_point'
       *     }
       *  }).then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       * })
       * @returns {*}
       */
      drawText: function (options) {
        return this._drawToMap({type: 'point',symbol: this.dealDrawSymbol(this.symbols.TextSymbol)},options);
      },
      /**
       * draw  a circle to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]              绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of drawCircle</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).drawCircle().then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       * })
       *
       * @returns {*}
       */
      drawCircle: function (options) {
        return this._drawToMap({type: 'point',symbol: this.dealDrawSymbol(this.symbols.Circle)},options);
      },
      /**
       * draw  a polyline to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]               绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of drawPolyline</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).drawPolyline().then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       * })
       * @returns {*}
       */
      drawPolyline: function (options) {
        return this._drawToMap({type: 'polyline',symbol: this.dealDrawSymbol(this.symbols.Polyline)},options);
      },
      /**
       * draw  a polygon to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]              绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of drawPolygon</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).drawPolyline().then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       * })
       *
       * @returns {*}
       */
      drawPolygon: function (options) {
        return this._drawToMap({type: 'polygon',symbol: this.dealDrawSymbol(this.symbols.Polygon)},options);
      },
      /**
       * draw  a extent to GraphicLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#draw}
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.extras]               绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       *
       *  @example
       * <caption>Usage of drawExtent</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).drawExtent().then(function(graphic,layer){
       *     console.log('graphic: ','the graphic you draw');
       *     console.log('layer the graphic you draw to');
       *  })
       * })
       * @returns {*}
       */
      drawExtent: function (options) {
        return this._drawToMap({type: 'extent',symbol: this.dealDrawSymbol(this.symbols.Polygon)},options);
      },

      /**
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @returns {*}
       */
      add: function (options) {
        var x = options.x,
          y = options.y,
          symbol = options.symbol,
          attributes = options.attributes,
          layerId = options.layerId,
          point,
          graphic;
        if(!x || !y){
          this.logger('x and y can not be empty');
          return;
        }
        point = new Point(Number(x), Number(y));
        if(this.isGeometry(x,y)){
          point  = WebMercatorUtils.geographicToWebMercator(point);
        }
        graphic = new Graphic(point, (symbol), attributes);
        this._addToLayer(graphic,layerId);
        return graphic;
      },
      /**
       * add a graphic to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {object} options.geometry
       * @param {Symbol} options.symbol
       * @param {object} options.attributes
       * @param {object|string} options.layerId
       * @param {object} options.extras
       * @returns {*}
       * @private
       */
      _addGeometry: function (options) {
        var geometry = options.geometry,
          symbol = options.symbol || {},
          attributes = options.attributes || {},
          layerId = options.layerId,
          extras = options.extras || {},
          graphic;

        if(!geometry || !(geometry instanceof Geometry)){
          this.logger('geometry should not be empty!');
          return false;
        }

        graphic = new Graphic(geometry, symbol, attributes);
        extras && lang.isObject(extras) && lang.mixin(graphic,extras);
        this._addToLayer(graphic,layerId);
        return graphic;
      },
      /**
       * add a point to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {object | Symbol} options.symbol
       * @param {object} options.attributes
       * @param {object|string} options.layerId
       * @param {object} options.extras
       * @returns {*}
       * @private
       */
      _addPoint: function (options) {
        var x = options.x,
          y = options.y,
          point;
        if(!x || !y){
          this.logger('x and y can not be empty');
          return;
        }
        point = new Point(Number(x), Number(y));
        if(this.isGeometry(x,y)){
          point  = WebMercatorUtils.geographicToWebMercator(point);
        }
        options.geometry = point;
        return this._addGeometry(options);
      },
      /**
       * add a text graphic to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @see {@link module:extras/controls/ToolBar#_addGeometry}
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       *  @example
       * <caption>Usage of addText</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addText({
       *    x: 113.128,
       *    y: 23.030,
       *    extras: {
       *      id: 'sk_',
       *      u: 'lll_'
       *    }
       *  })
       * @returns {*}
       */
      addText: function (options) {
        return this._addPoint(this.dealAddSymbol(options,this.symbols.TextSymbol));
      },
      /**
       * add a picture graphic to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       *
       * @example
       * <caption>Usage of addImage</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addImage({
       *    x: 113.128,
       *    y: 23.030
       *  })
       *
       * @returns {*}
       */
      addImage: function (options) {
        return this._addPoint(this.dealAddSymbol(options,this.symbols.PictureMarkerSimbol));
      },
      /**
       * add a point graphic to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol|object} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       * @example
       * <caption>Usage of addPoint</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addPoint({
       *    x: 113.128,
       *    y: 23.030
       *  })
       *
       * @returns {*}
       */
      addPoint: function (options) {
        return this._addPoint(this.dealAddSymbol(options,this.symbols.Point));
      },
      /**
       * add a circle graphic to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {array} options.center
       * @param {number} options.radius
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       * @example
       * <caption>Usage of addCircle</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addCircle({
       *    center: [113.28,23.130],
       *    radius: 1000
       *  })
       *
       * @returns {*}
       */
      addCircle: function (options) {
        var center = options.center,
          radius = options.radius || 100,
          circle,
          isValid;

        //isValid = center && radius;
        if(!center || !lang.isArray(center) || !center.length){
          this.logger('center can not be empty!');
          return;
        }
        circle = new Circle({center: center,radius: radius});
        options.geometry = circle;
        return this._addGeometry(this.dealAddSymbol(options,this.symbols.Polygon));
      },
      /**
       * add a polygon to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {object} options.geometry
       * @param {number} [options.wkid]
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       * @example
       * <caption>Usage of addPolygon</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addPolygon({
       *    "rings": [
       *    [
       *     [-4226661, 8496372],
       *     [-3835304, 8731187],
       *     [-2269873, 9005137],
       *     [-1213208, 8613780],
       *     [-1017529, 8065879],
       *     [-1213208, 7478843],
       *     [-2230738, 6891806],
       *     [-2935181, 6735263],
       *     [-3522218, 6891806],
       *     [-3952711, 7165757],
       *     [-4265797, 7283164],
       *     [-4304933, 7635386],
       *     [-4304933, 7674521],
       *     [-4226661, 8496372]
       *    ]
       *  ],
       *  "wkid": 102100
       *  })
       * @returns {*}
       */
      addPolygon: function (options) {
        var geometry = options.geometry,
          wkid = options.wkid || this.map.spatialReference.wkid,
          polygon;

        if(!geometry){
          this.logger('geometry can not be empty');
          return;
        }
        if(geometry && geometry instanceof Geometry){
          polygon = geometry;
        }else if(lang.isArray(geometry) && geometry.length){
          polygon = wkid ? new Polygon({"rings":geometry,"spatialReference":{"wkid":wkid }}) : new Polygon(geometry);
        }
        options.geometry = polygon;
        return this._addGeometry(this.dealAddSymbol(options,this.symbols.Polygon));
      },
      /**
       * add a polyline to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {object} options.geometry
       * @param {number} [options.wkid]
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       * @example
       * <caption>Usage of addPolyline</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addPolyline({
       *    "paths":[
       *   [
       *     [-12484306,7244028],
       *     [-7318386,10061803],
       *     [-3013453,10727111]
       *   ]
       * ],
       *  "wkid": 102100
       *  })
       *
       * @returns {*}
       */
      addPolyline: function (options) {
        var geometry = options.geometry,
          wkid = options.wkid || this.map.spatialReference.wkid,
          polyline;

        if(!geometry){
          this.logger('geometry can not be empty');
          return;
        }
        if(geometry && geometry instanceof Geometry){
          polyline = geometry;
        }else if(lang.isArray(geometry) && geometry.length){
          polyline = wkid ? new Polyline({"paths":geometry,"spatialReference":{"wkid":wkid }}) : new Polyline(geometry);
        }
        options.geometry = polyline;
        return this._addGeometry(this.dealAddSymbol(options,this.symbols.Polyline));
      },
      /**
       * add a extent to GraphicLayer
       * @memberOf module:extras/controls/ToolBar#
       * @param {object} options
       * @param {object} options.xmin
       * @param {array} options.ymin
       * @param {array} options.xmax
       * @param {array} options.ymax
       * @param {object} options.geometry
       * @param {number} [options.wkid]
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       *
       * @example
       * <caption>Usage of addExtent</caption>
       * require(["extras/controls/ToolBar"],function(ToolBar){
       *  new ToolBar(map).addExtent({
       *    xmin: 113.0112,
       *    ymin: 23.23,
       *    xmax: 113.45,
       *    ymax: 23.76,
       *   "wkid":102100
       * })
       *
       * @returns {*}
       */
      addExtent: function (options) {
        var xmin = options.xmin,
          ymin = options.ymin,
          xmax = options.xmax,
          ymax = options.ymax,
          geometry = options.geometry,
          wkid = options.wkid || this.map.spatialReference.wkid,
          extent;

        if(!((xmin && ymin && xmax && ymax) || geometry)){
          this.logger('xmin,ymin,xmax and ymax or geometry can not be empty');
          return;
        }
        extent = geometry ? geometry : new Extent({"xmin": Number(xmin), "ymin": Number(ymin), "xmax": Number(xmax), "ymax": Number(ymax), "spatialReference":{"wkid":wkid }});
        if(!geometry && this.isGeometry(xmin,ymin)){
          extent  = WebMercatorUtils.geographicToWebMercator(extent);
        }
        options.geometry = extent;
        return this._addGeometry(this.dealAddSymbol(options,this.symbols.Extent));
      },
      addTriangle: function (options) {

      },
      /**
       *
       * @private
       * @param options
       * @param defaultSymbol
       * @returns {*|{}}
       */
      dealAddSymbol: function (options,defaultSymbol) {
        var symbolType = defaultSymbol.type;
        options = options || {};
        if(symbolType === "picturemarkersymbol") {
          defaultSymbol.url = this.getImageAbsPath('marker','default','marker.png');
        }
        if(options.symbol && !(options.symbol instanceof Symbol)){
          options.symbol = this.getSymbolByGraphicType(symbolType,options.symbol);
        }
        options.symbol = options.symbol || defaultSymbol;
        return options;
      },
      /**
       * @private
       * @param symbol
       * @param defaultSymbol
       * @returns {*}
       */
      dealDrawSymbol: function (symbol,defaultSymbol) {
        var tempSymbol = lang.clone((defaultSymbol || {}));
        if(symbol.type === "picturemarkersymbol") {
          symbol.url = this.getImageAbsPath('marker','default','marker.png');
        }
        lang.mixin(tempSymbol,symbol);
        return tempSymbol;
      },

      /**
       * Edit graphic
       * @memberOf module:extras/controls/ToolBar#
       * @param type
       * @param graphic
       * @param specification
       * @returns {boolean}
       */
      edit: function (type,graphic,specification) {
        if(!type || !graphic) {
          this.logger('type and graphic edited should be empty!');
          return false;
        }
        var types = {
          EDIT_TEXT : Edit.EDIT_TEXT,
          EDIT_VERTICES: Edit.EDIT_VERTICES,
          MOVE: Edit.MOVE,
          ROTATE: Edit.ROTATE,
          SCALE: Edit.SCALE
        },
        tool = types[type.toUpperCase()];
        this.editToolbar.activate(tool,graphic,specification || {});
      },
      /**
       * @memberOf module:extras/controls/ToolBar#
       */
      deactivateEdit: function () {
        this.editToolbar.deactivate();
      },

      /**
       * @description clearDrawLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of clearDrawLayer</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.clearDrawLayer();
       * })
       */
      clearDrawLayer: function () {
        this.drawLayer && this.drawLayer.clear();
      },
      /**
       * @description clearAddLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of clearAddLayer</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.clearAddLayer();
       * })
       */
      clearAddLayer: function () {
        this.addLayer && this.addLayer.clear();
      },
      /**
       * @description removeGraphicOfDrawLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @param {Graphic} graphic
       *
       * @example
       * <caption>Usage of removeGraphicOfDrawLayer</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.removeGraphicOfDrawLayer(graphic);
       * })
       */
      removeGraphicOfDrawLayer: function (graphic) {
        graphic && this.drawLayer.remove(graphic);
      },
      /**
       * @description removeGraphicOfAddLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @param {Graphic} graphic
       *
       * @example
       * <caption>Usage of removeGraphicOfAddLayer</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.removeGraphicOfAddLayer(graphic);
       * })
       */
      removeGraphicOfAddLayer: function (graphic) {
        graphic && this.addLayer.remove(graphic);
      },

      /**
       * TODO
       * @description setMouseCursor
       * @method
       * @memberOf module:extras/controls/ToolBar#
       * @param {number} type
       *
       * @example
       * <caption>Usage of setMouseCursor</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.setMouseCursor(type);
       * })
       */
      setMouseCursor: function (type) {
        var cur = baseUrl + '/themes/cursor/pan.ani';
        switch (type.toString()) {
          case extras.control.ToolBar.PAN:
            cur = baseUrl + '/themes/cursor/pan.ani';
            break;
          case extras.control.ToolBar.ZOOMIN:
            cur = baseUrl + '/themes/cursor/zoomin.ani';
            break;
          case extras.control.ToolBar.ZOOMOUT:
            cur = baseUrl + '/themes/cursor/zoomout.ani';
            break;
          case extras.control.ToolBar.POLYGON:
            cur = baseUrl + '/themes/cursor/select_poly.ani';
            break;
          case extras.control.ToolBar.POLYLINE:
            cur = baseUrl + '/themes/cursor/select_polyline.ani';
            break;
          case extras.control.ToolBar.OVAL:
            cur = baseUrl + '/themes/cursor/select_polyline.ani';
            break;
          case extras.control.ToolBar.POINT:
            cur = baseUrl + '/themes/cursor/click.ani';
            break;
          case extras.control.ToolBar.IDENTIFY:
            cur = baseUrl + '/themes/cursor/Hand.cur';
            break;
          case extras.control.ToolBar.EXTENT:
            cur = baseUrl + '/themes/cursor/select_extent.ani';
            break;
          case extras.control.ToolBar.POSITION:
            cur = baseUrl + '/themes/cursor/SunPositionTool.ani';
            break;
        }
      },
      /**
       * @description deactivateToolbar
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of deactivateToolbar</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.deactivateToolbar();
       * })
       */
      deactivateToolbar: function () {
        this.navToolbar.deactivate();
        this.drawToolbar.deactivate();
        this.measureToolbar.deactivate();
      },
      /**
       * @description measureLength
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of measureLength</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.measureLength();
       * })
       */
      measureLength: function () {
        this.deactivateToolbar();
        this.measureToolbar.activate(esri.toolbars.draw.POLYLINE);
      },

      /**
       * @description measureArea
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of measureArea</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.measureArea();
       * })
       */
      measureArea: function () {
        this.deactivateToolbar();
        this.measureToolbar.activate(esri.toolbars.draw.POLYGON);
      },

      /**
       * @description clearMeasureLayer
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of clearMeasureLayer</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.clearMeasureLayer();
       * })
       */
      clearMeasureLayer: function () {
        this.measureToolbar.clearAll();
      },

      /**
       * @description clear
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of clear</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.clear();
       * })
       */
      clear: function () {
          this.measureToolbar && this.measureToolbar.clearAll();
          this.map && this.map.graphics.clear();
      },

      /**
       * @description destroy
       * @method
       * @memberOf module:extras/controls/ToolBar#
       *
       * @example
       * <caption>Usage of destroy</caption>
       * require(['extras/controls/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(map);
       *   instance.destroy();
       * })
       */
      destroy: function () {
        this.clear();
        this.navToolbar = null;
        this.drawToolbar = null;
        this.measureToolbar = null;
        this.map = null;
        this.gisObject = null;
      }
    });
  });
