/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a LayerQuery.
* @module extras/control/LayerQuery
*
* 
* @requires esri.graphic 
* @requires esri.layers.GraphicsLayer 
* @requires esri.geometry.Point 
* @requires esri.geometry.webMercatorUtils 
* @requires esri.toolbars.draw 
* @requires esri.symbols.PictureMarkerSymbol 
* @requires esri.dijit.PopupTemplate 
*/
define(["esri/graphic", "esri/layers/GraphicsLayer", "esri/geometry/Point", "esri/geometry/webMercatorUtils", "esri/toolbars/draw", "esri/symbols/PictureMarkerSymbol", "esri/dijit/PopupTemplate"],
function(
graphic, GraphicsLayer, Point, webMercatorUtils, draw, PictureMarkerSymbol, PopupTemplate) {
  return declare(null,
  /**  @lends module:extras/control/LayerQuery */
  {

    /** @member 
	layerQueryLayer */
    layerQueryLayer: null,

    /**
     * @constructs
     * 
     */
    constructor: function() {

      dojo.subscribe("toolBarLoadedEvent", this, "initLayerQuery");

      this.defaultSymbol = {
        "POINT": {
          type: "esriSMS",
          style: "esriSMSCircle",
          angle: 0,
          color: [255, 0, 0, 255],
          outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            width: 1.5,
            color: [255, 255, 255]
          },
          size: 6.75,
          xoffset: 0,
          yoffset: 0,
        },
        "IMAGE": {
          type: "esriPMS",
          angle: 0,
          width: 32,
          height: 32,
          xoffset: 0,
          yoffset: 0,
          url: baseUrl + "/themes/default/images/tt.png"
        },
        "TEXT": {
          type: "esriTS",
          angle: 0,
          color: [51, 51, 51, 255],
          font: {
            family: "微软雅黑",
            size: 9,
            style: "normal",
            variant: "normal",
            weight: "normal"
          },
          horizontalAlignment: "center",
          kerning: true,
          rotated: false,
          text: "默认文本",
          xoffset: 0,
          yoffset: 0
        },
        "LINE": {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 0, 0, 255]
        },
        "POLYGON": {
          type: "esriSFS",
          style: "esriSFSSolid",
          color: [0, 0, 0, 64],
          outline: {
            type: "esriSLS",
            style: "esriSLSSolid",
            width: 1.5,
            color: [255, 0, 0, 255]
          }
        }
      };

      this.layerQueryLayer = new esri.layers.GraphicsLayer({
        id: "GXX_GIS_QUERYRESULT_LAYER"
      });

    },

    /**
     * @description initLayerQuery
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {string} toolbar
     * 
     * @example
     * <caption>Usage of initLayerQuery</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.initLayerQuery(toolbar);
     * })
     * 
     *
     * 
     */
    initLayerQuery: function(toolbar) {
      this.toolbar = toolbar;
      this.map = this.toolbar.map;
      this.map.addLayer(this.layerQueryLayer);
    },

    /**
     * @description startDraw
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} type
     * @param {number} sybmol
     * @param {function} callBackFun
     * 
     * @example
     * <caption>Usage of startDraw</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.startDraw(type,sybmol,callBackFun);
     * })
     * 
     *
     * 
     */
    startDraw: function(type, sybmol, callBackFun) {
      this.layerQueryLayer.clear();
      this.map.reorderLayer(this.layerQueryLayer, this.map._layers.length - 1);
      this.toolbar.draw(type, sybmol || this.defaultSymbol[type.toUpperCase()], dojo.hitch(this,
      function(graphic) {
        if (graphic) {
          callBackFun(graphic);
        } else {
          callBackFun(null);
        }
      }));
    },

    /**
     * @description pullBoxSearch
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * 
     * 
     * @example
     * <caption>Usage of pullBoxSearch</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.pullBoxSearch();
     * })
     * 
     *
     * 
     */
    pullBoxSearch: function() {
      this.startDraw(esri.toolbars.draw.EXTENT, new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON), dojo.hitch(this,
      function(graphic) {

        this.layerQueryLayer.add(graphic);
      }));
    },

    /**
     * @description polygonSearch
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * 
     * 
     * @example
     * <caption>Usage of polygonSearch</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.polygonSearch();
     * })
     * 
     *
     * 
     */
    polygonSearch: function() {
      this.startDraw(esri.toolbars.draw.POLYGON, new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON), dojo.hitch(this,
      function(graphic) {
        this.layerQueryLayer.add(graphic);
      }));
    },

    /**
     * @description circleSearch
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * 
     * 
     * @example
     * <caption>Usage of circleSearch</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.circleSearch();
     * })
     * 
     *
     * 
     */
    circleSearch: function() {
      this.startDraw(esri.toolbars.draw.CIRCLE, new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON), dojo.hitch(this,
      function(graphic) {
        this.layerQueryLayer.add(graphic);

        var resultData = this.queryByGeometry("GXX_Device", graphic.geometry);

        dojo.forEach(resultData, dojo.hitch(this,
        function(graphic, index) {

          var pt = graphic.geometry;
          var sms = null;
          switch (index) {
          case 0:
            sms = new esri.symbols.PictureMarkerSymbol(baseUrl + "/themes/default/images/location/1.png", 36, 36);
            break;
          case 1:
            sms = new esri.symbols.PictureMarkerSymbol(baseUrl + "/themes/default/images/location/2.png", 36, 36);
            break;
          case 2:
            sms = new esri.symbols.PictureMarkerSymbol(baseUrl + "/themes/default/images/location/3.png", 36, 36);
            break;
          case 3:
            sms = new esri.symbols.PictureMarkerSymbol(baseUrl + "/themes/default/images/location/4.png", 36, 36);
            break;
          default:
            sms = new esri.symbols.PictureMarkerSymbol(baseUrl + "/themes/default/images/location/0.png", 36, 36);
            break;
          }

          var template = new esri.dijit.PopupTemplate({
            title: "{title}",
            description: "{description}",
          });

          var newGraphic = new esri.Graphic(pt, sms, {
            title: "标题" + index,
            description: "内容" + index
          },
          template);
          this.layerQueryLayer.add(newGraphic);
        }));

      }));
    },

    /**
     * @description queryByAttribute
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layerId
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * 
     * @example
     * <caption>Usage of queryByAttribute</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.queryByAttribute(layerId,attrName,attrValue,isLike);
     * })
     * 
     *
     * @returns string
     */
    queryByAttribute: function(layerId, attrName, attrValue, isLike) {
      var param = new SpatialQueryParam();
      param.layerId = layerId;
      param.attrName = attrName;
      param.attrValue = attrValue;
      param.isLike = isLike || true;
      return this.queryByLayerId(1, param)
    },

    /**
     * @description queryByGeometry
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layerId
     * @param {number} geometry
     * 
     * @example
     * <caption>Usage of queryByGeometry</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.queryByGeometry(layerId,geometry);
     * })
     * 
     *
     * @returns string
     */
    queryByGeometry: function(layerId, geometry) {
      var param = new SpatialQueryParam();
      param.layerId = layerId;
      param.geometry = geometry;
      return this.queryByLayerId(2, param)
    },

    /**
     * @description queryByAttrAndGeo
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layerId
     * @param {number} geometry
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * 
     * @example
     * <caption>Usage of queryByAttrAndGeo</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.queryByAttrAndGeo(layerId,geometry,attrName,attrValue,isLike);
     * })
     * 
     *
     * @returns string
     */
    queryByAttrAndGeo: function(layerId, geometry, attrName, attrValue, isLike) {
      var param = new SpatialQueryParam();
      param.layerId = layerId;
      param.geometry = geometry;
      param.attrName = attrName;
      param.attrValue = attrValue;
      return this.queryByLayerId(3, param)
    },

    /**
     * @description queryByLayerId
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} type
     * @param {object} param
     * 
     * @example
     * <caption>Usage of queryByLayerId</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.queryByLayerId(type,param);
     * })
     * 
     *
     * @returns {*}
     */
    queryByLayerId: function(type, param) {
      var layerId = param.layerId;
      var attrName = param.attrName;
      var attrValue = param.attrValue;
      var geometry = param.geometry || null;
      var isLike = param.isLike || true;
      var layer = this.map.getLayer(layerId);
      var resultData = null;
      if (layer) {
        if (type == 1) {
          resultData = this.getGraphicByAttribute(layer, attrName, attrValue, isLike);
        } else if (type == 2) {
          resultData = this.getGraphicByGeometry(layer, geometry);
        } else if (type == 3) {
          resultData = this.getGraphicByAttributeAndGeometry(layer, geometry, attrName, attrValue, isLike);
        }
      }
      return resultData;
    },

    /**
     * @description getGraphicBy
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layer
     * @param {number} property
     * @param {string}  value
     * 
     * @example
     * <caption>Usage of getGraphicBy</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.getGraphicBy(layer,property, value);
     * })
     * 
     *
     * @returns {*}
     */
    getGraphicBy: function(layer, property, value) {
      var feature = null;
      if (layer) {
        var graphics = layer.graphics;
        for (var i = 0,
        len = graphics.length; i < len; ++i) {
          if (graphics[i][property] == value) {
            feature = this.features[i];
            break;
          }
        }
      }
      return feature;
    },

    /**
     * @description getGraphicById
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layer
     * @param {number} idKey
     * 
     * @example
     * <caption>Usage of getGraphicById</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.getGraphicById(layer,idKey);
     * })
     * 
     *
     * @returns string
     */
    getGraphicById: function(layer, idKey) {
      return this.getGraphicBy(layer, 'id', idKey);
    },

    /**
     * @description getAllGraphic
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layer
     * 
     * @example
     * <caption>Usage of getAllGraphic</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.getAllGraphic(layer);
     * })
     * 
     *
     * @returns {*}
     */
    getAllGraphic: function(layer) {
      return layer.graphics;
    },

    /**
     * @description getGraphicByAttributeAndGeometry
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layer
     * @param {number} geometry
     * @param {string} attrName
     * @param {string} attrValue
     * @param {boolean} isLike
     * 
     * @example
     * <caption>Usage of getGraphicByAttributeAndGeometry</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.getGraphicByAttributeAndGeometry(layer,geometry,attrName,attrValue,isLike);
     * })
     * 
     *
     * @returns {*}
     */
    getGraphicByAttributeAndGeometry: function(layer, geometry, attrName, attrValue, isLike) {
      var foundGraphics = null;
      var resultData = this.getGraphicByAttribute(layer, attrName, attrValue, isLike);
      if (resultData && resultData.lenght > 0) {
        foundGraphics = [];
        dojo.forEach(resultData,
        function(graphic, index) {
          if (geometry.contains(graphic.geometry)) {
            foundGraphics.push(graphic);
          }
        });
      }
      return foundGraphics;
    },

    /**
     * @description getGraphicByGeometry
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layer
     * @param {number} geometry
     * 
     * @example
     * <caption>Usage of getGraphicByGeometry</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.getGraphicByGeometry(layer,geometry);
     * })
     * 
     *
     * @returns {*}
     */
    getGraphicByGeometry: function(layer, geometry) {
      var foundGraphics = null;
      if (layer && geometry) {
        foundGraphics = [];
        var allGraphic = this.getAllGraphic(layer);
        for (var i = 0,
        len = allGraphic.length; i < len; i++) {
          var g = allGraphic[i];
          if (geometry.contains(g.geometry.getPoint(0))) {
            foundGraphics.push(g);
          }
        }
      }
      return foundGraphics;
    },

    /**
     * @description getGraphicByAttribute
     * @method
     * @memberOf module:extras/control/LayerQuery#
     * @param {number} layer
     * @param {string} attrName
     * @param {string}  attrValue
     * @param {boolean} isLike
     * 
     * @example
     * <caption>Usage of getGraphicByAttribute</caption>
     * require(['extras/control/LayerQuery'],function(LayerQuery){
     *   var instance = new LayerQuery();
     *   instance.getGraphicByAttribute(layer,attrName, attrValue,isLike);
     * })
     * 
     *
     * @returns {*}
     */
    getGraphicByAttribute: function(layer, attrName, attrValue, isLike) {
      var foundGraphics = null;
      if (layer) {
        var feature = null;
        foundGraphics = [];
        var graphics = layer.graphics;
        for (var i = 0,
        len = graphics.length; i < len; i++) {
          feature = graphics[i];
          if (feature && feature.attributes) {
            if (!isLike) {
              if (feature.attributes[attrName] == attrValue) {
                foundGraphics.push(feature);
              }
            } else {
              if (feature.attributes[attrName].indexOf(attrValue) != -1) {
                foundGraphics.push(feature);
              }
            }
          }
        }
      }
      return foundGraphics;
    }

  })
});