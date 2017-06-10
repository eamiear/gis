/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a LayerManager.
* @module extras/control/LayerManager
*
* 
* @requires esri.graphic 
* @requires esri.SpatialReference 
* @requires esri.geometry.Point 
* @requires esri.geometry.Extent 
* @requires esri.geometry.Multipoint 
* @requires esri.geometry.webMercatorUtils 
* @requires esri.symbols.PictureMarkerSymbol 
* @requires esri.layers.GraphicsLayer 
* @requires esri.dijit.PopupTemplate 
* @requires extras.graphic.InfoGraphicLayer 
* @requires extras.utils.GPSConvertor 
*/
define(["esri/graphic", "esri/SpatialReference", "esri/geometry/Point", "esri/geometry/Extent", "esri/geometry/Multipoint", "esri/geometry/webMercatorUtils", "esri/symbols/PictureMarkerSymbol", "esri/layers/GraphicsLayer", "esri/dijit/PopupTemplate", "extras/graphic/InfoGraphicLayer", "extras/utils/GPSConvertor"],
function(
graphic, SpatialReference, Point, Extent, Multipoint, webMercatorUtils, PictureMarkerSymbol, GraphicsLayer, PopupTemplate, InfoGraphicLayer, GPSConvertor) {
  return declare(null,
  /**  @lends module:extras/control/LayerManager */
  {

    /**
     * @constructs
     * 
     */
    constructor: function() {

      dojo.subscribe("toolBarLoadedEvent", this, "setToolbar");
      this.initLayer();
      this._infoTip = null;
      this._layerClickEvtHandle = null;

    },

    /**
     * @description setToolbar
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {string} toolbar
     * 
     * @example
     * <caption>Usage of setToolbar</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.setToolbar(toolbar);
     * })
     * 
     *
     * 
     */
    setToolbar: function(toolbar) {
      this.toolbar = toolbar;
      this.map = toolbar.map;
    },

    /**
     * @description initLayer
     * @method
     * @memberOf module:extras/control/LayerManager#
     * 
     * 
     * @example
     * <caption>Usage of initLayer</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.initLayer();
     * })
     * 
     *
     * 
     */
    initLayer: function() {
      this.layerContainer = {};
    },

    /**
     * @description addOneGraphicToMap
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layerId
     * @param {object} graphicObj
     * @param {boolean} isClear
     * 
     * @example
     * <caption>Usage of addOneGraphicToMap</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.addOneGraphicToMap(layerId,graphicObj,isClear);
     * })
     * 
     *
     * 
     */
    addOneGraphicToMap: function(layerId, graphicObj, isClear) {
      if (typeof graphicObj == "string") {
        graphicObj = dojo.fromJson(graphicObj);
      }
      var layer = this.createLayerById(layerId, isClear);
      if (layer) {
        try {
          var idKey = graphicObj.id;
          var ptObj = graphicObj.geometry;
          var point = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(ptObj.x, ptObj.y));
          var symbol = new esri.symbols.PictureMarkerSymbol(graphicObj.symbol);
          var attributes = graphicObj.attributes;
          var graphic = new esri.Graphic(point, symbol, attributes);
          graphic.id = idKey;
          layer.add(graphic);

          dojo.connect(layer, "onClick", dojo.hitch(this,
          function(evt) {
            this.toolbar.showInfoWindow(evt.graphic);
          }));
        } catch(e) {

}
      }
    },

    /**
     * @description removeAllGraphicFromMap
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layerId
     * @param {function} fn
     * 
     * @example
     * <caption>Usage of removeAllGraphicFromMap</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.removeAllGraphicFromMap(layerId,fn);
     * })
     * 
     *
     * 
     */
    removeAllGraphicFromMap: function(layerId, fn) {
      var layer = this.createLayerById(layerId, false);
      if (layer) {
        var code = 1;
        try {
          layer.clear();
        } catch(ex) {
          code = -1;
        }
        if (fn) {
          fn.apply(this, [{
            "code": code
          }]);
        }
      }
    },

    /**
     * @description removeGraphicFromMap
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layerId
     * @param {string} gId
     * @param {function} fn
     * 
     * @example
     * <caption>Usage of removeGraphicFromMap</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.removeGraphicFromMap(layerId,gId,fn);
     * })
     * 
     *
     * 
     */
    removeGraphicFromMap: function(layerId, gId, fn) {
      var layer = this.createLayerById(layerId, false);
      if (layer) {
        var graphic = this.getGrahpicById(layer, gId);
        if (graphic) {
          var code = 1;
          try {
            layer.remove(graphic);
          } catch(ex) {
            code = -1;
          }

          if (fn) {
            fn.apply(this, [{
              "code": code
            }]);
          }
        }
      }
    },

    /**
     * @description addGraphicToMap
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layerId
     * @param {number} graphicType
     * @param {object} graphicObj
     * @param {boolean} isClear
     * @param {function} fn
     * 
     * @example
     * <caption>Usage of addGraphicToMap</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.addGraphicToMap(layerId,graphicType,graphicObj,isClear,fn);
     * })
     * 
     *
     * 
     */
    addGraphicToMap: function(layerId, graphicType, graphicObj, isClear, fn) {
      if (dojo.isString(graphicObj)) {
        graphicObj = dojo.fromJson(graphicObj);
      }
      var layer = this.createLayerById(layerId, isClear);
      this.addGraphic2Layer(layer, graphicObj, graphicType);
      if (fn) {
        this._layerClickEvtHandle = dojo.connect(layer, "onClick",
        function(evt) {
          fn(layer, evt);
        });
      }
    },

    /**
     * @description createLayerById
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layerId
     * @param {boolean} isClear
     * 
     * @example
     * <caption>Usage of createLayerById</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.createLayerById(layerId,isClear);
     * })
     * 
     *
     * @returns {*}
     */
    createLayerById: function(layerId, isClear) {
      var layer = null;
      if (layerId) {
        layer = this.layerContainer[layerId];
        if (!layer) {
          try {
            layer = new extras.graphic.InfoGraphicLayer({
              id: layerId
            });
          } catch(e) {
            layer = new esri.layers.GraphicsLayer({
              id: layerId
            });
          }

          this.map.addLayer(layer);
          this.layerContainer[layerId] = layer;

          dojo.connect(layer, "onClick",
          function(evt) {
            try {
              graphicClickHandler(evt);
            } catch(e) {

}
          });
        }
      } else {
        layer = this.map.graphics;
      }

      if (isClear) {
        layer.clear();
      }
      this.map.reorderLayer(layer, this.map._layers.length - 1);
      return layer;
    },

    /**
     * @description addGraphic2Layer
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layer
     * @param {object} graphicObj
     * @param {number} graphicType
     * 
     * @example
     * <caption>Usage of addGraphic2Layer</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.addGraphic2Layer(layer,graphicObj,graphicType);
     * })
     * 
     *
     * @returns {*}
     */
    addGraphic2Layer: function(layer, graphicObj, graphicType) {
      var showpopuptype, graphicFeatureSet, attributes, geometry, symbol, infoTemplate, idKey, orgId;
      try {
        showpopuptype = graphicObj.showpopuptype;
        graphicFeatureSet = graphicObj.featureSet;
        if (!graphicFeatureSet) return;
        for (var i = 0,
        il = graphicFeatureSet.length; i < il; i++) {
          idKey = graphicFeatureSet[i].id;
          orgId = graphicFeatureSet[i].orgId;
          attributes = graphicFeatureSet[i].attributes;
          switch (graphicType) {
          case 0:
            var lon = graphicFeatureSet[i].geometry.x,
            lat = graphicFeatureSet[i].geometry.y;
            geometry = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(new esri.geometry.Point(lon, lat)));
            symbol = new esri.symbols.PictureMarkerSymbol(graphicFeatureSet[i].symbol);
            break;
          case 1:
            geometry = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Polyline(geometriesArr[i].paths));
            symbol = new esri.symbols.SimpleLineSymbol(symbolObj);
            break;
          case 2:
            geometry = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Polygon(geometriesArr[i].rings));
            symbol = new esri.symbols.SimpleFillSymbol(symbolObj);
            break;
          }
          var graphic = this.getGrahpicById(layer, idKey);
          if (graphic) {
            geometry && graphic.setGeometry(geometry);
            attributes && graphic.setAttributes(attributes);
            symbol && graphic.setSymbol(symbol);
            if (infoTemplate) {
              if (showpopuptype == undefined) {

} else if (showpopuptype == 0 || showpopuptype == 1) {
                this.map.infoWindow.resize(830, 430);
                infoTemplate = new esri.dijit.PopupTemplate(infoTemplateObj);
                graphic.setInfoTemplate(infoTemplate);
              } else if (showpopuptype == 2) {} else if (showpopuptype == 3) {}
            }
          } else {
            graphic = new esri.Graphic(geometry, symbol, attributes);
            graphic.id = idKey;
            graphic.orgId = orgId;
            if (infoTemplate) {
              if (showpopuptype == undefined) {

} else if (showpopuptype == 0 || showpopuptype == 1) {
                this.map.infoWindow.resize(630, 430);
                infoTemplate = new esri.dijit.PopupTemplate(infoTemplateObj);
                graphic.setInfoTemplate(infoTemplate);
              } else if (showpopuptype == 2) {} else if (showpopuptype == 3) {}
            }
            layer.add(graphic);
          }
        }
      } catch(e) {
        throw new Error("图元添加到图层时错误!" + e);
      }
    },

    /**
     * @description getGrahpicById
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layer
     * @param {number} idKey
     * 
     * @example
     * <caption>Usage of getGrahpicById</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.getGrahpicById(layer,idKey);
     * })
     * 
     *
     * @returns {*}
     */
    getGrahpicById: function(layer, idKey) {
      if (dojo.isString(layer)) {
        layer = this.map.getLayer(layer);
      }
      var graphicsArr = layer.graphics;
      for (var i = 0,
      il = graphicsArr.length; i < il; i++) {
        if (graphicsArr[i].id == idKey) {
          return graphicsArr[i];
        }
      }
      return null;
    },

    /**
     * @description getLayerStyle
     * @method
     * @memberOf module:extras/control/LayerManager#
     * 
     * 
     * @example
     * <caption>Usage of getLayerStyle</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.getLayerStyle();
     * })
     * 
     *
     * 
     */
    getLayerStyle: function() {

},

    /**
     * @description getLayer
     * @method
     * @memberOf module:extras/control/LayerManager#
     * @param {number} layerId
     * 
     * @example
     * <caption>Usage of getLayer</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.getLayer(layerId);
     * })
     * 
     *
     * @returns {*}
     */
    getLayer: function(layerId) {
      return this.layerContainer[layerId];
    },

    /**
     * @description offLayerClickEvt
     * @method
     * @memberOf module:extras/control/LayerManager#
     * 
     * 
     * @example
     * <caption>Usage of offLayerClickEvt</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.offLayerClickEvt();
     * })
     * 
     *
     * 
     */
    offLayerClickEvt: function() {
      this._layerClickEvtHandle && dojo.disconnect(this._layerClickEvtHandle);
    },

    /**
     * @description destroy
     * @method
     * @memberOf module:extras/control/LayerManager#
     * 
     * 
     * @example
     * <caption>Usage of destroy</caption>
     * require(['extras/control/LayerManager'],function(LayerManager){
     *   var instance = new LayerManager();
     *   instance.destroy();
     * })
     * 
     *
     * 
     */
    destroy: function() {
      for (var a in this.layerContainer) {
        this.layerContainer[a].destroy();
      }
      this.layerContainer = {};
    }

  })
});