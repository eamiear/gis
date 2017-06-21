/**
 * Created by sk_ on 2017-6-10.
 */

/**
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
    "dojo/_base/event",
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
  function (declare,
            event,
            draw,
            SimpleMarkerSymbol,
            SimpleLineSymbol,
            SimpleFillSymbol,
            PictureMarkerSymbol,
            Font,
            TextSymbol,
            GraphicsLayer,
            graphic,
            Color,
            units,
            geodesicUtils,
            webMercatorUtils) {
    return declare([draw],
      /**  @lends module:extras/tools/MeasureDrawTool */
      {

        /** @member
          DISTANCE */
        DISTANCE: "distance",

        /** @member
          AREA */
        AREA: "area",

        /** @member
          AREARPRE */
        AREARPRE: "measure_area_",

        /** @member
          DISTANCEPRE */
        DISTANCEPRE: "measure_distance_",

        /** @member
          drawType */
        drawType: null,

        /** @member
          points */
        points: [],

        /** @member
          latestEndPoint */
        latestEndPoint: null,

        /** @member
          lastClickPoint */
        lastClickPoint: null,

        /** @member
          isRunning */
        isRunning: false,

        /** @member
          lineSymbol */
        lineSymbol: null,

        /** @member
          fillSymbol */
        fillSymbol: null,

        /** @member
          measureLayer */
        measureLayer: null,

        /**
         * @constructs
         *
         */
        constructor: function () {

          this.inherited(arguments);
          this.points = [];
          this._onMapClickHandler = dojo.hitch(this, this._onMapClickHandler);

          this._onDrawEndHandler = dojo.hitch(this, this._onDrawEndHandler);
          this._closeGraphicHandler = dojo.hitch(this, this._closeGraphicHandler);
          this.measureLayer = new esri.layers.GraphicsLayer({
            id: "GXX_GIS_MEAREALAYER_RESULT"
          });
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
         *
         *
         *
         */
        activate: function (geometryType, options) {
          this.inherited(arguments);
          this.drawType = geometryType;
          var map = this.map;

          map.reorderLayer(this.measureLayer, map._layers.length - 1);

          this._onMapClickHandler_connect = dojo.connect(map, "onClick", this._onMapClickHandler);

          this._onDrawEndHandler_connect = dojo.connect(this, "onDrawEnd", this._onDrawEndHandler);
          this.points = [];
          this.isRunning = true;
          this.setTipsText("单击开始测量");
        },

        /**
         * @description deactivate
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         *
         * @example
         * <caption>Usage of deactivate</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
     *   var instance = new MeasureDrawTool();
     *   instance.deactivate();
     * })
         *
         *
         *
         */
        deactivate: function () {
          this.inherited(arguments);

          dojo.disconnect(this._onMapClickHandler_connect);
          dojo.disconnect(this._onMapDoubleClickHandler_connect);
          dojo.disconnect(this._onDrawEndHandler_connect);

          if (this.isRunning) {
            suffix = this.drawType = esri.toolbars.draw.POLYGON ? this.AREARPRE : this.DISTANCEPRE;
            tmpId = suffix + djConfig.measureTotal;
            this.deleteGraphicById(tmpId);
            this.isRunning = false;
          }
        },

        /**
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
         *
         *
         *
         */
        _onMapClickHandler: function (evt) {
          var endPoint = evt.mapPoint;
          this.lastClickPoint = endPoint;
          this.points.push(this.lastClickPoint);

          var num = 0;
          if (this.drawType == esri.toolbars.draw.POLYGON) {
            this.updateMeasureArea();
            num = 2;
          } else if (this.drawType == esri.toolbars.draw.POLYLINE) {
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
         *
         *
         *
         */
        _onMapDoubleClickHandler: function (evt) {
          this.points.pop();
          if (this.drawType == esri.toolbars.draw.POLYGON && this.points.length < 3) {
            this.onDrawEnd();
          }
        },

        /**
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
         *
         *
         * @returns {*}
         */
        _onDrawEndHandler: function (geometry) {
          var deleteTimer = null;
          var deleftTimerEndHandler = null;
          if (this.drawType == esri.toolbars.draw.POLYGON) {
            if (this.points.length < 3) {
              deleftTimerEndHandler = dojo.hitch(this,
                function () {
                  var tmpId = this.AREARPRE + djConfig.measureTotal;
                  this.deleteGraphicById(tmpId);
                  clearInterval(deleteTimer);
                  deleteTimer = null;
                });
              alert("无法测量面积，请重新绘制");
              this.points = [];
              deleteTimer = setInterval(deleftTimerEndHandler, 200);
              return;
            }
            this.finishMeasureArea(new esri.Graphic(geometry));
            dojo.disconnect(this._onMapClickHandler_connect);
          } else if (this.drawType == esri.toolbars.draw.POLYLINE) {
            this.finishMeasureDistance(new esri.Graphic(geometry));
            dojo.disconnect(this._onMapClickHandler_connect);
          }
          this.points = [];
        },

        /**
         * @description updateMeasureArea
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         *
         * @example
         * <caption>Usage of updateMeasureArea</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
     *   var instance = new MeasureDrawTool();
     *   instance.updateMeasureArea();
     * })
         *
         *
         *
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
         *
         *
         *
         */
        updateMeasureDistance: function () {
          var pt = null;
          var tmpGraphic = null;
          var atrributes = {};
          atrributes.id = this.DISTANCEPRE + djConfig.measureTotal;
          var textsym = new esri.symbols.TextSymbol();
          var font = new esri.symbols.Font();
          font.setSize("12px");
          font.setFamily("微软雅黑");
          textsym.setFont(font);
          textsym.setColor(new esri.Color("#000000"));
          textsym.setOffset(40, -5);

          if (this.points.length == 1) {
            pt = this.points[this.points.length - 1];
            this.drawCircle(pt, this.DISTANCE);
            textsym.setOffset(20, -10);
            textsym.setText("起点");
            tmpGraphic = new esri.Graphic(pt, textsym, atrributes);
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
         * @param {string} graphic
         *
         * @example
         * <caption>Usage of finishMeasureArea</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
     *   var instance = new MeasureDrawTool();
     *   instance.finishMeasureArea(graphic);
     * })
         *
         *
         *
         */
        finishMeasureArea: function (graphic) {
          var tmpId = this.AREARPRE + djConfig.measureTotal;
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
            resultArray = esri.geometry.geodesicUtils.geodesicAreas([polygon], esri.units.SQUARE_METERS);
          } else {
            transferPolygon = esri.geometry.webMercatorUtils.webMercatorToGeographic(polygon);
            resultArray = esri.geometry.geodesicUtils.geodesicAreas([transferPolygon], esri.units.SQUARE_METERS);
          }

          var resultTxt = resultArray[0];
          this.drawResult(this.latestEndPoint, resultTxt, this.AREA);
          this.points = [];
        },

        /**
         * @description finishMeasureDistance
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         * @param {string} graphic
         *
         * @example
         * <caption>Usage of finishMeasureDistance</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
     *   var instance = new MeasureDrawTool();
     *   instance.finishMeasureDistance(graphic);
     * })
         *
         *
         *
         */
        finishMeasureDistance: function (graphic) {
          var transferPolyline = null;
          var tmpId = this.DISTANCEPRE + djConfig.measureTotal;
          var attr = {}
          attr.id = tmpId;
          graphic.attributes = attr;

          graphic.setSymbol(this.lineSymbol);
          this.measureLayer.add(graphic);
          this.latestEndPoint = this.points[this.points.length - 1];
          var resultArray = null;
          var polyline = graphic.geometry;
          if (!this.isWebMercator(polyline.spatialReference)) {
            resultArray = esri.geometry.geodesicUtils.geodesicLengths([polyline], esri.units.METERS);
          } else {
            transferPolyline = esri.geometry.webMercatorUtils.webMercatorToGeographic(polyline);
            resultArray = esri.geometry.geodesicUtils.geodesicLengths([transferPolyline], esri.units.METERS);
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
         *
         *
         * @returns {*}
         */
        isWebMercator: function (reference) {
          var resultFlag = false;

          switch (reference.wkid) {
            case 100112:
            {
              resultFlag = true;
              break;
            }
            case 102113:
            {
              resultFlag = true;
              break;
            }
            case 102100:
            {
              resultFlag = true;
              break;
            }
            case 3857:
            {
              resultFlag = true;
              break;
            }
            case 3785:
            {
              resultFlag = true;
              break;
            }
          }
          return resultFlag;
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
         *
         *
         *
         */
        drawCircle: function (centerPt, type) {
          var circle = null;
          var timer;
          var timerEndHandler = null;
          var point = centerPt;

          var circleSymbol = new esri.symbols.SimpleMarkerSymbol(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE, 9, new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, new esri.Color([255, 0, 0]), 2), new dojo.Color([255, 255, 255, 1]));

          circle = new esri.Graphic(point, circleSymbol);
          var attr = new Object();
          if (type == this.DISTANCE) {
            attr.id = this.DISTANCEPRE + djConfig.measureTotal;
            circle.attributes = attr;
            this.measureLayer.add(circle);
          } else {
            timerEndHandler = dojo.hitch(this,
              function () {
                this.measureLayer.add(circle);
                clearInterval(timer);
                timer = null;
              });
            attr.id = this.AREARPRE + djConfig.measureTotal;
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
         *
         *
         *
         */
        drawResult: function (pt, result, type) {
          var resultText = this.getResultText(result, type);
          var textSymbol = new esri.symbols.TextSymbol();
          var p_close = selfUrl + "/themes/default/img/close-btn.png"
          var closeMarkSymbol = new esri.symbols.PictureMarkerSymbol(p_close, 12, 12);
          closeMarkSymbol.setOffset(13, 0);
          var textsym = new esri.symbols.TextSymbol();
          var font = new esri.symbols.Font();
          font.setSize("12px");
          font.setFamily("微软雅黑");
          textsym.setFont(font);
          textsym.setColor(new esri.Color("#333333"));
          textsym.setOffset(50, -20);
          textsym.setText(resultText);

          var txtGraphic = new esri.Graphic(pt, textsym);
          var closeGraphic = new esri.Graphic(pt, closeMarkSymbol);

          var attr = {};
          if (type == this.DISTANCE) {
            attr.id = this.DISTANCEPRE + djConfig.measureTotal;
          } else {
            attr.id = this.AREARPRE + djConfig.measureTotal;
          }
          txtGraphic.attributes = attr;
          closeGraphic.attributes = attr;
          closeGraphic.close = true;

          dojo.connect(this.measureLayer, "onClick", this._closeGraphicHandler);

          this.measureLayer.add(txtGraphic);
          this.measureLayer.add(closeGraphic);

          var node = txtGraphic.getNode();
          console.log(node);

          djConfig.measureTotal++;
          this.isRunning = false;
          this.deactivate();
        },

        /**
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
         *
         *
         *
         */
        _closeGraphicHandler: function (evt) {
          dojo._base.event.stop(evt);
          var closeGraphic = evt.graphic;
          if (closeGraphic && closeGraphic.close) {
            var id = closeGraphic.attributes.id;
            this.deleteGraphicById(id);
            djConfig.measureTotal--;
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
         *
         *
         *
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
         *
         *
         * @returns {*}
         */
        getResultText: function (result, type) {
          var resultTxt = "";
          var allTxt = "";
          var unitTxt = "";
          if (type == this.DISTANCE) {
            allTxt = "总长：";
            unitTxt = " 米";
            if (result > 1000) {
              unitTxt = " 公里";
              result = result / 1000;
            }
            result = Math.floor(result * 100) / 100;
          } else {
            allTxt = "面积： ";
            unitTxt = "平方米";
            if (result > 1000000) {
              result = result / 1000000;
              unitTxt = " 平方公里";
            }
            result = Math.floor(result * 100) / 100;
          }

          result = result < 0 ? (0) : result;
          resultTxt = result.toFixed(2);

          resultTxt = allTxt + resultTxt + unitTxt;
          return resultTxt;
        },

        /**
         * @description clearAll
         * @method
         * @memberOf module:extras/tools/MeasureDrawTool#
         *
         *
         * @example
         * <caption>Usage of clearAll</caption>
         * require(['extras/tools/MeasureDrawTool'],function(MeasureDrawTool){
     *   var instance = new MeasureDrawTool();
     *   instance.clearAll();
     * })
         *
         *
         *
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
          djConfig.measureTotal = 0;
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
