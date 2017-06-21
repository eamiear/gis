/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerLocate.
 * @module extras/control/LayerLocate
 *
 *
 * @requires dojo._base.declare
 * @requires esri.graphic
 * @requires esri.symbols.PictureMarkerSymbol
 * @requires esri.symbols.SimpleMarkerSymbol
 * @requires esri.SpatialReference
 * @requires esri.layers.GraphicsLayer
 * @requires dojo.fx
 */
define([
    "dojo/_base/declare",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/SpatialReference",
    "esri/layers/GraphicsLayer",
    "dojo/fx"],
  function (declare,
            graphic,
            PictureMarkerSymbol,
            SimpleMarkerSymbol,
            SpatialReference,
            GraphicsLayer,
            fx) {
    return declare(null,
      /**  @lends module:extras/control/LayerLocate */
      {

        /** @member
          setIntervalhandler */
        setIntervalhandler: null,

        /** @member
          locateLayer */
        locateLayer: null,

        /**
         * @constructs
         *
         */
        constructor: function () {

          dojo.subscribe("mapLoadedEvent", this, "initLayerLocate");

          this.spatialReference = new SpatialReference({
            wkid: 102100
          });
          this.duration = 1000;
          this.rate = 50;
          this.indexFill = 0;

          this.hightSymbol = {
            "Point": {
              "type": "esriPMS",
              "angle": 0,
              "width": 20,
              "height": 20,
              "xoffset": 0,
              "yoffset": 0,
              "url": selfUrl + "/themes/default/img/info.gif"
            },
            "Line": {
              strokeWeight: 3,
              strokeOpacity: 1,
              strokeColor: "#e6111b",
              strokeDashstyle: "longdashdotdot"
            },
            "Polygon": {
              strokeWeight: 2,
              strokeOpacity: 1,
              strokeColor: "#2b07e5",
              fillColor: "#2b07e5",
              fillOpacity: 0.6,
              strokeDashstyle: "longdashdotdot"
            }
          };

        },

        /**
         * @description initLayerLocate
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {string} map
         *
         * @example
         * <caption>Usage of initLayerLocate</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.initLayerLocate(map);
     * })
         */
        initLayerLocate: function (map) {
          this.map = map;
          if (!this.locateLayer) {
            this.locateLayer = new GraphicsLayer({
              id: "GXX_GIS_LAYER_LOCATE"
            });
            this.map.addLayer(this.locateLayer);
          }

          if (this.line_1 == null || this.line_2 == null || this.line_3 == null || this.line_4 == null) {
            this.line_1 = this.createImg("line_1.png");
            this.line_2 = this.createImg("line_1.png");
            this.line_3 = this.createImg("line_2.png");
            this.line_4 = this.createImg("line_2.png");
          }
        },

        /**
         * @description unHightlightOnMap
         * @method
         * @memberOf module:extras/control/LayerLocate#
         *
         *
         * @example
         * <caption>Usage of unHightlightOnMap</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.unHightlightOnMap();
     * })
         *
         *
         *
         */
        unHightlightOnMap: function () {
          if (this.setIntervalhandler) {
            window.clearInterval(this.setIntervalhandler);
          }
          this.locateLayer.clear();
        },

        /**
         * @description locate
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {number} geometry
         * @param {boolean} isCenter
         * @param {boolean} isEffect
         * @param {number} zoom
         * @param {number} style
         * @param {function} fn
         * @param {string} endStatic
         *
         * @example
         * <caption>Usage of locate</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.locate(geometry,isCenter,isEffect,zoom,style,fn,endStatic);
     * })
         *
         *
         *
         */
        locate: function (geometry, isCenter, isEffect, zoom, style, fn, endStatic) {
          var center = null;
          if (geometry) {
            geometry = webMercatorUtils.geographicToWebMercator(geometry);
            center = geometry;

            if (isEffect || (zoom == null || this.map.getZoom() <= zoom || isNaN(zoom))) {
              this.startBoxEffect(this.map.toScreen(center));
            }

            var me = this;
            setTimeout(function () {
                if (zoom == null && geometry.type != "point") {

                } else {
                  if (isCenter || !(me.map.extent.intersects(center) || me.map.extent.contains(center))) {

                    me.map.centerAndZoom(center, zoom);
                  }
                }

                me.hightlightOnMap(geometry, endStatic, style);

                if (fn) {
                  fn(center);
                }
              },
              1000);

          }

        },

        /**
         * @description locateByPoint
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {number} x
         * @param {number} y
         * @param {number} zoom
         * @param {boolean} isCenter
         * @param {boolean} isEffect
         * @param {number} style
         * @param {function} fn
         * @param {string} endStatic
         *
         * @example
         * <caption>Usage of locateByPoint</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.locateByPoint(x,y,zoom,isCenter,isEffect,style,fn,endStatic);
     * })
         *
         *
         * @returns string
         */
        locateByPoint: function (x, y, zoom, isCenter, isEffect, style, fn, endStatic) {
          var geometry = new Point(x, y, this.spatialReference);
          if (endStatic == undefined) {
            endStatic = true;
          }
          return this.locate(geometry, isCenter, isEffect, zoom, style, fn, endStatic);
        },

        /**
         * @description locateByPolyline
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {string} points
         * @param {number} zoom
         * @param {boolean} isCenter
         * @param {boolean}  isEffect
         * @param {number} style
         * @param {function} fn
         * @param {string} endStatic
         *
         * @example
         * <caption>Usage of locateByPolyline</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.locateByPolyline(points,zoom,isCenter, isEffect,style,fn,endStatic);
     * })
         *
         *
         * @returns string
         */
        locateByPolyline: function (points, zoom, isCenter, isEffect, style, fn, endStatic) {
          var geometry = null;
          if (endStatic == undefined) {
            endStatic = true;
          }
          return this.locate(geometry, isCenter, isEffect, zoom.style, fn, endStatic);
        },

        /**
         * @description locateByPolygon
         * @method
         * @memberOf module:extras/control/LayerLocate#
         *
         *
         * @example
         * <caption>Usage of locateByPolygon</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.locateByPolygon();
     * })
         *
         *
         * @returns string
         */
        locateByPolygon: function () {
          var geometry = null;
          return this.locate(geometry, isCenter, isEffect, zoom);
        },

        /**
         * @description locateByGeometry
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {number} geometry
         * @param {number} zoom
         * @param {boolean} isCenter
         * @param {boolean}  isEffect
         * @param {function} fn
         * @param {string} endStatic
         *
         * @example
         * <caption>Usage of locateByGeometry</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.locateByGeometry(geometry,zoom,isCenter, isEffect,fn,endStatic);
     * })
         *
         *
         * @returns string
         */
        locateByGeometry: function (geometry, zoom, isCenter, isEffect, fn, endStatic) {
          if (endStatic == undefined) {
            endStatic = true;
          }
          return this.locate(geometry, isCenter, isEffect, zoom, fn, endStatic);
        },

        /**
         * @description locateMultiGeometry
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {number} geometry
         *
         * @example
         * <caption>Usage of locateMultiGeometry</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.locateMultiGeometry(geometry);
     * })
         *
         *
         *
         */
        locateMultiGeometry: function (geometry) {
          if (typeof(geometry) == "object") {
            geometry = [geometry];
          }

          var exent = null;
          this.map.zoomToExtent(extent);
        },

        /**
         * @description hightlightOnMap
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {number} geometry
         * @param {string} endStatic
         * @param {number} style
         *
         * @example
         * <caption>Usage of hightlightOnMap</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.hightlightOnMap(geometry,endStatic,style);
     * })
         *
         *
         *
         */
        hightlightOnMap: function (geometry, endStatic, style) {
          var graphic = null;

          switch (geometry.type) {
            case "multipoint":
            case "point":
              graphic = new Graphic(geometry, style || new PictureMarkerSymbol(this.hightSymbol.Point));
              break;
            case "polygon":
              graphic = new Graphic(geometry, style);
              break;
            case "polyline":
              graphic = new Graphic(geometry, style);
              break;
          }

          this.unHightlightOnMap();
          this.locateLayer.clear();
          graphic.id = "locate_graphic";
          this.locateLayer.add(graphic);
          this.hightGraphic = graphic;

          var stateInterval = true;
          var endStaticIndex = 0;

          this.setIntervalhandler = window.setInterval(dojo.hitch(this,
            function () {
              endStaticIndex++;
              var mapDiv = dojo.byId(this.hightGraphic.id);
              if (!this.hightGraphic) {
                window.clearInterval(this.setIntervalhandler);
              } else {

                if (stateInterval) {
                  this.hightGraphic.hide();
                } else {
                  this.hightGraphic.show();
                }
              }
              stateInterval = !stateInterval;
              if (endStatic && endStaticIndex >= 8) {
                this.unHightlightOnMap();
              }
            }), 1000)
        },

        /**
         * @description startBoxEffect
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {string} center
         *
         * @example
         * <caption>Usage of startBoxEffect</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.startBoxEffect(center);
     * })
         *
         *
         *
         */
        startBoxEffect: function (center) {

          var animations = [];
          var coords = dojo.coords(dojo.byId(this.map.id));

          animations.push(this.fxResize(this.line_1, {
              left: 0,
              top: center.y,
              width: 50,
              height: 9
            },
            {
              left: center.x - 4,
              top: center.y - 4,
              width: 10,
              height: 9
            }));
          animations.push(this.fxResize(this.line_2, {
              left: coords.w,
              top: center.y,
              width: 50,
              height: 9
            },
            {
              left: center.x - 4,
              top: center.y - 4,
              width: 10,
              height: 9
            }));
          animations.push(this.fxResize(this.line_3, {
              left: center.x,
              top: 0,
              width: 9,
              height: 50
            },
            {
              left: center.x - 4,
              top: center.y,
              width: 9,
              height: 10
            }));
          animations.push(this.fxResize(this.line_4, {
              left: center.x,
              top: coords.h,
              width: 9,
              height: 50
            },
            {
              left: center.x - 4,
              top: center.y - 10,
              width: 9,
              height: 10
            }));
          fx.combine(animations).play();
        },

        /**
         * @description fxResize
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {string} node
         * @param {string}  start
         * @param {string}  end
         *
         * @example
         * <caption>Usage of fxResize</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.fxResize(node, start, end);
     * })
         *
         *
         * @returns string
         */
        fxResize: function (node, start, end) {
          return dojo.animateProperty({
            node: node,
            properties: {
              left: {
                start: start.left,
                end: end.left
              },
              top: {
                start: start.top,
                end: end.top
              },
              width: {
                start: start.width,
                end: end.width
              },
              height: {
                start: start.height,
                end: end.height
              }
            },
            duration: this.duration,
            rate: this.rate,
            beforeBegin: dojo.hitch(this,
              function () {
                dojo.style(node, "display", "");
              }),
            onEnd: dojo.hitch(this,
              function () {
                dojo.style(node, "display", "none");
              })
          })
        },

        /**
         * @description createImg
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {string} src
         *
         * @example
         * <caption>Usage of createImg</caption>
         * require(['extras/control/LayerLocate'],function(LayerLocate){
     *   var instance = new LayerLocate();
     *   instance.createImg(src);
     * })
         *
         *
         * @returns {*}
         */
        createImg: function (src) {
          var node = document.createElement("img");
          node.src = selfUrl + "/themes/default/img/" + src;
          node.style.position = "absolute";
          node.style.zIndex = 9999;
          node.style.display = "none";

          var mapDiv = dojo.byId(this.map.id);
          mapDiv.appendChild(node);
          return node;
        }

      })
  });
