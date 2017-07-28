/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a ToolBar.
 * @module extras/control/ToolBar
 *
 * @requires dojo._base.declare
 * @requires esri.layers.GraphicsLayer
 * @requires esri.toolbars.navigation
 * @requires esri.toolbars.draw
 * @requires extras.tools.MeasureDrawTool
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
  function (declare,
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
            Radical) {
    return declare(Radical, /**  @lends module:extras/control/ToolBar */ {
      className: 'ToolBar',

      /** @member map */
      map: null,

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
          //this.pan();
        } catch (e) {

        }
        //dojo.publish("toolBarLoadedEvent", [this]);
        //dojo.subscribe("mapLoadedEvent", this, "initToolbar");
      },
      /**
       * @description initToolbar
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {string} map
       *
       * @example
       * <caption>Usage of initToolbar</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(gisObject);
       *   instance.initToolbar(map);
       * })
       */
      initToolbar: function (map) {
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
          //this.pan();
        } catch (e) {

        }
        dojo.publish("toolBarLoadedEvent", [this]);
      },
      // test
      getSymbols: function () {
        //console.log('getBasicPath ----- ', this.getResourceBasicPath());
        //console.log('path ----- ', this.getImageAbsPath('dd', 'rrr', 'ggg'));
      },

      /**
       *
       * @param {object} graphic    a graphic will be pushed in a custom layer or default layer
       * @param {string} [layerId]  an id to create a new layer when the layer doesn't exist.
       * @param {string} action     an attributes name of the Class
       *
       * @example
       * <caption>Usage of _addGraphicToLayer </caption>
       *
       * @private
       */
      _addGraphicToLayer: function (graphic,layerId,action) {
        if(!graphic || !action){
          this.logger('graphic and action should not be empty value!');
          return;
        }
        layerId ? this.createLayer({layerId: layerId}).add(graphic) : this[action].add(graphic);
      },
      /**
       * add a graphic to drawLayer
       * @param {object} graphic
       * @param {object|string} layerId
       * @private
       */
      _drawToLayer: function (graphic,layerId) {
        this._addGraphicToLayer(graphic,layerId,'drawLayer');
      },
      /**
       * add a graphic to addLayer
       * @param {object} graphic
       * @param {object|string} layerId
       * @private
       */
      _addToLayer: function (graphic,layerId) {
        this._addGraphicToLayer(graphic,layerId,'addLayer');
      },

      /**
       * @description draw  TODO 集成plot
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} params
       * @param {string} params.type                  绘制图形类型
       * @param {Symbol} [params.symbol]              绘制图形样式
       * @param {function} [params.before]            绘制前的回调
       * @param {function} [params.handler]           绘制完成的回调
       * @param {object} [params.graphicAttr]         绘制的图元属性
       * @param {boolean} [params.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [params.drawTips]            绘制时鼠标提示信息
       *
       * @example
       * <caption>Usage of draw</caption>
       *
       */
      draw: function (params) {
        var type = params.type,
            symbol = params.symbol,
            before = params.before,
            handler = params.handler,
            graphicAttr = params.graphicAttr,
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
          hideZoomSlider && this.map.showZoomSlider();
          this.map && this.map.enableMapNavigation();
          this.drawToolbar.deactivate();
          before && before();
          var graphic = new Graphic(evt.geometry, renderSymbol);
          graphicAttr && dojo.isObject(graphicAttr) && lang.mixin(graphic,graphicAttr);
          this._drawToLayer(graphic,layerId);
          handler && handler(graphic);
          deferred.resolve(graphic);
        }));
        return deferred.promise;
      },
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
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       * @returns {*}
       */
      drawPoint: function (options) {
        return this._drawToMap({type: 'point'},options);
      },
      /**
       * draw  a Image to GraphicLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       * @returns {*}
       */
      drawImage: function (options) {
        return this._drawToMap({type: 'point',symbol: this.dealDrawSymbol(this.symbols.PictureMarkerSimbol)},options);
      },
      /**
       * draw  a Text to GraphicLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       * @returns {*}
       */
      drawText: function (options) {
        return this._drawToMap({type: 'point',symbol: this.dealDrawSymbol(this.symbols.TextSymbol)},options);
      },
      /**
       * draw  a circle to GraphicLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       * @returns {*}
       */
      drawCircle: function (options) {
        return this._drawToMap({type: 'point',symbol: this.dealDrawSymbol(this.symbols.Circle)},options);
      },
      /**
       * draw  a polyline to GraphicLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       * @returns {*}
       */
      drawPolyline: function (options) {
        return this._drawToMap({type: 'polyline',symbol: this.dealDrawSymbol(this.symbols.Polyline)},options);
      },
      /**
       * draw  a polygon to GraphicLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
       * @returns {*}
       */
      drawPolygon: function (options) {
        return this._drawToMap({type: 'polygon',symbol: this.dealDrawSymbol(this.symbols.Polygon)},options);
      },
      /**
       * draw  a extent to GraphicLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {object} options
       * @param {Symbol} [options.symbol]              绘制图形样式
       * @param {function} [options.before]            绘制前的回调
       * @param {function} [options.handler]           绘制完成的回调
       * @param {object} [options.graphicAttr]         绘制的图元属性
       * @param {boolean} [options.hideZoomSlider]     绘制时是否隐藏zoomSlider
       * @param {object} [options.drawTips]            绘制时鼠标提示信息
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
       * @param {object} options
       * @param {object} options.geometry
       * @param {object} options.symbol
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
        extras && dojo.isObject(extras) && lang.mixin(graphic,extras);
        this._addToLayer(graphic,layerId);
        return graphic;
      },
      /**
       * add a point to GraphicLayer
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {object} options.symbol
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
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       * @returns {*}
       */
      addText: function (options) {
        return this._addPoint(this.dealAddSymbol(options,this.symbols.TextSymbol));
      },
      /**
       * add a picture graphic to GraphicLayer
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       * @returns {*}
       */
      addImage: function (options) {
        return this._addPoint(this.dealAddSymbol(options,this.symbols.PictureMarkerSimbol));
      },
      /**
       * add a point graphic to GraphicLayer
       * @param {object} options
       * @param {number} options.x
       * @param {number} options.y
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
       * @returns {*}
       */
      addPoint: function (options) {
        return this._addPoint(this.dealAddSymbol(options,this.symbols.Point));
      },
      /**
       * add a circle graphic to GraphicLayer
       * @param {object} options
       * @param {array} options.center
       * @param {number} options.radius
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
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
       * @param {object} options
       * @param {object} options.geometry
       * @param {number} [options.wkid]
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
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
       * @param {object} options
       * @param {object} options.geometry
       * @param {number} [options.wkid]
       * @param {Symbol} [options.symbol]
       * @param {object} [options.attributes]
       * @param {string|object} [options.layerId]
       * @param {object} [options.extras]
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
      dealAddSymbol: function (options,defaultSymbol) {
        options = options || {};
        if(defaultSymbol.type === "picturemarkersymbol") {
          defaultSymbol.url = this.getImageAbsPath('marker','default','marker.png');
        }
        options.symbol = options.symbol || defaultSymbol;
        return options;
      },
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
      deactivateEdit: function () {
        this.editToolbar.deactivate();
      },

      /**
       * @description clearDrawLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of clearDrawLayer</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(gisObject);
       *   instance.clearDrawLayer();
       * })
       *
       *
       *
       */
      clearDrawLayer: function () {
        this.drawLayer && this.drawLayer.clear();
      },
      clearAddLayer: function () {
        this.addLayer && this.addLayer.clear();
      },
      removeGraphic: function (grahic) {

      },
      /**
       * @description removeGraphicOfDrawLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {string} graphic
       *
       * @example
       * <caption>Usage of removeDrawGraphic</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(gisObject);
       *   instance.removeGraphicOfDrawLayer(graphic);
       * })
       */
      removeGraphicOfDrawLayer: function (graphic) {
        graphic && this.drawLayer.remove(graphic);
      },
      removeGraphicOfAddLayer: function (graphic) {
        graphic && this.addLayer.remove(graphic);
      },


      /**
       * @description setMouseCursor
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {number} type
       *
       * @example
       * <caption>Usage of setMouseCursor</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
       *   var instance = new ToolBar(gisObject);
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
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of deactivateToolbar</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.deactivateToolbar();
     * })
       *
       *
       *
       */
      deactivateToolbar: function () {
        this.navToolbar.deactivate();
        this.drawToolbar.deactivate();
        this.measureToolbar.deactivate();
      },

      /**
       * @description zoomIn
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of zoomIn</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.zoomIn();
     * })
       *
       *
       *
       */
      zoomIn: function () {
        this.setMouseCursor(extras.control.ToolBar.ZOOMIN);
        this.deactivateToolbar();
        this.navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
      },

      /**
       * @description zoomOut
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of zoomOut</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.zoomOut();
     * })
       *
       *
       *
       */
      zoomOut: function () {
        this.setMouseCursor(extras.control.ToolBar.ZOOMOUT);
        this.deactivateToolbar();
        this.navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
      },

      /**
       * @description pan
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of pan</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.pan();
     * })
       *
       *
       *
       */
      pan: function () {
        //this.setMouseCursor(extras.control.ToolBar.ZOOMOUT);
        this.deactivateToolbar();
        this.navToolbar.activate(esri.toolbars.Navigation.PAN);
      },

      /**
       * @description fullExtent
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of fullExtent</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.fullExtent();
     * })
       *
       *
       *
       */
      fullExtent: function () {
        this.navToolbar.zoomToFullExtent();
      },

      /**
       * @description previous
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of previous</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.previous();
     * })
       *
       *
       *
       */
      previous: function () {
        this.navToolbar.zoomToPrevExtent();
      },

      /**
       * @description next
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of next</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.next();
     * })
       *
       *
       *
       */
      next: function () {
        this.navToolbar.zoomToNextExtent();
      },

      /**
       * @description measureLength
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of measureLength</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.measureLength();
     * })
       *
       *
       *
       */
      measureLength: function () {
        this.deactivateToolbar();
        this.measureToolbar.activate(esri.toolbars.draw.POLYLINE);
      },

      /**
       * @description measureArea
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of measureArea</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.measureArea();
     * })
       *
       *
       *
       */
      measureArea: function () {
        this.deactivateToolbar();
        this.measureToolbar.activate(esri.toolbars.draw.POLYGON);
      },



      /**
       * @description clearTrackLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of clearTrackLayer</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.clearTrackLayer();
     * })
       *
       *
       *
       */
      clearTrackLayer: function () {
        this.trackLayer && this.trackLayer.clear();
      },

      /**
       * @description clearTmptrackLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of clearTmptrackLayer</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.clearTmptrackLayer();
     * })
       *
       *
       *
       */
      clearTmptrackLayer: function () {
        this.tmpTrackLayer && this.tmpTrackLayer.clear();
      },

      /**
       * @description clearMeasureLayer
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of clearMeasureLayer</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.clearMeasureLayer();
     * })
       *
       *
       *
       */
      clearMeasureLayer: function () {
        this.measureToolbar.clearAll();
      },

      /**
       * @description clear
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of clear</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.clear();
     * })
       *
       *
       *
       */
      clear: function () {
        this.setMouseCursor(extras.control.ToolBar.PAN);
        if (this.measureToolbar) {
          this.measureToolbar.clearAll();
        }
        if (this.map) {
          this.map.graphics.clear();
        }
        this.pan();
      },

      /**
       * @description print
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of print</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.print();
     * })
       *
       *
       *
       */
      print: function () {

      },

      /**
       * @description showMessageWidget
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of showMessageWidget</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.showMessageWidget();
     * })
       *
       *
       *
       */
      showMessageWidget: function () {

      },

      /**
       * @description destroy
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of destroy</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.destroy();
     * })
       *
       *
       *
       */
      destroy: function () {
        this.clear();
        this.navToolbar = null;
        this.drawToolbar = null;
        this.measureToolbar = null;
        this.map = null;
        this.gisObject = null;
      },

      /**
       * @description setCenter
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {number} x
       * @param {number} y
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of setCenter</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.setCenter(x,y,zoom);
     * })
       *
       *
       *
       */
      setCenter: function (x, y, zoom) {
        this.map.centerAtZoom();
      },

      /**
       * @description getCenter
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of getCenter</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.getCenter();
     * })
       *
       *
       * @returns {*}
       */
      getCenter: function () {
        return this.map.center;
      },

      /**
       * @description getExtent
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of getExtent</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.getExtent();
     * })
       *
       *
       * @returns {*}
       */
      getExtent: function () {
        return this.map.extent;
      },

      /**
       * @description getScale
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of getScale</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.getScale();
     * })
       *
       *
       * @returns string
       */
      getScale: function () {
        return this.map.getScale();
      },

      /**
       * @description zoomToExtent
       * @method
       * @memberOf module:extras/control/ToolBar#
       *
       *
       * @example
       * <caption>Usage of zoomToExtent</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.zoomToExtent();
     * })
       *
       *
       *
       */
      zoomToExtent: function () {

      },

      /**
       * @description getLayerByName
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {number} layerName
       *
       * @example
       * <caption>Usage of getLayerByName</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.getLayerByName(layerName);
     * })
       *
       *
       *
       */
      getLayerByName: function (layerName) {

      },

      /**
       * @description getLayerById
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {number} layerId
       *
       * @example
       * <caption>Usage of getLayerById</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.getLayerById(layerId);
     * })
       *
       *
       *
       */
      getLayerById: function (layerId) {
        this.map.getLayer(layerId);
      },

      /**
       * @description bindMapEvents
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {string} evtName
       * @param {function} bindFunction
       *
       * @example
       * <caption>Usage of bindMapEvents</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.bindMapEvents(evtName,bindFunction);
     * })
       *
       *
       *
       */
      bindMapEvents: function (evtName, bindFunction) {

      },

      /**
       * @description showInfoWindow
       * @method
       * @memberOf module:extras/control/ToolBar#
       * @param {number} geometry
       *
       * @example
       * <caption>Usage of showInfoWindow</caption>
       * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.showInfoWindow(geometry);
     * })
       *
       *
       *
       */
      showInfoWindow: function (geometry) {
        this.gisObject.layerLocate.unHightlightOnMap();

      }
    });
  });
