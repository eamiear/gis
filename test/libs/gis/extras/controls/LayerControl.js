/**
 * Created by K on 2017/7/17.
 */

define([
  "dojo/_base/declare",
  "dojo/_base/lang",
  "dojo/_base/array",
  "esri/SpatialReference",
  "esri/geometry/webMercatorUtils",
  "esri/layers/GraphicsLayer",
  "esri/dijit/PopupTemplate",
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
     * add a graphic to layer
     * @param {string | object} layer                           layer or layer's id the graphic added to
     * @param {object} graphicsData                               the properties of graphic
     * @param {object} graphicsData.geometry                      geometry of graphic
     * @param {object} graphicsData.attributes                    attributes of graphic
     * @param {object} graphicsData.symbol                        symbol of graphic
     * @param {object} graphicsData.infoWindows
     * @param {number} graphicsData.infoWindows.showPopupType
     * @param {object} graphicsData.infoWindows.infoTemplate
     * @param {string} graphicType
     * @param {object} infoTemplate
     * @returns {*}
     */
    addGraphicToLayer: function (layer,graphicsData,graphicType,infoTemplate) {
      var graphicObj = this.buildGraphic(graphicsData,graphicType);
      return this._addGraphicToLayer(layer,graphicObj,graphicType,infoTemplate);
    },
    /**
     * add numbers of graphics to layer
     * @param {string | object} layer                           layer or layer's id the graphic added to
     * @param {array} graphicsArray                          an array of graphics
     * @param {string} graphicType                              a graphic type for all graphics of the graphicsArray.
     *                                                          when the graphic in graphicArray has different graphic type ,the specified graphic type will be used
     *                                                          means that you can add different graphics at a time.
     * @param {object} infoTemplate
     * @returns {*}
     */
    addGraphicsToLayer: function (layer,graphicsArray,graphicType,infoTemplate) {
      var graphicObj,pseudoGraphic, pseudoGraphics = [];
      if(!graphicsArray || !lang.isArray(graphicsArray)){
        this.logger('graphicsArray should be an array!');
        return;
      }
      array.forEach(graphicsArray, function (graphic) {
        graphicObj = this.buildGraphic(graphic,graphic.graphicType || graphicType);
        pseudoGraphic = this._addGraphicToLayer(layer,graphicObj,graphicType,infoTemplate);
        pseudoGraphics.push(pseudoGraphic);
      });
      return pseudoGraphics;
    },
    addGraphicsToMap: function (options) {
      var layerId = options.layerId,
        layer,
        graphics = options.graphics,
        graphicType = options.graphicType,
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
      this.addGraphicsToLayer(layerId,graphics,graphicType,infoTemplate);

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
     * @param {string | object} layer
     * @param {string | number} graphicId
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
     * @param {string | object} layer
     */
    removeEntireGraphics: function (layer) {
      if(lang.isString(layer)){
        layer = this.getLayerById(layer);
      }
      if(!layer){
        this.logger('[removeEntireGraphics] ','layer doesn\'t exist!');
        return;
      }
      layer.clear();
    },

    /**
     * remove layer's events
     */
    destroyEvents: function () {
      if(this.eventHandlerTicket){
        array.forEach(function (signal) {
          signal && signal.remove();
        })
      }
    }
  })
});
