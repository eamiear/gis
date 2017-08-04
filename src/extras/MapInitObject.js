/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a MapInitObject.
 * @module extras/MapInitObject
 *
 * @requires dojo._base.declare
 * @requires dojo._base.lang
 * @requires dojo._base.array
 * @requires esri.map
 * @requires esri.graphic
 * @requires dojo.Color
 * @requires esri.SpatialReference
 * @requires esri.geometry.Point
 * @requires esri.geometry.Polyline
 * @requires esri.geometry.webMercatorUtils
 * @requires esri.symbols.SimpleLineSymbol
 * @requires extras.controls.ToolBar
 * @requires extras.controls.LayerLocate
 * @requires extras.controls.LayerDraw
 * @requires extras.controls.MapControl
 * @requires extras.controls.LayerManager
 * @requires extras.controls.LayerQuery
 * @requires extras.widgets.infowindow.InfoWindow
 * @requires extras.utils.MapUtil
 * @requires esri.dijit.OverviewMap
 * @requires extras.utils.GPSConvertor
 * @requires extras.layers.BaiduTiledMap
 * @requires extras.layers.GoogleTiledMap
 " @requires extras.layers.TianDiTuTiledMap
 * @requires extras.symbols.ArrowLineSymbol
 * @requires extras.layers.FlareClusterLayer
 * @requires esri.renderers.ClassBreaksRenderer
 * @requires esri.dijit.PopupTemplate
 * @requires esri.layers.ArcGISTiledMapServiceLayer
 * @requires esri.layers.GraphicsLayer
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/on",
    //"dojo/_base/color",
    "esri/map",
    "esri/graphic",
    "esri/SpatialReference",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Extent",
    "esri/geometry/webMercatorUtils",
    "esri/symbols/SimpleLineSymbol",
    "extras/controls/ToolBar",
    //"extras/controls/LocatorControl",
    //"extras/controls/LayerControl",
    //"extras/controls/SearchControl",
    "extras/widgets/infowindow/InfoWindow",
    //"esri/dijit/OverviewMap",
    //"extras/utils/GPSConvertor",
    //"extras/layers/BaiduTiledMap",
    //"extras/layers/GoogleTiledMap",
    //"extras/layers/TianDiTuTiledMap",
    //"extras/symbols/ArrowLineSymbol",
    //"extras/layers/FlareClusterLayer",
    //"esri/renderers/ClassBreaksRenderer",
    "esri/dijit/PopupTemplate"/*,
    "esri/layers/ArcGISTiledMapServiceLayer",
    "esri/layers/GraphicsLayer"*/],
  function (
    declare,
    lang,
    array,
    on,
    //Color,
    Map,
    Graphic,
    SpatialReference,
    Point,
    Polyline,
    Extent,
    webMercatorUtils,
    SimpleLineSymbol,
    ToolBar,
    //LocatorControl,
    //LayerControl,
    //SearchControl,
    InfoWindow,
    //OverviewMap,
    //GPSConvertor,
    //BaiduTiledMap,
    //GoogleTiledMap,
    //TianDiTuTiledMap,
    //ArrowLineSymbol,
    //FlareClusterLayer,
    //ClassBreaksRenderer,
    PopupTemplate/*,
    ArcGISTiledMapServiceLayer,
    GraphicsLayer*/
  ) {
    return declare(null, /**  @lends module:extras/MapInitObject */ {

      /** @member mapId */
      mapId: null,

      /** @member map */
      map: null,

      /** @member curLayer */
      curLayer: {},

      /** @member baseLayer  */
      baseLayer: [],

      /** @member imageLayer  */
      imageLayer: [],

      /** @member currentOptions  */
      currentOptions: null,

      /** @member displaySingleFlaresAtCount */
      displaySingleFlaresAtCount: 10,

      /** @member preClustered */
      preClustered: false,

      /** @member areaDisplayMode */
      areaDisplayMode: null,

      /**
       * @constructs
       * @param {string} divId
       * @param {object} options
       * @param {object} funcOptions
       */
      constructor: function (divId, options,funcOptions) {
        dojo.byId(divId).onselectstart = dojo.byId(divId).ondrag = function () {
          return false;
        };
        this.mapId = divId;
        this.spatialReference = new SpatialReference({wkid: 102100});
        this.gisConfig = gisConfig;
        this.mapCenter = new Point((this.gisConfig.x || 12615151.657772028), (this.gisConfig.y || 2645790.939302407), this.spatialReference);

        this._setMapOptions(options);
        funcOptions && this._setFuncOptions(funcOptions);
        this._init();

        ////图层控制类
        //this.layerControl = new LayerControl(this.map);
        ////图层查询控制类
        //this.searchControl = new SearchControl(this.map);
        ////地图定位类
        //this.locatorControl = new LocatorControl();
        ////地图工具类
        //this.toolbar = new ToolBar(this.map);

        dojo.subscribe("mapLoadedEvent", this, "loadMapCompelete");
      },
      /**
       * @description setMapOptions
       * @private
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} mapOptions
       *
       * @example
       * <caption>Usage of setMapOptions</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId);
       *   instance.setMapOptions(mapOptions);
       * })
       */
      _setMapOptions: function (mapOptions) {
        mapOptions = mapOptions || {};
        this.currentOptions = {
          logo: false,
          slider: true,
         // extent : new Extent(12557877.595482401,2596928.9267310356,12723134.450635016,2688653.360673282, this.spatialReference),
          zoom: 10
        };
        if(mapOptions){
          if(mapOptions.center && !(mapOptions.center instanceof Point)){
            if(mapOptions.center instanceof Array){
              this.mapCenter = new Point(+mapOptions.center[0], +mapOptions.center[1], this.spatialReference);
            }
            if(typeof mapOptions.center === 'string'){
              this.mapCenter = new Point(+mapOptions.center.split(',')[0], +mapOptions.center.split(',')[1], this.spatialReference);
            }
          }
          if(mapOptions.extent && !(mapOptions.extent instanceof Extent)){
            if(mapOptions.extent instanceof Array){
              mapOptions.extent = new Extent(+mapOptions.extent[0], +mapOptions.extent[1], +mapOptions.extent[2], +mapOptions.extent[3], this.spatialReference);
            }
            if(typeof mapOptions.extent === 'string'){
              var extent = mapOptions.extent.split(',');
              mapOptions.extent = new Extent(+extent[0], +extent[1], +extent[2], +extent[3],  this.spatialReference);
            }
          }
        }
        lang.mixin(this.currentOptions, mapOptions);
      },
      _setFuncOptions: function (funcOptions) {
        this.currentFuncOptions = {
          basemap: false,
          navigation: false,
          basictools: false
        };
        lang.mixin(this.currentFuncOptions,funcOptions || {});
      },
      _setInitExtent: function () {
        if (this.currentOptions['extent']) {
          this.map.setExtent(this.currentOptions.extent);
        }
      },
      /**
       * @description setInitCenter
       * @method
       * @memberOf module:extras/MapInitObject#
       *
       * @example
       * <caption>Usage of setInitCenter</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.setInitCenter(x,y,zoom);
       * })
       */
      _setInitCenter: function () {
        var currentMapCenter = this.map.extent.getCenter();
        if (this.mapCenter && (currentMapCenter.x !== this.mapCenter.x || currentMapCenter.y !== this.mapCenter.y)) {
          this.map.centerAndZoom(this.mapCenter, this.currentOptions.zoom);
        }
      },
      _init: function () {
        if (!this.map) {
          this.map = new Map(this.mapId, this.currentOptions);
          this.map.spatialReference = this.spatialReference;
          var mapLoadHandler = this.map.on('load', dojo.hitch(this, function () {
            this._setInitExtent();
            this._setInitCenter();
            dojo.publish('mapLoadedEvent', [this.map]);
            mapLoadHandler.remove();
          }));
        }
        this.removeCurrentLayers();
        this.currentOptions['loadDefaultLayer'] !== false && this.addDefaultLayers();
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
       */
      loadMapCompelete: function (map) {
        var theDiv = document.createElement("div");
        var mapDiv = dojo.byId(this.map.id);
        mapDiv.appendChild(theDiv);
      },

      initBasicTools: function () {
        this.createLayerManager();
        this.createLayerDraw();
        this.createLayerLocate();
        this.createLayerQuery();
        this.createToolBar();
        this.createMapControl();
        this.createMapUtil();
      },
      /**
       * @description initLayerManager
       * @method
       * @memberOf module:extras/MapInitObject#
       *
       * @example
       * <caption>Usage of initLayerManager</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId);
       *   var layerManager = instance.initLayerManager();
       * })
       *
       * @returns {*}
       */
      createLayerManager: function () {
        if (!this.layerManager) {
          require(["extras/controls/LayerManager"], dojo.hitch(this, function (LayerManager) {
            this.layerManager = new LayerManager();
          }));
        }
         return this.layerManager;
      },
      /**
       * @description initLayerQuery
       * @method
       * @memberOf module:extras/MapInitObject#
       *
       * @example
       * <caption>Usage of initLayerQuery</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId);
       *   var layerQuery = instance.initLayerQuery();
       * })
       *
       * @returns {*}
       */
      createLayerQuery: function () {
        if (!this.layerQuery) {
          require(["extras/controls/LayerQuery"], dojo.hitch(this, function (LayerQuery) {
            this.layerQuery = new LayerQuery();
          }));
        }
        return this.layerQuery;
      },
      createLayerLocate: function () {
        if (!this.layerLocate) {
          require(["extras/controls/LayerLocate"], dojo.hitch(this, function (LayerLocate) {
            this.layerLocate = new LayerLocate();
          }));
        }
        return this.layerLocate;
      },
      createToolBar: function () {
        if (!this.toolbar) {
          require(["extras/controls/ToolBar"], dojo.hitch(this, function (ToolBar) {
            this.toolbar = new ToolBar(this);
          }));
        }
        return this.toolbar;
      },
      createLayerDraw: function () {
        if (!this.layerDraw) {
          require(["extras/controls/LayerDraw"], dojo.hitch(this, function (LayerDraw) {
            this.layerDraw = new LayerDraw();
          }));
        }
        return this.layerDraw;
      },
      createMapUtil: function () {
        if (!this.mapUtil) {
          require(["extras/controls/MapUtil"], dojo.hitch(this, function (MapUtil) {
            this.mapUtil = new MapUtil();
          }));
        }
        return this.mapUtil;
      },
      createMapControl: function () {
        if (!this.mapcontrol) {
          require(["extras/controls/MapControl"], dojo.hitch(this, function (MapControl) {
            this.mapcontrol = new MapControl(this);
          }));
        }
        return this.mapcontrol;
      },
      /**
       * @description addDefaultLayers
       * @method
       * @memberOf module:extras/MapInitObject#
       * @example
       * <caption>Usage of addDefaultLayers</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.addDefaultLayers();
       * })
       */
      addDefaultLayers: function () {
        this.addLayers([{
          "id": "100",
          "layerId": "smart_init_default_layer",
          "online": false,
          "name": "谷歌电子地图",
          "suffix": "png",
          "tileSize": "256",
          "tileType": "googlemap",
          "mapStyle": "roadmap",
          "tile_url": gisConfig.maptiledCacheUrl
        }]);
      },
      // test
      loadLayers: function () {
        require(["esri/layers/ArcGISDynamicMapServiceLayer", "esri/layers/ImageParameters"], dojo.hitch(this,function (ArcGISDynamicMapServiceLayer,ImageParameters) {
          var imageParameters = new ImageParameters();
          imageParameters.format = "jpeg"; //set the image type to PNG24, note default is PNG8.

          var dynamicMapServiceLayer = new ArcGISDynamicMapServiceLayer("https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer", {
            "opacity" : 0.5,
            "imageParameters" : imageParameters
          });

          this.map.addLayer(dynamicMapServiceLayer);
        }));
      },
      /**
       * @description addLayers 添加图层
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {array} layers
       *
       * @example
       * <caption>Usage of addLayers</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.addLayers(layers);
       * })
       *
       */
      addLayers: function (layers) {
        if (!(layers instanceof Array)) {
          layers = [layers];
        }
        array.forEach(layers, dojo.hitch(this,function (layerObj, index) {
          var layer = this.createLayerContainer(layerObj);
          if (layer) {
            this.map.addLayer(layer);
            layerObj.featureType == "7" ? this.imageLayer.push(layer) : this.baseLayer.push(layer);
            this.curLayer[layerObj.name + "_" + layerObj.id] = layer;
          }
        }));
      },
      /**
       * @description createLayerContainer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       *
       * @example
       * <caption>Usage of createLayerContainer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createLayerContainer(layerObj);
       * })
       * @returns string
       */
      createLayerContainer: function (layerObj) {
        var layerType = layerObj.tileType.toLowerCase();
        var layers = {
          'tiled': this.createTiledLayer,
          'dynamic': this.createDynamicLayer,
          'graphiclayer': this.createGraphicLayer,
          'feature': this.createFeatureLayer,
          'image': this.createImageLayer,
          'wms': this.createWMSLayer,
          'wfs': this.createWFSLayer,
          'googlemap': this.createGoogleMapLayer,
          'baidumap': this.createBaiDuMapLayer,
          'tianditu': this.createTianDiTuLayer
        };
        return layers[layerType].call(this,layerObj);
      },
      /**
       * @description switchRoadMap
       * @method
       * @memberOf module:extras/MapInitObject#
       * @example
       * <caption>Usage of switchRoadMap</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.switchRoadMap();
       * })
       */
      switchRoadMap: function () {
        array.forEach(this.imageLayer,function (layer, index) {
            layer.setVisibility(false);
        });

        array.forEach(this.baseLayer,function (layer, index) {
            layer.setVisibility(true);
        });
      },

      /**
       * @description switchSatelliteMap
       * @method
       * @memberOf module:extras/MapInitObject#
       * @example
       * <caption>Usage of switchSatelliteMap</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.switchSatelliteMap();
       * })
       */
      switchSatelliteMap: function () {
        array.forEach(this.baseLayer,function (layer, index) {
            layer.setVisibility(false);
        });

        array.forEach(this.imageLayer,function (layer, index) {
            layer.setVisibility(true);
        });
      },

      /**
       * @description showOverViewerMap
       * @method
       * @memberOf module:extras/MapInitObject#
       *
       * @example
       * <caption>Usage of showOverViewerMap</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.showOverViewerMap();
       * })
       */
      showOverViewerMap: function () {

      },


      /**
       * @description createTiledLayer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       * @param {string} layerObj.url
       * @param {object} [layerObj.options]
       *
       * @example
       * <caption>Usage of createTiledLayer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createTiledLayer(layerObj);
       * })
       *
       * @returns {*}
       */
      createTiledLayer: function (layerObj) {
        var layer;
        require(["esri/layers/ArcGISTiledMapServiceLayer"], function (ArcGISTiledMapServiceLayer) {
          layer = new ArcGISTiledMapServiceLayer(layerObj.tile_url || layerObj.url, layerObj.options || layerObj);
        });
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
       * @returns {*}
       */
      createGraphicLayer: function (layerObj) {
        var layer = null;
        require(['esri/layers/GraphicsLayer'], function (GraphicsLayer) {
          layer = new GraphicsLayer(layerObj);
        });
        return layer;
      },

      /**
       * @description createDynamicLayer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       * @param {string} layerObj.url
       * @param {object} [layerObj.options]
       *
       * @example
       * <caption>Usage of createDynamicLayer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createDynamicLayer(layerObj);
       * })
       *
       * @returns {*}
       */
      createDynamicLayer: function (layerObj) {
        var layer = null;
        require(['esri/layers/ArcGISDynamicMapServiceLayer'], function (ArcGISDynamicMapServiceLayer) {
          layer = new ArcGISDynamicMapServiceLayer(layerObj.tile_url || layerObj.url, layerObj.options || layerObj);
        });
        return layer;
      },

      /**
       * @description createFeatureLayer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       * @param {string} layerObj.url
       * @param {object} [layerObj.options]
       *
       * @example
       * <caption>Usage of createFeatureLayer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createFeatureLayer(layerObj);
       * })
       *
       * @returns {*}
       */
      createFeatureLayer: function (layerObj) {
        var layer = null;
        require(["esri/layers/FeatureLayer"], function (FeatureLayer) {
          layer = new FeatureLayer(layerObj.url || layerObj.tile_url, layerObj.options || layerObj);
        });
        return layer;
      },

      /**
       * @description createImageLayer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       * @param {string} layerObj.url
       * @param {object} [layerObj.options]
       *
       * @example
       * <caption>Usage of createImageLayer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createImageLayer(layerObj);
       * })
       *
       * @returns {*}
       */
      createImageLayer: function (layerObj) {
        var layer = null;
        require(["esri/layers/ArcGISImageServiceLayer"], function (ArcGISImageServiceLayer) {
          layer = new ArcGISImageServiceLayer(layerObj.url || layerObj.tile_url, layerObj.options || layerObj);
        });
        return layer;
      },

      /**
       * @description createWMSLayer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       * @param {string} layerObj.url
       * @param {object} [layerObj.options]
       *
       * @example
       * <caption>Usage of createWMSLayer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createWMSLayer(layerObj);
       * })
       *
       * @returns {*}
       */
      createWMSLayer: function (layerObj) {
        var layer = null;
        require(["esri/layers/WMSLayer"], function (WMSLayer) {
          layer = new WMSLayer(layerObj.url || layerObj.tile_url, layerObj.options || layerObj);
        });
        return layer;
      },

      /**
       * @description createWFSLayer
       * @method
       * @memberOf module:extras/MapInitObject#
       * @param {object} layerObj
       * @param {string} layerObj.url
       * @param {object} [layerObj.options]
       *
       * @example
       * <caption>Usage of createWFSLayer</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.createWFSLayer(layerObj);
       * })
       * @returns {*}
       */
      createWFSLayer: function (layerObj) {
        var layer = null;
        require(["esri/layers/WFSLayer"], function (WFSLayer) {
          layer = new WFSLayer(layerObj.url || layerObj.tile_url, layerObj.options || layerObj);
        });
        return layer;
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
       * @returns {*}
       */
      createGoogleMapLayer: function (layerObj) {
        var layer = null;
        require(["extras/layers/GoogleTiledMap"], function (GoogleTiledMap) {
          layer = new GoogleTiledMap(layerObj);
        });
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
       * @returns {*}
       */
      createBaiDuMapLayer: function (layerObj) {
        var layer = null;
        require(["extras/layers/BaiduTiledMap"], function (BaiduTiledMap) {
          layer = new BaiduTiledMap(layerObj);
        });
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
       * @returns {*}
       */
      createTianDiTuLayer: function (layerObj) {
        var layer = null;
        require(["extras/layers/TianDiTuTiledMap"], function (TianDiTuTiledMap) {
          layer = new TianDiTuTiledMap(layerObj);
        });
        return layer;
      },

      /**
       * @description removeCurrentLayers
       * @method
       * @memberOf module:extras/MapInitObject#
       *
       * @example
       * <caption>Usage of removeCurrentLayers</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.removeCurrentLayers();
       * })
       *
       */
      removeCurrentLayers: function () {
        this.curLayer = {};
        this.baseLayer = [];
        this.imageLayer = [];
      },

      /**
       * @description destroy
       * @method
       * @memberOf module:extras/MapInitObject#
       *
       * @example
       * <caption>Usage of destroy</caption>
       * require(['extras/MapInitObject'],function(MapInitObject){
       *   var instance = new MapInitObject(divId,options);
       *   instance.destroy();
       * })
       */
      destroy: function () {
        if (this.map) {
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
       */
      drawDefaultTrack: function () {
        var pgOptions = {
          style: SimpleLineSymbol.STYLE_SOLID,
          color: new Color([255, 0, 0]),
          width: 3,
          directionSymbol: "arrow3",
          directionPixelBuffer: 80,
          directionColor: new Color([255, 0, 0]),
          directionSize: 16,
          directionScale: 1
        };

        var basicSymbol = new ArrowLineSymbol(pgOptions);
        var points = [[113.316, 23.12], [113.3474, 23.1315], [113.3655, 23.11393]];
        var basicPolyline = webMercatorUtils.geographicToWebMercator(new Polyline(points));
        var bg = new Graphic(basicPolyline, basicSymbol, {}, null);

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
       */
      loadDefaultCluster: function () {
        var clusterLayer = new FlareClusterLayer({
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
          clusteringBegin: function () {
            console.log("clustering begin");
          },

          clusteringComplete: function () {
            console.log("clustering complete");
          }
        });

        var defaultSym = new SimpleMarkerSymbol().setSize(6).setColor("#FF0000").setOutline(null);
        var renderer = new ClassBreaksRenderer(defaultSym, "clusterCount");
        var xlSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 32, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([200, 52, 59, 0.8]), 1), new Color([250, 65, 74, 0.8]));
        var lgSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 28, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([41, 163, 41, 0.8]), 1), new Color([51, 204, 51, 0.8]));
        var mdSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 24, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([82, 163, 204, 0.8]), 1), new Color([102, 204, 255, 0.8]));
        var smSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 22, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([230, 184, 92, 0.8]), 1), new Color([255, 204, 102, 0.8]));
        renderer.addBreak(0, 19, smSymbol);
        renderer.addBreak(20, 150, mdSymbol);
        renderer.addBreak(151, 1000, lgSymbol);
        renderer.addBreak(1001, Infinity, xlSymbol);

        if (this.areaDisplayMode) {

          var defaultAreaSym = new SimpleFillSymbol().setStyle(SimpleFillSymbol.STYLE_SOLID).setColor(new Color([0, 0, 0, 0.2])).setOutline(new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0, 0, 0, 0.3]), 1));
          var areaRenderer = new ClassBreaksRenderer(defaultAreaSym, "clusterCount");
          var xlAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([200, 52, 59, 0.8]), 1), new Color([250, 65, 74, 0.8]));
          var lgAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([41, 163, 41, 0.8]), 1), new Color([51, 204, 51, 0.8]));
          var mdAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([82, 163, 204, 0.8]), 1), new Color([102, 204, 255, 0.8]));
          var smAreaSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([230, 184, 92, 0.8]), 1), new Color([255, 204, 102, 0.8]));

          areaRenderer.addBreak(0, 19, smAreaSymbol);
          areaRenderer.addBreak(20, 150, mdAreaSymbol);
          areaRenderer.addBreak(151, 1000, lgAreaSymbol);
          areaRenderer.addBreak(1001, Infinity, xlAreaSymbol);

          clusterLayer.setRenderer(renderer, areaRenderer);
        }
        else {
          clusterLayer.setRenderer(renderer);
        }

        var template = new PopupTemplate({
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
          var aa = webMercatorUtils.xyToLngLat(12557877.595482401, 2596928.9267310356, true);
          var bb = webMercatorUtils.xyToLngLat(12723134.450635016, 2688653.360673282, true);
          var ptX = this.getRandom(aa[0], bb[0]);
          var ptY = this.getRandom(aa[1], bb[1]);

          var pt = webMercatorUtils.geographicToWebMercator(new Point(ptX, ptY));

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
       * @private
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
       */
      test: function (x, y) {
        var pointObj = GPSConvertor.transferWgs84ToBaidu(x, y);
        var pt01 = webMercatorUtils.geographicToWebMercator(new Point(pointObj.lon, pointObj.lat));
        var pt02 = MapUtil.geographicToWebMercator(new Point(x, y));
      }
    })
  });
