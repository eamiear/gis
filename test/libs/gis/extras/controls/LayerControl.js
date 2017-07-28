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
  "esri/geometry/Point",
  "esri/geometry/Polyline",
  "esri/geometry/Polygon",
  "extras/basic/Radical",
  "extras/controls/ToolBar",
  "extras/graphics/InfoGraphicLayer"
], function (
  declare,
  lang,
  array,
  SpatialReference,
  WebMercatorUtils,
  GraphicsLayer,
  Point,
  Polyline,
  Polygon,
  Radical,
  ToolBar,
  InfoGraphicLayer
) {
  return declare(Radical, {
    className: 'LayerContol',
    /**
     * @constructs
     *
     */
    constructor: function (map) {
      this.map = map;
     // dojo.subscribe("mapLoadedEvent", this, "_init");
    },
    _init: function (map) {
      this.map = map;
      this.toolbar = new ToolBar(map);
    },
    // TODO
    _addGraphicToLayer: function (layer,graphicObj,graphicType) {
      var options = {},
        addGraphicActions,
        geometry = graphicObj.geometry,
        attributes = graphicObj.attributes,
        symbol = graphicObj.symbol,
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

      graphic = this.getGraphicById(layer,graphicObj.id);
      if(graphic){
        geometry && graphic.setGeometry(geometry);
        attributes && graphic.setAttributes(attributes);
        symbol && graphic.setSymbol(symbol);
      }else{
        graphic = addGraphicActions[graphicType].call(this,options);
      }

      //return addGraphicActions[graphicType].call(this,options);
    },
    addGraphicToLayer: function (graphicsData,graphicType) {
      var graphicObj = this.buildGraphic(graphicsData,graphicType);

    },
    addGraphicsToLayer: function () {

    },
    getGraphicById: function (layer, graphicId) {
      if (lang.isString(layer)) {
        layer = this.map.getLayer(layer);
      }
      var graphics = layer.graphics;
      return array.filter(graphics, function (graphic,index) {
          return graphic.id == graphicId;
      })[0];
    },
    /**
     *
     * @param {object} graphic
     * @param {number} graphic.x
     * @param {number} graphic.y
     * @param {number} [graphic.wkid]
     * @param {number|string} [graphic.id]
     * @param {string} [graphic.layerId]
     * @param {string} [graphicType]
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
    }



  })
});
