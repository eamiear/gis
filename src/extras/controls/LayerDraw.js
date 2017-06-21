/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerDraw.
 * @module extras/control/LayerDraw
 *
 *
 * @requires dojo._base.declare
 * @requires esri.graphic
 * @requires esri.geometry.webMercatorUtils
 * @requires esri.geometry.Circle
 * @requires esri.symbols.SimpleFillSymbol
 * @requires esri.symbols.SimpleLineSymbol
 * @requires esri.symbols.SimpleMarkerSymbol
 * @requires esri.symbols.PictureMarkerSymbol
 * @requires esri.symbols.PictureFillSymbol
 * @requires esri.symbols.Font
 * @requires esri.symbols.TextSymbol
 * @requires esri.toolbars.draw
 */
define([
    "dojo/_base/declare",
    "esri/graphic",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Circle",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/PictureFillSymbol",
    "esri/symbols/Font",
    "esri/symbols/TextSymbol",
    "esri/toolbars/draw"],
  function (declare,
            graphic,
            webMercatorUtils,
            Circle,
            SimpleFillSymbol,
            SimpleLineSymbol,
            SimpleMarkerSymbol,
            PictureMarkerSymbol,
            PictureFillSymbol,
            Font,
            TextSymbol,
            draw) {
    return declare(null,
      /**  @lends module:extras/control/LayerDraw */
      {

        /**
         * @constructs
         * @param {string} map
         */
        constructor: function (map) {

          dojo.subscribe("toolBarLoadedEvent", this, "initLayerDraw");

          this.defaultSymbol = {
            "Point": {
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
              yoffset: 0
            },
            "Image": {
              type: "esriPMS",
              angle: 0,
              width: 32,
              height: 32,
              xoffset: 0,
              yoffset: 0,
              url: selfUrl + "/themes/default/img/tt.png"
            },
            "Text": {
              type: "esriTS",
              angle: 0,
              color: [51, 51, 51, 255],
              font: {
                family: "微软雅黑",
                size: 12,
                style: "normal",
                variant: "normal",
                weight: "normal"
              },
              horizontalAlignment: "center",
              kerning: true,
              rotated: false,
              text: "添加默认文本",
              xoffset: 0,
              yoffset: 0
            },
            "Line": {
              type: "esriSLS",
              style: "esriSLSSolid",
              width: 3,
              color: [255, 0, 0, 255]
            },
            "Polygon": {
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

        },

        /**
         * @description initLayerDraw
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {string} toolbar
         *
         * @example
         * <caption>Usage of initLayerDraw</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.initLayerDraw(toolbar);
     * })
         *
         *
         *
         */
        initLayerDraw: function (toolbar) {
          this.toolbar = toolbar;
        },

        /**
         * @description addPictureFill
         * @method
         * @memberOf module:extras/control/LayerDraw#
         *
         *
         * @example
         * <caption>Usage of addPictureFill</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addPictureFill();
     * })
         *
         *
         * @returns {*}
         */
        addPictureFill: function () {
          var ext = webMercatorUtils.geographicToWebMercator(new esri.geometry.Extent(60.568, 13.978, 67.668, 32.678));
          var pictureFillSymbol = new PictureFillSymbol({
            "url": selfUrl + "/themes/default/images/tt2.jpg",
            "height": 900,
            "width": 1200,
            "type": "esriPMS"
          });

          pictureFillSymbol.setYScale(1);
          var attributs = {};
          var graphic = new Graphic(ext, pictureFillSymbol, attributs);
          this.toolbar.drawLayer.add(graphic);
          return graphic;
        },

        /**
         * @description addPointByImage
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} x
         * @param {number} y
         * @param {number} symbol
         * @param {string} attributs
         *
         * @example
         * <caption>Usage of addPointByImage</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addPointByImage(x,y,symbol,attributs);
     * })
         *
         *
         * @returns {*}
         */
        addPointByImage: function (x, y, symbol, attributs) {
          var pt = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(x), parseFloat(y)));
          var pictureSymbol = new PictureMarkerSymbol(symbol || this.defaultSymbol.Image);
          var graphic = new Graphic(pt, pictureSymbol, attributs);
          this.toolbar.drawLayer.add(graphic);
          return graphic;
        },

        /**
         * @description addPointByText
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} x
         * @param {number} y
         * @param {number} textSymbol
         * @param {string} attributs
         *
         * @example
         * <caption>Usage of addPointByText</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addPointByText(x,y,textSymbol,attributs);
     * })
         *
         *
         * @returns {*}
         */
        addPointByText: function (x, y, textSymbol, attributs) {
          var pt = webMercatorUtils.geographicToWebMercator(new Point(parseFloat(x), parseFloat(y)));
          var textsym = new TextSymbol(textSymbol || this.defaultSymbol.Text);
          var graphic = new Graphic(pt, textsym, attributs);
          this.toolbar.drawLayer.add(graphic);

          return graphic;
        },

        /**
         * @description addPolyline
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {string} points
         * @param {number} lineSymbol
         * @param {string} attributs
         *
         * @example
         * <caption>Usage of addPolyline</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addPolyline(points,lineSymbol,attributs);
     * })
         *
         *
         * @returns {*}
         */
        addPolyline: function (points, lineSymbol, attributs) {
          var pt = webMercatorUtils.geographicToWebMercator(new Polyline(points));
          var textsym = new SimpleLineSymbol(lineSymbol || this.defaultSymbol.Line);
          var graphic = new Graphic(pt, textsym, attributs);
          this.toolbar.drawLayer.add(graphic);
          return graphic;
        },

        /**
         * @description addPolygon
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {string} points
         * @param {number} fillSymbol
         * @param {string} attributs
         *
         * @example
         * <caption>Usage of addPolygon</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addPolygon(points,fillSymbol,attributs);
     * })
         *
         *
         * @returns {*}
         */
        addPolygon: function (points, fillSymbol, attributs) {
          var pt = webMercatorUtils.geographicToWebMercator(new Polygon(points));
          var textsym = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
          var graphic = new Graphic(pt, textsym, attributs);
          this.toolbar.drawLayer.add(graphic);
          return graphic;
        },

        /**
         * @description addCircle
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {object} params
         * @param {number} fillSymbol
         * @param {string} attributs
         *
         * @example
         * <caption>Usage of addCircle</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addCircle(params,fillSymbol,attributs);
     * })
         *
         *
         * @returns {*}
         */
        addCircle: function (params, fillSymbol, attributs) {
          var pt = new Circle(params);
          var textsym = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
          var graphic = new Graphic(pt, textsym, attributs);
          this.toolbar.drawLayer.add(graphic);
          return graphic;
        },

        /**
         * @description addExtent
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {object} params
         * @param {string} id
         * @param {number} fillSymbol
         *
         * @example
         * <caption>Usage of addExtent</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.addExtent(params,id,fillSymbol);
     * })
         *
         *
         *
         */
        addExtent: function (params, id, fillSymbol) {
          var pt = new Extent(params);
          var textsym = new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon);
          var graphic = new Graphic(pt, textsym, null);
          id && (graphic.id = id);
          this.toolbar.drawLayer.add(graphic);
        },

        /**
         * @description drawPointByMark
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} symbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawPointByMark</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawPointByMark(symbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawPointByMark: function (symbol, returnFunction) {
          this.toolbar.draw(draw.POINT, new SimpleMarkerSymbol(symbol || this.defaultSymbol.Point), returnFunction);
        },

        /**
         * @description drawPointByImage
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} symbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawPointByImage</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawPointByImage(symbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawPointByImage: function (symbol, returnFunction) {
          this.toolbar.draw(draw.POINT, new PictureMarkerSymbol(symbol || this.defaultSymbol.Image), returnFunction);
        },

        /**
         * @description drawPointByText
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} textSymbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawPointByText</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawPointByText(textSymbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawPointByText: function (textSymbol, returnFunction) {
          this.toolbar.draw(draw.POINT, new TextSymbol(textSymbol || this.defaultSymbol.Text), returnFunction);
        },

        /**
         * @description drawPolyline
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} lineSymbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawPolyline</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawPolyline(lineSymbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawPolyline: function (lineSymbol, returnFunction) {
          this.toolbar.draw(draw.POLYLINE, new SimpleLineSymbol(lineSymbol || this.defaultSymbol.Line), returnFunction);
        },

        /**
         * @description drawPolygon
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} fillSymbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawPolygon</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawPolygon(fillSymbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawPolygon: function (fillSymbol, returnFunction) {
          this.toolbar.draw(draw.POLYGON, new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon), returnFunction);
        },

        /**
         * @description drawCircle
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} fillSymbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawCircle</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawCircle(fillSymbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawCircle: function (fillSymbol, returnFunction) {
          this.toolbar.draw(draw.CIRCLE, new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon), returnFunction);
        },

        /**
         * @description drawExtent
         * @method
         * @memberOf module:extras/control/LayerDraw#
         * @param {number} fillSymbol
         * @param {function} returnFunction
         *
         * @example
         * <caption>Usage of drawExtent</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.drawExtent(fillSymbol,returnFunction);
     * })
         *
         *
         * @returns string
         */
        drawExtent: function (fillSymbol, returnFunction) {
          this.toolbar.draw(draw.EXTENT, new SimpleFillSymbol(fillSymbol || this.defaultSymbol.Polygon), returnFunction);
        },

        /**
         * @description endDraw
         * @method
         * @memberOf module:extras/control/LayerDraw#
         *
         *
         * @example
         * <caption>Usage of endDraw</caption>
         * require(['extras/control/LayerDraw'],function(LayerDraw){
     *   var instance = new LayerDraw(map);
     *   instance.endDraw();
     * })
         *
         *
         *
         */
        endDraw: function () {
          this.toolbar.deactivateToolbar();
        }

      })
  });
