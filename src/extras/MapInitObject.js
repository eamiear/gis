/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a MapInitObject.
* @module extras/MapInitObject
*
* 
* @requires dojo.dom-construct 
* @requires esri.map 
* @requires esri.graphic 
* @requires esri.Color 
* @requires esri.SpatialReference 
* @requires esri.geometry.Point 
* @requires esri.geometry.Polyline 
* @requires esri.geometry.webMercatorUtils 
* @requires esri.symbols.PictureFillSymbol 
* @requires esri.symbols.PictureMarkerSymbol 
* @requires esri.symbols.SimpleLineSymbol 
* @requires extras.control.ToolBar 
* @requires extras.control.LayerLocate 
* @requires extras.control.LayerDraw 
* @requires extras.control.MapControl 
* @requires extras.control.LayerManager 
* @requires extras.control.LayerQuery 
* @requires extras.InfoWindow 
* @requires extras.utils.MapUtil 
* @requires esri.dijit.OverviewMap 
* @requires extras.utils.GPSConvertor 
* @requires extras.layer.BaiduTiledMap 
* @requires extras.symbol.ArrowLineSymbol 
* @requires extras.layer.FlareClusterLayer 
* @requires esri.renderers.ClassBreaksRenderer 
* @requires esri.dijit.PopupTemplate 
*/
define(["dojo/dom-construct", "esri/map", "esri/graphic", "esri/Color", "esri/SpatialReference", "esri/geometry/Point", "esri/geometry/Polyline", "esri/geometry/webMercatorUtils", "esri/symbols/PictureFillSymbol", "esri/symbols/PictureMarkerSymbol", "esri/symbols/SimpleLineSymbol", "extras/control/ToolBar", "extras/control/LayerLocate", "extras/control/LayerDraw", "extras/control/MapControl", "extras/control/LayerManager", "extras/control/LayerQuery", "extras/InfoWindow", "extras/utils/MapUtil", "esri/dijit/OverviewMap", "extras/utils/GPSConvertor", "extras/layer/BaiduTiledMap", "extras/symbol/ArrowLineSymbol", "extras/layer/FlareClusterLayer", "esri/renderers/ClassBreaksRenderer", "esri/dijit/PopupTemplate"],
function(
construct, map, graphic, Color, SpatialReference, Point, Polyline, webMercatorUtils, PictureFillSymbol, PictureMarkerSymbol, SimpleLineSymbol, ToolBar, LayerLocate, LayerDraw, MapControl, LayerManager, LayerQuery, InfoWindow, MapUtil, OverviewMap, GPSConvertor, BaiduTiledMap, ArrowLineSymbol, FlareClusterLayer, ClassBreaksRenderer, PopupTemplate) {
  return declare(null,
  /**  @lends module:extras/MapInitObject */
  {

    /** @member 
	mapId */
    mapId: null,

    /** @member 
	map */
    map: null,

    /** @member 
	mapParam */
    mapParam: null,

    /** @member 
	curLayer */
    curLayer: {},

    /** @member 
	baseLayer  */
    baseLayer: [],

    /** @member 
	imageLayer  */
    imageLayer: [],

    /** @member 
	currentOptions  */
    currentOptions: null,

    /** @member 
	displaySingleFlaresAtCount */
    displaySingleFlaresAtCount: 10,

    /** @member 
	preClustered */
    preClustered: false,

    /** @member 
	areaDisplayMode */
    areaDisplayMode: null,

    /**
     * @constructs
     * @param {string} divId
     * @param {object} options
     */
    constructor: function(divId, options) {

      dojo.byId(divId).onselectstart = dojo.byId(divId).ondrag = function() {
        return false;
      };
      this.mapId = divId;

      dojo.subscribe("mapLoadedEvent", this, "loadMapCompelete");

      this.spatialReference = new esri.SpatialReference({
        wkid: 102100
      });

      this.layerManager = new extras.control.LayerManager();

      this.layerQuery = new extras.control.LayerQuery();

      this.layerLocate = new extras.control.LayerLocate();

      this.toolbar = new extras.control.ToolBar(this);

      this.baseUtil = new extras.utils.MapUtil();

      this.layerDraw = new extras.control.LayerDraw();

      this.mapcontrol = new extras.control.MapControl(this);

      this.bms = {
        ip: null,
        port: null,
        userName: null,
        password: null
      };

      if (options) {
        this.setMapOptions(options);
      }

    },

    /**
     * @description setMapOptions
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} mapParam
     * 
     * @example
     * <caption>Usage of setMapOptions</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.setMapOptions(mapParam);
     * })
     * 
     *
     * 
     */
    setMapOptions: function(mapParam) {
      this.mapParam = mapParam;
      this.currentOptions = {
        logo: false,
        slider: true,
        center: mapParam.center || new esri.geometry.Point(12615151.657772028, 2645790.939302407, this.spatialReference),
        level: 10

      };
      if (this.map) {
        dojo.mixin(this.map, this.currentOptions);
      } else {
        this.map = new esri.Map(this.mapId, this.currentOptions);
        this.map.spatialReference = new esri.SpatialReference({
          wkid: 102113
        });

        var mapLoadHandle = dojo.connect(this.map, "onLoad", dojo.hitch(this,
        function(map) {
          setTimeout(dojo.hitch(this,
          function() {
            if (this.currentOptions.center) {
              if (this.map.center !== this.currentOptions.center) {

                this.map.centerAndZoom(this.currentOptions.center, this.currentOptions.zoom || 10);
              }
            }
            dojo.publish("mapLoadedEvent", [this.map]);
          }), 1000);
          dojo.disconnect(mapLoadHandle);
        }));
      }

      this.removeCurLayers();
    },

    /**
     * @description addDefaultLayers
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addDefaultLayers</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addDefaultLayers();
     * })
     * 
     *
     * 
     */
    addDefaultLayers: function() {
      this.addLayers([{
        "id": "100",
        "layerId": "GXX_XXXXX",
        "online": false,
        "name": "谷歌电子地图",
        "suffix": "png",
        "tileSize": "256",
        "tileType": "googlemap",
        "mapStyle": "roadmap",
        "tile_url": gisConfig.maptiledCacheUrl
      }]);
    },

    /**
     * @description addLayers
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {number} layers
     * 
     * @example
     * <caption>Usage of addLayers</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addLayers(layers);
     * })
     * 
     *
     * 
     */
    addLayers: function(layers) {
      if (! (layers instanceof Array)) {
        layers = [layers];
      }

      dojo.forEach(layers, dojo.hitch(this,
      function(layerObj, index) {
        var layer = this.createLayer(layerObj);
        if (layer) {
          this.map.addLayer(layer);

          if (layerObj.featureType == "7") {
            this.imageLayer.push(layer);
          } else {
            this.baseLayer.push(layer);
          }
          this.curLayer[layerObj.name + "_" + layerObj.id] = layer;
        }
      }));
    },

    /**
     * @description createLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createLayer(layerObj);
     * })
     * 
     *
     * @returns string
     */
    createLayer: function(layerObj) {
      var layerType = layerObj.tileType.toLowerCase();
      if (layerType == "tiled") {
        return this.createTiledLayer(layerObj);
      } else if (layerType == "dynamic") {
        return this.createDynamicLayer(layerObj);
      } else if (layerType == "graphiclayer") {
        return this.createGraphicLayer(layerObj);
      } else if (layerType == "feature") {
        return this.createFeatureLayer(layerObj);
      } else if (layerType == "image") {
        return this.createImageLayer(layerObj);
      } else if (layerType == "wms") {
        return this.createWMSLayer(layerObj);
      } else if (layerType == "wfs") {
        return this.createWFSLayer(layerObj);
      } else if (layerType == "googlemap") {
        return this.createGoogleMapLayer(layerObj);
      } else if (layerType == "baidumap") {
        return this.createBaiDuMapLayer(layerObj);
      } else if (layerType == "tianditu") {
        return this.createTianDiTuLayer(layerObj);
      }
    },

    /**
     * @description switchRoadMap
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of switchRoadMap</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.switchRoadMap();
     * })
     * 
     *
     * 
     */
    switchRoadMap: function() {
      dojo.forEach(this.imageLayer,
      function(layerObj, index) {
        layerObj.setVisibility(false);
      });

      dojo.forEach(this.baseLayer,
      function(layerObj, index) {
        layerObj.setVisibility(true);
      });
    },

    /**
     * @description switchSatelliteMap
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of switchSatelliteMap</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.switchSatelliteMap();
     * })
     * 
     *
     * 
     */
    switchSatelliteMap: function() {
      dojo.forEach(GisObject.baseLayer,
      function(layerObj, index) {
        layerObj.setVisibility(false);
      });

      dojo.forEach(GisObject.imageLayer,
      function(layerObj, index) {
        layerObj.setVisibility(true);
      });
    },

    /**
     * @description setInitCenter
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {number} x
     * @param {number} y
     * @param {number} zoom
     * 
     * @example
     * <caption>Usage of setInitCenter</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.setInitCenter(x,y,zoom);
     * })
     * 
     *
     * 
     */
    setInitCenter: function(x, y, zoom) {
      var xys = esri.geometry.webMercatorUtils.lngLatToXY(x, y);
      var centerPt = new esri.geometry.Point(xys[0], xys[1], this.spatialReference);
      if (this.map) {
        this.map.centerAndZoom(centerPt, parseInt(zoom) || 10);
      }
    },

    /**
     * @description addZoomBar
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addZoomBar</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addZoomBar();
     * })
     * 
     *
     * @returns {*}
     */
    addZoomBar: function() {
      if (!this.zoomBar) {
        this.zoomBar = "";
      }
      return this.zoomBar;
    },

    /**
     * @description addCoordinate
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addCoordinate</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addCoordinate();
     * })
     * 
     *
     * @returns {*}
     */
    addCoordinate: function() {
      if (!this.mousePosition) {

}
      return addCoordinate;
    },

    /**
     * @description showOverViewerMap
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of showOverViewerMap</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.showOverViewerMap();
     * })
     * 
     *
     * 
     */
    showOverViewerMap: function() {

},

    /**
     * @description loadMapCompelete
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {string} map
     * 
     * @example
     * <caption>Usage of loadMapCompelete</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.loadMapCompelete(map);
     * })
     * 
     *
     * 
     */
    loadMapCompelete: function(map) {
      dojo.require("extras.widget.ToolPanelWidget");
      var theDiv = document.createElement("div");
      var mapDiv = dojo.byId(this.map.id);
      mapDiv.appendChild(theDiv);

    },

    /**
     * @description addToolPanel
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addToolPanel</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addToolPanel();
     * })
     * 
     *
     * @returns {*}
     */
    addToolPanel: function() {
      if (!this.toolPanel) {
        dojo.require("extras.widget.ToolPanelWidget");

      }
      return this.toolPanel;
    },

    /**
     * @description addScalebar
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addScalebar</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addScalebar();
     * })
     * 
     *
     * @returns {*}
     */
    addScalebar: function() {
      if (!this.scalebar) {

}
      return this.scalebar;
    },

    /**
     * @description addRightMenu
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addRightMenu</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addRightMenu();
     * })
     * 
     *
     * @returns {*}
     */
    addRightMenu: function() {
      if (!this.rightMenu) {

} else {

}
      return this.rightMenu;
    },

    /**
     * @description addLayerLabel
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of addLayerLabel</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.addLayerLabel();
     * })
     * 
     *
     * @returns {*}
     */
    addLayerLabel: function() {
      if (!this.label) {

}
      return this.label;
    },

    /**
     * @description createTiledLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createTiledLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createTiledLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createTiledLayer: function(layerObj) {
      dojo.require("esri.layers.ArcGISTiledMapServiceLayer");
      var layer = new esri.layers.ArcGISTiledMapServiceLayer(layerObj);
      return layer;
    },

    /**
     * @description createGraphicLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createGraphicLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createGraphicLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createGraphicLayer: function(layerObj) {
      dojo.require("esri.layers.GraphicsLayer");
      var layer = new esri.layers.GraphicsLayer(layerObj);
      return layer;
    },

    /**
     * @description createDynamicLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createDynamicLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createDynamicLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createDynamicLayer: function(layerObj) {
      dojo.require("esri.layers.ArcGISDynamicMapServiceLayer");
      var layer = new esri.layers.ArcGISDynamicMapServiceLayer(layerObj);
      return layer;
    },

    /**
     * @description createFeatureLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createFeatureLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createFeatureLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createFeatureLayer: function(layerObj) {
      dojo.require("esri.layers.FeatureLayer");
      var layer = new esri.layers.FeatureLayer(layerObj);
      return layer;
    },

    /**
     * @description createImageLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createImageLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createImageLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createImageLayer: function(layerObj) {
      dojo.require("esri.layers.ArcGISImageServiceLayer");
      var layer = new esri.layers.ArcGISImageServiceLayer(layerObj);
      return layer;
    },

    /**
     * @description createWMSLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createWMSLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createWMSLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createWMSLayer: function(layerObj) {
      dojo.require("esri.layers.WMSLayer");
      var layer = new esri.layers.WMSLayer(layerObj);
      return layer;
    },

    /**
     * @description createWFSLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createWFSLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createWFSLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createWFSLayer: function(layerObj) {
      dojo.require("esri.layers.WFSLayer");
      var layer = new esri.layers.WFSLayer(layerObj);
      return layer;;
    },

    /**
     * @description createGoogleMapLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createGoogleMapLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createGoogleMapLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createGoogleMapLayer: function(layerObj) {
      dojo.require("extras.layer.GoogleTiledMap");
      var layer = new extras.layer.GoogleTiledMap(layerObj);
      return layer;
    },

    /**
     * @description createBaiDuMapLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createBaiDuMapLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createBaiDuMapLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createBaiDuMapLayer: function(layerObj) {
      var layer = new extras.layer.BaiduTiledMap(layerObj);
      return layer;
    },

    /**
     * @description createTianDiTuLayer
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {object} layerObj
     * 
     * @example
     * <caption>Usage of createTianDiTuLayer</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.createTianDiTuLayer(layerObj);
     * })
     * 
     *
     * @returns {*}
     */
    createTianDiTuLayer: function(layerObj) {
      dojo.require("extras.layer.TianDiTuTiledMap");
      var layer = new extras.layer.TianDiTuTiledMap(layerObj);
      return layer;
    },

    /**
     * @description removeCurLayers
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of removeCurLayers</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.removeCurLayers();
     * })
     * 
     *
     * 
     */
    removeCurLayers: function() {
      this.curLayer = {};
      this.baseLayer = [];
      this.imageLayer = [];
    },

    /**
     * @description destroy
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of destroy</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.destroy();
     * })
     * 
     *
     * 
     */
    destroy: function() {
      if (this.mapcontrol) {
        this.mapcontrol.destroy();
      }

      if (this.infoCloseHandle) {
        dojo.disconnect(this._infoCloseHandle);
      }
      if (this.zoomBar) {
        this.zoomBar.destroy();
        this.zoomBar = null;
      }
      if (this.omap) {
        this.omap.destroy();
        this.omap = null;
      }
      if (this.scalebar) {
        this.scalebar.destroy();
        this.scalebar = null;
      }
      if (this.rightMenu) {
        this.rightMenu.clearBufferResult();
      }
      if (this.label) {
        this.label.destroy();
        this.label = null;
      }
      if (this.toolbar) {
        this.toolbar.destroy();
      }

      if (this.map != null) {

        this.map.destroy();
        this.map = null;
      }
    },

    /**
     * @description drawDefaultTrack
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of drawDefaultTrack</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.drawDefaultTrack();
     * })
     * 
     *
     * 
     */
    drawDefaultTrack: function() {
      var picSymbol = new esri.symbols.PictureMarkerSymbol();
      picSymbol.setUrl(selfUrl + "/themes/default/img/filled-arrow.png");
      picSymbol.setHeight(12);
      picSymbol.setWidth(12);

      var pgOptions = {
        style: esri.symbols.SimpleLineSymbol.STYLE_SOLID,
        color: new esri.Color([255, 0, 0]),
        width: 3,
        directionSymbol: "arrow3",
        directionPixelBuffer: 80,
        directionColor: new esri.Color([255, 0, 0]),
        directionSize: 16,
        directionScale: 1
      };

      var basicSymbol = new extras.symbol.ArrowLineSymbol(pgOptions);
      var points = [[113.316, 23.12], [113.3474, 23.1315], [113.3655, 23.11393]];
      var basicPolyline = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Polyline(points));
      var bg = new esri.Graphic(basicPolyline, basicSymbol, {},
      null);

      if (this.toolbar.drawLayer) {
        this.toolbar.drawLayer.add(bg);
      }

      basicSymbol.stopAnimation();
      basicSymbol.animateDirection(20, 350);
    },

    /**
     * @description loadDefaultCluster
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of loadDefaultCluster</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.loadDefaultCluster();
     * })
     * 
     *
     * 
     */
    loadDefaultCluster: function() {
      var clusterLayer = new extras.layer.FlareClusterLayer({
        id: "flare-cluster-layer",
        spatialReference: this.spatialReference,
        subTypeFlareProperty: "facilityType",
        singleFlareTooltipProperty: "name",
        displaySubTypeFlares: true,
        displaySingleFlaresAtCount: this.displaySingleFlaresAtCount,
        flareShowMode: "mouse",
        preClustered: this.preClustered,
        clusterRatio: 65,
        clusterAreaDisplay: this.areaDisplayMode,

        /**
     * @description clusteringBegin
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of clusteringBegin</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.clusteringBegin();
     * })
     * 
     *
     * 
     */
        clusteringBegin: function() {
          console.log("clustering begin");
        },

        /**
     * @description clusteringComplete
     * @method
     * @memberOf module:extras/MapInitObject#
     * 
     * 
     * @example
     * <caption>Usage of clusteringComplete</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.clusteringComplete();
     * })
     * 
     *
     * 
     */
        clusteringComplete: function() {
          console.log("clustering complete");
        }
      });

      var defaultSym = new esri.symbols.SimpleMarkerSymbol().setSize(6).setColor("#FF0000").setOutline(null)
      var renderer = new esri.renderers.ClassBreaksRenderer(defaultSym, "clusterCount");
      var xlSymbol = new esri.symbols.SimpleMarkerSymbol(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 32, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([200, 52, 59, 0.8]), 1), new dojo.Color([250, 65, 74, 0.8]));
      var lgSymbol = new esri.symbols.SimpleMarkerSymbol(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 28, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([41, 163, 41, 0.8]), 1), new dojo.Color([51, 204, 51, 0.8]));
      var mdSymbol = new esri.symbols.SimpleMarkerSymbol(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 24, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([82, 163, 204, 0.8]), 1), new dojo.Color([102, 204, 255, 0.8]));
      var smSymbol = new esri.symbols.SimpleMarkerSymbol(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 22, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([230, 184, 92, 0.8]), 1), new dojo.Color([255, 204, 102, 0.8]));
      renderer.addBreak(0, 19, smSymbol);
      renderer.addBreak(20, 150, mdSymbol);
      renderer.addBreak(151, 1000, lgSymbol);
      renderer.addBreak(1001, Infinity, xlSymbol);

      if (this.areaDisplayMode) {

        var defaultAreaSym = new esri.symbols.SimpleFillSymbol().setStyle(esri.symbols.SimpleFillSymbol.STYLE_SOLID).setColor(new dojo.Color([0, 0, 0, 0.2])).setOutline(new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([0, 0, 0, 0.3]), 1));
        var areaRenderer = new esri.renderers.ClassBreaksRenderer(defaultAreaSym, "clusterCount");
        var xlAreaSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([200, 52, 59, 0.8]), 1), new dojo.Color([250, 65, 74, 0.8]));
        var lgAreaSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([41, 163, 41, 0.8]), 1), new dojo.Color([51, 204, 51, 0.8]));
        var mdAreaSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([82, 163, 204, 0.8]), 1), new dojo.Color([102, 204, 255, 0.8]));
        var smAreaSymbol = new esri.symbols.SimpleFillSymbol(esri.symbols.SimpleFillSymbol.STYLE_SOLID, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([230, 184, 92, 0.8]), 1), new dojo.Color([255, 204, 102, 0.8]));

        areaRenderer.addBreak(0, 19, smAreaSymbol);
        areaRenderer.addBreak(20, 150, mdAreaSymbol);
        areaRenderer.addBreak(151, 1000, lgAreaSymbol);
        areaRenderer.addBreak(1001, Infinity, xlAreaSymbol);

        clusterLayer.setRenderer(renderer, areaRenderer);
      }
      else {
        clusterLayer.setRenderer(renderer);
      }

      var template = new esri.dijit.PopupTemplate({
        title: "{name}",
        fieldInfos: [{
          fieldName: "facilityType",
          label: "Facility Type",
          visible: true
        },
        {
          fieldName: "postcode",
          label: "Post Code",
          visible: true
        },
        {
          fieldName: "isOpen",
          label: "Opening Hours",
          visible: true
        }]
      });
      clusterLayer.infoTemplate = template;
      this.map.infoWindow.titleInBody = false;
      this.map.addLayer(clusterLayer);

      var data = [];
      for (var i = 0,
      il = 5000; i < il; i++) {
        var aa = esri.geometry.webMercatorUtils.xyToLngLat(12557877.595482401, 2596928.9267310356, true);
        var bb = esri.geometry.webMercatorUtils.xyToLngLat(12723134.450635016, 2688653.360673282, true);
        var ptX = this.getRandom(aa[0], bb[0]);
        var ptY = this.getRandom(aa[1], bb[1]);

        var pt = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(ptX, ptY));

        data.push({
          "name": "cluster_" + i,
          "facilityType": "Gxx_" + (i % 10),
          "x": pt.x,
          "y": pt.y
        });
      }

      clusterLayer.addData(data);

    },

    /**
     * @description getRandom
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {number} max
     * @param {number} min
     * 
     * @example
     * <caption>Usage of getRandom</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.getRandom(max,min);
     * })
     * 
     *
     * @returns string
     */
    getRandom: function(max, min) {
      return min + Math.random() * (max - min);
    },

    /**
     * @description test
     * @method
     * @memberOf module:extras/MapInitObject#
     * @param {number} x
     * @param {number} y
     * 
     * @example
     * <caption>Usage of test</caption>
     * require(['extras/MapInitObject'],function(MapInitObject){
     *   var instance = new MapInitObject(divId,options);
     *   instance.test(x,y);
     * })
     * 
     *
     * 
     */
    test: function(x, y) {

      var pointObj = extras.utils.GPSConvertor.transferWgs84ToBaidu(x, y);

      var pt01 = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(pointObj.lon, pointObj.lat));
      var pt02 = extras.utils.MapUtil.geographicToWebMercator(new esri.geometry.Point(x, y));
    }

  })
});