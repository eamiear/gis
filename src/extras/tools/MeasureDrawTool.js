/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * TODO move to widgets
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a MeasureDrawTool.
 * @module extras/tools/MeasureDrawTool
 *
 * @requires dojo._base.declare,
 * @requires dojo._base.event
 * @requires esri.toolbars.draw
 * @requires esri.symbols.SimpleMarkerSymbol
 * @requires esri.symbols.SimpleLineSymbol
 * @requires esri.symbols.SimpleFillSymbol
 * @requires esri.symbols.PictureMarkerSymbol
 * @requires esri.symbols.Font
 * @requires esri.symbols.TextSymbol
 * @requires esri.layers.GraphicsLayer
 * @requires esri.graphic
 * @requires esri.Color
 * @requires esri.units
 * @requires esri.geometry.geodesicUtils
 * @requires esri.geometry.webMercatorUtils
 */
define([
    "dojo/_base/declare",
    "dojo/_base/connect",
    "dojo/_base/event",
    //"dojo/_base/color",
    "esri/toolbars/draw",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/Font",
    "esri/symbols/TextSymbol",
    "esri/layers/GraphicsLayer",
    "esri/graphic",
    "esri/Color",
    "esri/units",
    "esri/geometry/geodesicUtils",
    "esri/geometry/webMercatorUtils"
  ],
  function (
    declare,
    connect,
    event,
    //dojoColor,
    draw,
    SimpleMarkerSymbol,
    SimpleLineSymbol,
    SimpleFillSymbol,
    PictureMarkerSymbol,
    Font,
    TextSymbol,
    GraphicsLayer,
    Graphic,
    Color,
    units,
    geodesicUtils,
    webMercatorUtils
  ) {
    return declare([draw], /**  @lends module:extras/tools/MeasureDrawTool */ {

        /** @member  DISTANCE */
        DISTANCE: "distance",

        /** @member AREA */
        AREA: "area",

        /** @member AREARPRE */
        AREARPRE: "measure_area_",

        /** @member DISTANCEPRE */
        DISTANCEPRE: "measure_distance_",

        /** @member
          drawType */
        drawType: null,

        /** @member points */
        points: [],

        /** @member latestEndPoint */
        latestEndPoint: null,

        /** @member lastClickPoint */
        lastClickPoint: null,

        /** @member isRunning */
        isRunning: false,

        /** @member lineSymbol */
        lineSymbol: null,

        /** @member fillSymbol */
        fillSymbol: null,

        /** @member measureLayer */
        measureLayer: null,

        /**
         * @constructs
         *
         */
        constructor: function (args) {
          this.inherited(arguments);
          this.map = args.map;
          this.measureTotal = 0;
          declare.safeMixin(this, args);

          this.points = [];
          this._onMapClickHandler = dojo.hitch(this, this._onMapClickHandler);

          this._onDrawEndHandler = dojo.hitch(this, this._onDrawEndHandler);
          this._closeGraphicHandler = dojo.hitch(this, this._closeGraphicHandler);
          this.measureLayer = new GraphicsLayer({ id: "smart_gis_measure_layer" });
          if (this.map) {
            this.map.addLayer(this.measureLayer);
          }
        },

        /**
         * @description activate
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {number} geometryType
         * @param {object} options
         *
         * @example
         * <caption>Usage of activate</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.activate(geometryType,options);
         * })
         */
        activate: function (geometryType, options) {
          this.inherited(arguments);
          this.drawType = geometryType;
          var map = this.map;

          map.reorderLayer(this.measureLayer, map._layers.length - 1);

          this._onMapClickHandler_connect = connect(map, "onClick", this._onMapClickHandler);

          this._onDrawEndHandler_connect = connect(this, "onDrawEnd", this._onDrawEndHandler);
          this.points = [];
          this.isRunning = true;
          this.setTipsText("单击开始测量");
        },

        /**
         * @description deactivate
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         * @example
         * <caption>Usage of deactivate</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.deactivate();
         * })
         */
        deactivate: function () {
          this.inherited(arguments);

          dojo.disconnect(this._onMapClickHandler_connect);
          dojo.disconnect(this._onMapDoubleClickHandler_connect);
          dojo.disconnect(this._onDrawEndHandler_connect);

          if (this.isRunning) {
            suffix = this.drawType = draw.POLYGON ? this.AREARPRE : this.DISTANCEPRE;
            tmpId = suffix + this.measureTotal;
            this.deleteGraphicById(tmpId);
            this.isRunning = false;
          }
        },

        /**
         * @private
         * @description _onMapClickHandler
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} evt
         *
         * @example
         * <caption>Usage of _onMapClickHandler</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance._onMapClickHandler(evt);
         * })
         */
        _onMapClickHandler: function (evt) {
          var endPoint = evt.mapPoint;
          this.lastClickPoint = endPoint;
          this.points.push(this.lastClickPoint);

          var num = 0;
          if (this.drawType == draw.POLYGON) {
            this.updateMeasureArea();
            num = 2;
          } else if (this.drawType == draw.POLYLINE) {
            this.updateMeasureDistance();
            num = 1;
          }

          if (this.points.length >= num) {
            this.setTipsText("双击结束测量");
          } else {
            this.setTipsText("单击继续绘制");
          }
        },

        /**
         * @private
         * @description _onMapDoubleClickHandler
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} evt
         *
         * @example
         * <caption>Usage of _onMapDoubleClickHandler</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance._onMapDoubleClickHandler(evt);
         * })
         */
        _onMapDoubleClickHandler: function (evt) {
          this.points.pop();
          if (this.drawType == draw.POLYGON && this.points.length < 3) {
            this.onDrawEnd();
          }
        },

        /**
         * @private
         * @description _onDrawEndHandler
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {number} geometry
         *
         * @example
         * <caption>Usage of _onDrawEndHandler</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance._onDrawEndHandler(geometry);
         * })
         * @returns {*}
         */
        _onDrawEndHandler: function (geometry) {
          var deleteTimer = null;
          var deleftTimerEndHandler = null;
          if (this.drawType == draw.POLYGON) {
            if (this.points.length < 3) {
              deleftTimerEndHandler = dojo.hitch(this, function () {
                  var tmpId = this.AREARPRE + this.measureTotal;
                  this.deleteGraphicById(tmpId);
                  clearInterval(deleteTimer);
                  deleteTimer = null;
                });
              alert("无法测量面积，请重新绘制");
              this.points = [];
              deleteTimer = setInterval(deleftTimerEndHandler, 200);
              return;
            }
            this.finishMeasureArea(new Graphic(geometry));
            dojo.disconnect(this._onMapClickHandler_connect);
          } else if (this.drawType == draw.POLYLINE) {
            this.finishMeasureDistance(new Graphic(geometry));
            dojo.disconnect(this._onMapClickHandler_connect);
          }
          this.points = [];
        },

        /**
         * @description updateMeasureArea
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         * @example
         * <caption>Usage of updateMeasureArea</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.updateMeasureArea();
         * })
         */
        updateMeasureArea: function () {
          var point = this.points[this.points.length - 1];
          this.drawCircle(point, this.AREA);
        },

        /**
         * @description updateMeasureDistance
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         *
         * @example
         * <caption>Usage of updateMeasureDistance</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.updateMeasureDistance();
         * })
         */
        updateMeasureDistance: function () {
          var pt = null;
          var tmpGraphic = null;
          var atrributes = {};
          atrributes.id = this.DISTANCEPRE + this.measureTotal;
          var textsym = new TextSymbol();
          var font = new Font();
          font.setSize("12px");
          font.setFamily("微软雅黑");
          textsym.setFont(font);
          textsym.setColor(new Color("#000000"));
          textsym.setOffset(40, -5);

          if (this.points.length == 1) {
            pt = this.points[this.points.length - 1];
            this.drawCircle(pt, this.DISTANCE);
            textsym.setOffset(20, -10);
            textsym.setText("起点");
            tmpGraphic = new Graphic(pt, textsym, atrributes);
            this.measureLayer.add(tmpGraphic)
          } else {
            pt = this.points[this.points.length - 1];
            this.drawCircle(pt, this.DISTANCE);
          }
        },

        /**
         * @description finishMeasureArea
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {Graphic | object} graphic
         *
         * @example
         * <caption>Usage of finishMeasureArea</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.finishMeasureArea(graphic);
         * })
         */
        finishMeasureArea: function (graphic) {
          var tmpId = this.AREARPRE + this.measureTotal;
          var attributes = {};
          attributes.id = tmpId;
          graphic.attributes = attributes;
          var transferPolygon = null;
          var resultArray = null;
          graphic.setSymbol(this.fillSymbol);
          this.measureLayer.add(graphic);
          this.latestEndPoint = this.points[this.points.length - 1];
          var polygon = graphic.geometry;

          if (!this.isWebMercator(polygon.spatialReference)) {
            resultArray = geodesicUtils.geodesicAreas([polygon], units.SQUARE_METERS);
          } else {
            transferPolygon = webMercatorUtils.webMercatorToGeographic(polygon);
            resultArray = geodesicUtils.geodesicAreas([transferPolygon], units.SQUARE_METERS);
          }

          var resultTxt = resultArray[0];
          this.drawResult(this.latestEndPoint, resultTxt, this.AREA);
          this.points = [];
        },

        /**
         * @description finishMeasureDistance
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {Graphic | object} graphic
         *
         * @example
         * <caption>Usage of finishMeasureDistance</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.finishMeasureDistance(graphic);
         * })
         */
        finishMeasureDistance: function (graphic) {
          var transferPolyline = null;
          var tmpId = this.DISTANCEPRE + this.measureTotal;
          var attr = {};
          attr.id = tmpId;
          graphic.attributes = attr;

          graphic.setSymbol(this.lineSymbol);
          this.measureLayer.add(graphic);
          this.latestEndPoint = this.points[this.points.length - 1];
          var resultArray = null;
          var polyline = graphic.geometry;
          if (!this.isWebMercator(polyline.spatialReference)) {
            resultArray = geodesicUtils.geodesicLengths([polyline], units.METERS);
          } else {
            transferPolyline = webMercatorUtils.webMercatorToGeographic(polyline);
            resultArray = geodesicUtils.geodesicLengths([transferPolyline], units.METERS);
          }

          var resultTxt = resultArray[0];
          this.drawCircle(this.latestEndPoint, this.DISTANCE);
          this.drawResult(this.latestEndPoint, resultTxt, this.DISTANCE);
          this.measureLengthsCount = 0;
          this.points = [];
        },

        /**
         * @description isWebMercator
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} reference
         *
         * @example
         * <caption>Usage of isWebMercator</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.isWebMercator(reference);
         * })
         * @returns {*}
         */
        isWebMercator: function (reference) {
          var refs = {
            100112: true,
            102113: true,
            102100: true,
            3857: true,
            3785: true,
            54004: true,
            41001: true
          };
          return !!refs[reference.wkid];
        },

        /**
         * @description drawCircle
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} centerPt
         * @param {number} type
         *
         * @example
         * <caption>Usage of drawCircle</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.drawCircle(centerPt,type);
         * })
         */
        drawCircle: function (centerPt, type) {
          var circle = null;
          var timer;
          var timerEndHandler = null;
          var point = centerPt;

          var circleSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_CIRCLE, 9, new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([255, 0, 0]), 2), new Color([255, 255, 255, 1]));

          circle = new Graphic(point, circleSymbol);
          var attr = {};
          if (type == this.DISTANCE) {
            attr.id = this.DISTANCEPRE + this.measureTotal;
            circle.attributes = attr;
            this.measureLayer.add(circle);
          } else {
            timerEndHandler = dojo.hitch(this, function () {
                this.measureLayer.add(circle);
                clearInterval(timer);
                timer = null;
              });
            attr.id = this.AREARPRE + this.measureTotal;
            dojo.hitch(this, timerEndHandler);
            timer = setInterval(timerEndHandler, 200);
            circle.attributes = attr;
          }
        },

        /**
         * @description drawResult
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} pt
         * @param {string} result
         * @param {number} type
         *
         * @example
         * <caption>Usage of drawResult</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.drawResult(pt,result,type);
         * })
         */
        drawResult: function (pt, result, type) {
          var resultText = this.getResultText(result, type);
          var textSymbol = new TextSymbol();
          var p_close = gisConfig.mapImagesUrl + "/measure/close-btn.png";
          var closeMarkSymbol = new PictureMarkerSymbol(p_close, 12, 12);
          closeMarkSymbol.setOffset(13, 0);
          var textsym = new TextSymbol();
          var font = new Font();
          font.setSize("12px");
          font.setFamily("微软雅黑");
          textsym.setFont(font);
          textsym.setColor(new Color("#333333"));
          textsym.setOffset(50, -20);
          textsym.setText(resultText);

          var txtGraphic = new Graphic(pt, textsym);
          var closeGraphic = new Graphic(pt, closeMarkSymbol);

          var attr = {};
          if (type == this.DISTANCE) {
            attr.id = this.DISTANCEPRE + this.measureTotal;
          } else {
            attr.id = this.AREARPRE + this.measureTotal;
          }
          txtGraphic.attributes = attr;
          closeGraphic.attributes = attr;
          closeGraphic.close = true;

          connect(this.measureLayer, "onClick", this._closeGraphicHandler);

          this.measureLayer.add(txtGraphic);
          this.measureLayer.add(closeGraphic);

          var node = txtGraphic.getNode();
          console.log(node);

          this.measureTotal++;
          this.isRunning = false;
          this.deactivate();
        },

        /**
         * @private
         * @description _closeGraphicHandler
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} evt
         *
         * @example
         * <caption>Usage of _closeGraphicHandler</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance._closeGraphicHandler(evt);
         * })
         */
        _closeGraphicHandler: function (evt) {
          event.stop(evt);
          var closeGraphic = evt.graphic;
          if (closeGraphic && closeGraphic.close) {
            var id = closeGraphic.attributes.id;
            this.deleteGraphicById(id);
            this.measureTotal--;
          }
        },

        /**
         * @description deleteGraphicById
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} id
         *
         * @example
         * <caption>Usage of deleteGraphicById</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.deleteGraphicById(id);
         * })
         */
        deleteGraphicById: function (id) {
          var graphicProvider = this.measureLayer.graphics;
          for (var i = graphicProvider.length - 1; i >= 0; i--) {
            var graphic = graphicProvider[i];
            if (graphic && graphic.attributes) {
              if (id == graphic.attributes.id) {
                this.measureLayer.remove(graphic);
              }
            }
          }
        },

        /**
         * @description getResultText
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} result
         * @param {number} type
         *
         * @example
         * <caption>Usage of getResultText</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.getResultText(result,type);
         * })
         * @returns {*}
         */
        getResultText: function (result, type) {
          var scopes = {
            distance: '总长：',
            area: '面积： '
          },
          units = {
            meter: ' 米',
            kilometer: ' 公里',
            squaremeter: ' 平方米',
            squareKilometer: ' 平方公里'
          },
          unitText = '';

          if (type == this.DISTANCE) {
            unitText = units['meter'];
            if (result > 1000) {
              unitText = units['kilometer'];
              result = result / 1000;
            }
            result = Math.floor(result * 100) / 100;
          } else {
            unitText = units['squaremeter'];
            if (result > 1000000) {
              unitText = units['squareKilometer'];
              result = result / 1000000;
            }
            result = Math.floor(result * 100) / 100;
          }
          result = result < 0 ? 0 : result;
          return scopes[type] + result.toFixed(2) + unitText;
        },

        /**
         * @description clearAll
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         * @example
         * <caption>Usage of clearAll</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.clearAll();
         * })
         */
        clearAll: function () {
          var keyword = "measure_";
          var graphicProvider = this.measureLayer.graphics;
          for (var graphic in graphicProvider) {
            if (graphic.attributes != null) {
              if (graphic.attributes.id.indexOf(keyword) > -1) {
                this.measureLayer.remove(graphic);
              }
            }
          }
          this.measureTotal = 0;
        },

        /**
         * @description setTipsText
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} message
         *
         * @example
         * <caption>Usage of setTipsText</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
         *   var instance = new MeasureDrawTool();
         *   instance.setTipsText(message);
         * })
         *
         * @returns {*}
         */
        setTipsText: function (message) {
          var tooltip = this._tooltip;
          if (!tooltip) {
            return;
          }
          tooltip.innerHTML = message;
        }
      })
  });
