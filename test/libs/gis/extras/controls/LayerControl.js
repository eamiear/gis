/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerControl.
 * @module extras/controls/LayerControl
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
  "esri/SpatialReference",
  "esri/geometry/webMercatorUtils",
  "esri/layers/GraphicsLayer",
  "esri/dijit/PopupTemplate",
  "esri/symbols/Symbol",
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/geometry/Polygon",
  "extras/basic/Radical",
  "extras/controls/ToolBar"
], function (
  declare,
  lang,
  array,
  SpatialReference,
  WebMercatorUtils,
  GraphicsLayer,
  PopupTemplate,
  Symbol,
  Point,
  Polyline,
  Polygon,
  Radical,
  ToolBar
) {
  return declare(Radical, {
    className: 'LayerControl',
    /**
     * @constructs
     *
     */
    constructor: function (map) {
      this.map = map;
      this.eventHandlerTicket = [];
     // dojo.subscribe("mapLoadedEvent", this, "_init");
    },
    _init: function (map) {
      this.map = map;
      this.toolbar = new ToolBar(map);
    },
    /**
     * add a graphic to layer
     * @memberOf module:extras/controls/LayerControl#
     * @param {string | object} layer                           layer or layer's id the graphic added to
     * @param {object} graphicObj                               the properties of graphic
     * @param {object} graphicObj.geometry                      geometry of graphic
     * @param {object} graphicObj.attributes                    attributes of graphic
     * @param {object} graphicObj.symbol                        symbol of graphic
     * @param {object} graphicObj.infoWindows
     * @param {number} graphicObj.infoWindows.showPopupType
     * @param {object} graphicObj.infoWindows.infoTemplate
     * @param {string} graphicType
     * @param {object} infoTemplate
     *
     * @example
     * <caption>Usage of _addGraphicToLayer</caption>
     *  new LayerControl(map)._addGraphicToLayer()
     * @returns {*}
     * @private
     */
    _addGraphicToLayer: function (layer,graphicObj,graphicType,infoTemplate) {
      var options = {},
        addGraphicActions,
        geometry = graphicObj.geometry,
        attributes = graphicObj.attributes,
        symbol = graphicObj.symbol,
        infoWindows = graphicObj.infoWindows || {},
        showPopupType,
        infoTemplates,
        graphic;

      if(!graphicObj){
        this.logger('graphicObj can not be empty!');
        return;
      }
      lang.mixin(options,graphicObj);
      options.layerId = layer;
      addGraphicActions = {
        point: this.toolbar.addPoint,
        image: this.toolbar.addPoint,
        polyline: this.toolbar.addPolyline,
        polygon: this.toolbar.addPolygon
      };

      // update or create graphic
      graphic = this.getGraphicById(layer,graphicObj.id);
      if(graphic){
        geometry && graphic.setGeometry(geometry);
        attributes && graphic.setAttributes(attributes);
        symbol && graphic.setSymbol(symbol);
      }else{
        graphic = addGraphicActions[graphicType].call(this,options);
      }

      // TODO graphic's infoWindow
      if(infoWindows){
        showPopupType = infoWindows.showPopupType;
        infoTemplates = infoWindows.infoTemplate || infoTemplate || {};

        switch (showPopupType){
          case 0:
            this.map.infoWindow.resize(830, 430);
            graphic.setInfoTemplate(new PopupTemplate(infoTemplates));
            break;
        }
      }
      return graphic;
    },
    /**
     * add a graphic to layer.
     * Attention: what kind of geometry value you pass depends on the type of graphic you create.
     * when creating a pint ,then pass graphicsData.x and graphicsData.y, creating a polyline,then pass graphicsData.path etc.
     * @memberOf module:extras/controls/LayerControl#
     * @param {string | object} layer                           layer or layer's id the graphic added to
     * @param {object} graphicsData                               the properties of graphic
     *
     * @param {object} graphicsData.x
     * @param {object} graphicsData.y
     * @param {object} graphicsData.rings
     * @param {object} graphicsData.paths
     *
     * @param {object} [graphicsData.extras]                        extra attributes of graphic
     * @param {object} [graphicsData.infoWindows]
     * @param {number} [graphicsData.infoWindows.showPopupType]
     * @param {object} [graphicsData.infoWindows.infoTemplate]
     * @param {string} graphicType
     * @param {Symbol|object} [symbol]                            symbol of graphic
     * @param {object} [infoTemplate]
     *
     * @example
     * <caption>Usage of addGraphicToLayer</caption>
     *  new LayerControl(map).addGraphicToLayer('smart_gis_control_layer',{
     *     x: 113.12,
     *     y: 23.33,
     *     name: 'Imgraphic',
     *     extra: {
     *        id: 'graphic_122'
     *     },
     *     type: 'dev'
     *  },'point');
     *
     * @returns {*}
     */
    addGraphicToLayer: function (layer,graphicsData,graphicType,symbol,infoTemplate) {
      var graphicObj = this.buildGraphic(graphicsData,graphicType);
      graphicObj.symbol = this.getSymbolByGraphicType(graphicType,symbol);
      return this._addGraphicToLayer(layer,graphicObj,graphicType,infoTemplate);
    },
    /**
     * add numbers of graphics to layer
     * @memberOf module:extras/controls/LayerControl#
     * @param {string | object} layer                           layer or layer's id the graphic added to
     * @param {array} graphicsArray                             an array of graphics
     * @param {string} graphicType                              a graphic type for all graphics of the graphicsArray.
     *                                                          when the graphic in graphicArray has different graphic type ,the specified graphic type will be used
     *                                                          means that you can add different graphics at a time.
     * @param {Symbol|object} [symbol]                            symbol of graphic
     * @param {object} [infoTemplate]
     *
     * @example
     * <caption>Usage of addGraphicsToLayer</caption>
     *  new LayerControl(map).addGraphicsToLayer('smart_gis_control_layer',[{
     *     x: 113.12,
     *     y: 23.33,
     *     name: 'Imgraphic',
     *     extra: {
     *        id: 'graphic_122'
     *     },
     *     type: 'dev'
     *  },{
     *     x: 113.22,
     *     y: 23.53,
     *     name: 'I_am_graphic',
     *     extra: {
     *        id: 'graphic_123'
     *     },
     *     type: 'chn',
     *     graphicType: 'image',
     *     url: 'http://placehold.it/16x16'
     *  }],'point');
     *
     * @returns {*}
     */
    addGraphicsToLayer: function (layer,graphicsArray,graphicType,symbol,infoTemplate) {
      var graphicObj,pseudoGraphic, pseudoGraphics = [];
      if(!graphicsArray || !lang.isArray(graphicsArray)){
        this.logger('graphicsArray should be an array!');
        return;
      }
      array.forEach(graphicsArray, function (graphic) {
        pseudoGraphic = this.addGraphicToLayer(layer,graphicObj,graphic.graphicType || graphicType,symbol,infoTemplate);
        pseudoGraphics.push(pseudoGraphic);
      });
      return pseudoGraphics;
    },
    /**
     * add graphics to map and delegate an event
     * @memberOf module:extras/controls/LayerControl#
     * @param {object} options
     * @param {string|object} options.layerId
     * @param {array|object} options.graphics
     * @param {string} options.graphicType
     * @param {Symbol|object} options.symbol
     * @param {boolean} options.isCleanLayer
     * @param {object} [options.infoTemplate]
     * @param {object} [options.eventBinder]
     * @param {string} [options.eventBinder.type]
     * @param {function} [options.eventBinder.callback]
     *
     * @example
     * <caption>Usage of addGraphicsToMap</caption>
     *  new LayerControl(map).addGraphicsToMap({
     *    layerId: 'smart_gis_control_layer',
     *    isCleanLayer: true,
     *    graphicType: 'point',
     *    graphics: [{
     *      x: 113.12,
     *      y: 23.33,
     *      name: 'Imgraphic',
     *      extra: {
     *         id: 'graphic_122'
     *      },
     *      type: 'dev'
     *    },{
     *      x: 113.22,
     *      y: 23.53,
     *      name: 'I_am_graphic',
     *      extra: {
     *        id: 'graphic_123'
     *      },
     *      type: 'chn',
     *      graphicType: 'image',
     *      url: 'http://placehold.it/16x16'
     *    }],
     *    eventBinder: {
     *      type: 'click',
     *      callback: function(evt){}
     *    }
     *  });
     *
     */
    addGraphicsToMap: function (options) {
      var layerId = options.layerId,
        layer,
        graphics = options.graphics,
        graphicType = options.graphicType,
        symbol = options.symbol,
        isCleanLayer = options.isCleanLayer,
        infoTemplate = options.infoTemplate,
        eventBinder = options.eventBinder;

      if(!graphics){
        this.logger('graphics should not be empty!');
        return;
      }
      layer = this.getLayerById(layerId);
      (layer && isCleanLayer) && layer.clear();

      if(!lang.isArray(graphics)){
        graphics = [graphics];
      }
      this.addGraphicsToLayer(layerId,graphics,graphicType,symbol,infoTemplate);

      // we should get layer again which doesn't exist before adding graphics to
      layer = this.getLayerById(layerId);
      if(eventBinder && lang.isObject(eventBinder)){
        this.eventHandlerTicket.push(layer.on(eventBinder.type, eventBinder.callback || function (evt) {
            // TODO default callback function
          }))
      }
    },

    /**
     * build a pseudo graphic for the passing attributes.
     * when building a point pseudo graphic you should pass graphic.x and graphic.y,
     * a polygon pseudo graphic passing graphic.rings or a polyline passing graphic.paths.
     * @memberOf module:extras/controls/LayerControl#
     *
     * @param {object} graphic
     * @param {number} graphic.x                            longitude for a point
     * @param {number} graphic.y                            latitude for a point
     * @param {Number[][] | Number[][][]} graphic.rings     an array of coordinates for polygon
     * @param {Number[][] | Number[][][]} graphic.paths     an array of coordinates for polyline
     * @param {number} [graphic.wkid]                       spatialReference's wkid
     * @param {number|string} [graphic.id]                  an id of pseudo graphic
     * @param {string} [graphic.layerId]                    an layer's id which the graphic belongs to
     * @param {object} [graphic.extras]                     extras attributes for graphic
     * @param {string} [graphicType]                        the type of pseudo graphic , e.g. point,polyline,polygon.
     *
     * @example
     * <caption>Usage of buildGraphic</caption>
     * new LayerControl(map).buildGraphic({
     *     x: 113.12,
     *     y: 23.33,
     *     name: 'Imgraphic',
     *     extra: {
     *        id: 'graphic_122'
     *     },
     *     type: 'dev'
     *  })
     *
     * @returns {{}}
     */
    buildGraphic: function(graphic,graphicType){
      var geometry,
        longitude,
        latitude,
        rings,
        paths,
        wkid,
        extras,
        graphicAttr,
        pseudoGraphic = {};

      if(!lang.isObject(graphic)) {
        this.logger('params should not be an empty object');
        return;
      }

      wkid = graphic.wkid;
      extras = graphic.extras || {};

      switch (graphicType){
        case 'polyline':
          paths = graphic.path;
          if(!paths || !lang.isArray(paths)){
            this.logger('[warning]','paths should be an array!');
          }
          geometry = new Polyline(paths);
          break;
        case 'polygon':
          rings = graphic.rings;
          if(!rings || !lang.isArray(rings)){
            this.logger('[waring]','rings should be an array!');
          }
          geometry = new Polygon(rings);
          break;
        case 'point':
        case 'image':
        default:
          longitude = graphic.x;
          latitude = graphic.y;
          if(!(latitude && longitude)){
            this.logger('[warning] ','when building graphic ,there exists an object (%s) that x and y is empty!',graphic.id);
          }
          geometry = new Point(longitude,latitude);
          if(this.isGeometry(geometry)){
            geometry  = WebMercatorUtils.geographicToWebMercator(geometry);
          }
          break;
      }
      wkid && geometry.setSpatialReference(new SpatialReference({wkid: wkid}));

      //
      graphicAttr = {id: graphic.id};
      lang.mixin(graphicAttr,extras);
      pseudoGraphic.id = graphic.id;
      pseudoGraphic.geometry = geometry;
      pseudoGraphic.attributes = graphic;
      pseudoGraphic.extras =  graphicAttr;

      if(graphic.layerId){
        pseudoGraphic._layer = this.map.getLayer(graphic.layerId);
        pseudoGraphic._graphicsLayer = pseudoGraphic._layer;
      }
      return pseudoGraphic;
    },

    /**
     * remove a specified graphic from layer
     * @memberOf module:extras/controls/LayerControl#
     * @param {string | object} layer
     * @param {string | number} graphicId
     *
     * @example
     * <caption>Usage of removeGraphic</caption>
     * new LayerControl(map).removeGraphic('smart_gis_cotrol_layer','graphic_122');
     */
    removeGraphic: function (layer,graphicId) {
      var graphic;
      if(lang.isString(layer)){
        layer = this.getLayerById(layer);
      }
      if(!layer){
        this.logger('[removeGraphic] ','layer doesn\'t exist!');
        return;
      }
      graphic = this.getGraphicById(layer,graphicId);
      if(!graphic){
        this.logger('[removeGraphic] ','graphic doesn\'t exist!');
        return;
      }
      layer.remove(graphic);
    },
    /**
     * remove all graphics from layer
     * @memberOf module:extras/controls/LayerControl#
     * @param {string | object} layer
     *
     * @example
     * <caption>Usage of removeAllGraphics</caption>
     * new LayerControl(map).removeAllGraphics();
     */
    removeAllGraphics: function (layer) {
      if(lang.isString(layer)){
        layer = this.getLayerById(layer);
      }
      if(!layer){
        this.logger('[removeAllGraphics] ','layer doesn\'t exist!');
        return;
      }
      layer.clear();
    },

    /**
     * remove layer's events
     * @memberOf module:extras/controls/LayerControl#
     *
     * @example
     * <caption>Usage of destroyLayerEvents</caption>
     * new LayerControl(map).destroyLayerEvents();
     */
    destroyLayerEvents: function () {
      if(this.eventHandlerTicket){
        array.forEach(function (signal) {
          signal && signal.remove();
        })
      }
    }
  })
});
