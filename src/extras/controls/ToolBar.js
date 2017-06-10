/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a ToolBar.
* @module extras/control/ToolBar
*
* 
* @requires esri.layers.GraphicsLayer 
* @requires esri.toolbars.navigation 
* @requires esri.toolbars.draw 
* @requires extras.tools.MeasureDrawTool 
* @requires esri.symbols.SimpleFillSymbol 
* @requires esri.symbols.SimpleLineSymbol 
* @requires esri.symbols.SimpleMarkerSymbol 
* @requires esri.symbols.PictureMarkerSymbol 
* @requires esri.symbols.Font 
* @requires esri.symbols.TextSymbol 
*/
define(["esri/layers/GraphicsLayer", "esri/toolbars/navigation", "esri/toolbars/draw", "extras/tools/MeasureDrawTool", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/Font", "esri/symbols/TextSymbol"],
function(
GraphicsLayer, navigation, draw, MeasureDrawTool, SimpleFillSymbol, SimpleLineSymbol, SimpleMarkerSymbol, PictureMarkerSymbol, Font, TextSymbol) {
  return declare(null,
  /**  @lends module:extras/control/ToolBar */
  {

    /** @member 
	gisObject */
    gisObject: null,

    /** @member 
	map */
    map: null,

    /**
     * @constructs
     * @param {object} gisObject
     */
    constructor: function(gisObject) {

      this.gisObject = gisObject;

      dojo.subscribe("mapLoadedEvent", this, "initToolbar");

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
     * 
     *
     * 
     */
    initToolbar: function(map) {
      this.map = map;
      try {
        this.navToolbar = new esri.toolbars.Navigation(this.map);
        this.drawToolbar = new esri.toolbars.Draw(this.map);
        this.measureToolbar = new extras.tools.MeasureDrawTool(this.map);

        this.drawLayer = new esri.layers.GraphicsLayer({
          id: "GXX_GIS_DRAW_LAYER"
        });
        this.trackLayer = new esri.layers.GraphicsLayer({
          id: "GXX_GIS_ALL_TRACK_LAYER"
        });
        this.tmpTrackLayer = new esri.layers.GraphicsLayer({
          id: "GXX_GIS_TEMP_TRACK_LAYER"
        });
        this.map.addLayer(this.drawLayer);
        this.map.addLayer(this.trackLayer);
        this.map.addLayer(this.tmpTrackLayer);
        this.pan();
      } catch(e) {

}

      dojo.publish("toolBarLoadedEvent", [this]);
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
     * 
     *
     * 
     */
    setMouseCursor: function(type) {
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
     * @description removeDrawGraphic
     * @method
     * @memberOf module:extras/control/ToolBar#
     * @param {string} graphic
     * 
     * @example
     * <caption>Usage of removeDrawGraphic</caption>
     * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.removeDrawGraphic(graphic);
     * })
     * 
     *
     * 
     */
    removeDrawGraphic: function(graphic) {
      if (graphic) {
        this.drawLayer.remove(graphic);
      }
    },

    /**
     * @description draw
     * @method
     * @memberOf module:extras/control/ToolBar#
     * @param {number} type
     * @param {number}  symbol
     * @param {string}  handler
     * @param {string}  handler_before
     * @param {number} idKey
     * 
     * @example
     * <caption>Usage of draw</caption>
     * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.draw(type, symbol, handler, handler_before,idKey);
     * })
     * 
     *
     * 
     */
    draw: function(type, symbol, handler, handler_before, idKey) {
      this.deactivateToolbar();
      switch (type) {
      case esri.toolbars.draw.POINT:
      case esri.toolbars.draw.MULTI_POINT:
        this.drawToolbar.setMarkerSymbol(symbol || extras.control.ToolBar.POINT);
        break;
      case esri.toolbars.draw.POLYLINE:
        this.drawToolbar.setLineSymbol(symbol || extras.control.ToolBar.POLYLINE);
        break;
      case esri.toolbars.draw.ARROW:
        this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
        break;
      case esri.toolbars.draw.POLYGON:
        this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
        break;
      case esri.toolbars.draw.CIRCLE:
        this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
        break;
      case esri.toolbars.draw.EXTENT:
        this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
        break;
      default:
        this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
        break;
      }
      var onDrawEndHandler = dojo.connect(this.drawToolbar, "onDrawEnd", dojo.hitch(this,
      function(geometry) {
        this.drawToolbar.deactivate();

        var graphic = new esri.Graphic(geometry, symbol);
        idKey && (graphic.id = idKey);
        this.drawLayer.add(graphic);

        if (onDrawEndHandler) {
          dojo.disconnect(onDrawEndHandler);
        }
        if (handler) {
          handler(graphic);
        }
      }));

      this.drawToolbar.activate(type);
    },

    /**
     * @description indraw
     * @method
     * @memberOf module:extras/control/ToolBar#
     * @param {number} type
     * @param {number}  symbol
     * @param {string}  handler
     * @param {string}  handler_before
     * @param {number} idKey
     * 
     * @example
     * <caption>Usage of indraw</caption>
     * require(['extras/control/ToolBar'],function(ToolBar){
     *   var instance = new ToolBar(gisObject);
     *   instance.indraw(type, symbol, handler, handler_before,idKey);
     * })
     * 
     *
     * 
     */
    indraw: function(type, symbol, handler, handler_before, idKey) {
      type = type.toLowerCase().replace(/_/g, "");

      this.deactivateToolbar();
      this.drawToolbar.activate(type);

      var renderSymbol = symbol;
      switch (type) {
      case "point":
      case "multipoint":
        renderSymbol = symbol || extras.control.ToolBar.POINT;
        this.drawToolbar.setMarkerSymbol(renderSymbol);
        break;
      case "polyline":
      case "freehandpolyline":
        renderSymbol = symbol || extras.control.ToolBar.POLYLINE;
        this.drawToolbar.setLineSymbol(renderSymbol);
        break;
      default:
        renderSymbol = symbol || extras.control.ToolBar.POLYGON;
        this.drawToolbar.setFillSymbol(renderSymbol);
        break;
      }

      var onDrawEndHandler = dojo.connect(this.drawToolbar, "onDrawEnd", dojo.hitch(this,
      function(geometry) {
        this.drawToolbar.deactivate();

        var graphic = new esri.Graphic(geometry, renderSymbol);
        idKey && (graphic.id = idKey);
        this.drawLayer.add(graphic);

        if (onDrawEndHandler) {
          dojo.disconnect(onDrawEndHandler);
        }
        if (handler) {
          handler(graphic);
        }
      }));

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
    deactivateToolbar: function() {
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
    zoomIn: function() {
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
    zoomOut: function() {
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
    pan: function() {
      this.setMouseCursor(extras.control.ToolBar.ZOOMOUT);
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
    fullExtent: function() {
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
    previous: function() {
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
    next: function() {
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
    measureLength: function() {
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
    measureArea: function() {
      this.deactivateToolbar();
      this.measureToolbar.activate(esri.toolbars.draw.POLYGON);
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
    clearDrawLayer: function() {
      this.drawLayer && this.drawLayer.clear();
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
    clearTrackLayer: function() {
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
    clearTmptrackLayer: function() {
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
    clearMeasureLayer: function() {
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
    clear: function() {
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
    print: function() {

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
    showMessageWidget: function() {

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
    destroy: function() {
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
    setCenter: function(x, y, zoom) {
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
    getCenter: function() {
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
    getExtent: function() {
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
    getScale: function() {
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
    zoomToExtent: function() {

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
    getLayerByName: function(layerName) {

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
    getLayerById: function(layerId) {
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
    bindMapEvents: function(evtName, bindFunction) {

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
    showInfoWindow: function(geometry) {
      this.gisObject.layerLocate.unHightlightOnMap();

    }
  });

  dojo.mixin(extras.control.ToolBar, {
    "PAN": "1",
    "ZOOMIN": "2",
    "ZOOMOUT": "3",
    "POLYGON": "4",
    "POLYLINE": "5",
    "POINT": "6",
    "EXTENT": "7",
    "IDENTIFY": "8",
    "OVAL": "9",
    "POSITION": "10"
  });
  dojo.mixin(extras.control.ToolBar, {
    "POINT": new esri.symbols.SimpleMarkerSymbol({
      "color": [255, 255, 255, 64],
      "size": 24,
      "angle": -30,
      "xoffset": 0,
      "yoffset": 0,
      "type": "esriSMS",
      "style": "esriSMSCircle",
      "outline": {
        "color": [255, 0, 0, 255],
        "width": 3,
        "type": "esriSLS",
        "style": "esriSLSSolid"
      }
    }),
    "POLYLINE": new esri.symbols.SimpleLineSymbol({
      type: "esriSLS",
      style: "esriSLSSolid",
      width: 2,
      color: [255, 0, 0, 255]
    }),
    "POLYGON": new esri.symbols.SimpleFillSymbol({
      type: "esriSFS",
      style: "esriSFSSolid",
      color: [0, 0, 0, 64],
      outline: {
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      }
    })

  })
});