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
 * @requires esri.SpatialReference
 * @requires esri.layers.GraphicsLayer
 * @requires dojo.fx
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/fx",
    "esri/graphic",
    "esri/symbols/PictureMarkerSymbol",
    "esri/SpatialReference",
    "esri/layers/GraphicsLayer",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Geometry",
    "esri/geometry/Point",
    "esri/geometry/Polyline",
    "esri/geometry/Polygon",
    "extras/basic/Radical"],
  function (
    declare,
    lang,
    fx,
    Graphic,
    PictureMarkerSymbol,
    SpatialReference,
    GraphicsLayer,
    WebMercatorUtils,
    Geometry,
    Point,
    Polyline,
    Polygon,
    Radical
  ) {
    return declare(Radical, /**  @lends module:extras/control/LayerLocate */{
        /** @member setIntervalhandler */
        setIntervalhandler: null,

        /** @member  locateLayer */
        locateLayer: null,

        /**
         * @constructs
         *
         */
        constructor: function () {

          dojo.subscribe("mapLoadedEvent", this, "initLayerLocate");

          this.spatialReference = new SpatialReference({wkid: 102100});
          this.duration = 1000;
          this.rate = 50;
          this.indexFill = 0;

          this.hightSymbol = {
            "Point": {
              "type": "esriPMS",
              "angle": 0,
              "width": 30,
              "height": 30,
              "xoffset": 0,
              "yoffset": 0,
              "url": gisConfig.mapImagesUrl + "/marker/default/circle.png"
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
          this.locateLayer = this.createLayer({layerId: this.defaultLayerIds.locateLayerId});
          //if (!this.locateLayer) {
          //  this.locateLayer = new GraphicsLayer({id: this.defaultLayerIds.locateLayerId});
          //  this.map.addLayer(this.locateLayer);
          //}

          //if (this.line_1 == null || this.line_2 == null || this.line_3 == null || this.line_4 == null) {
          //  this.line_1 = this.createImg("line_1.png");
          //  this.line_2 = this.createImg("line_1.png");
          //  this.line_3 = this.createImg("line_2.png");
          //  this.line_4 = this.createImg("line_2.png");
          //}
        },



        /**
         * @description locate
         * @method
         * @memberOf module:extras/control/LayerLocate#
         * @param {object} options
         * @param {array|object} options.geometry
         * @param {boolean}   [options.isCenter]
         * @param {boolean}   [options.isExtent]
         * @param {number}    [options.zoom]
         * @param {function}  [options.beforeLocate]
         * @param {function}  [options.located]
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
        locate: function (options) {
          var geometry = options.geometry,
            isCenter = options.isCenter,
            isExtent = options.isExtent,
            zoom = options.zoom,
            beforeLocate = options.beforeLocate,
            located = options.located,
            centerPoint,
            geometryExtent,
            deferred;

          if(geometry){
            if(geometry instanceof Geometry){
              centerPoint = this.getGeometryCenter(geometry);
            }else if(geometry instanceof Array && geometry.length){
              centerPoint = new Point(geometry[0],geometry[1],this.map.spatialReference);
            }else if(geometry instanceof Object && geometry.x && geometry.y){
              centerPoint = new Point(geometry.x,geometry.y,this.map.spatialReference);
            }

            if (!centerPoint.spatialReference.isWebMercator() || this.isGeometry(centerPoint)){
              centerPoint = WebMercatorUtils.geographicToWebMercator(centerPoint);
            }
            beforeLocate && beforeLocate();
            if((isCenter || !this.map.extent.contains(centerPoint)) && zoom && !isNaN(zoom)){
              deferred = this.map.centerAndZoom(centerPoint,Number(zoom));
            }else if(isCenter  || !this.map.extent.contains(centerPoint)){
              deferred = this.map.centerAt(centerPoint);
            }else if(isExtent){
              geometryExtent = this.getGeometryExtent(geometry);
              deferred = this.map.setExtent(geometryExtent);
            }
            located && located.call(null,centerPoint);
            return deferred;
          }else{
            this.logger('geometry should not be empty!');
            return false;
          }
        },
        locateGeometry: function (geometry,isCenter,zoom) {
          return this.locate({ geometry: geometry, isCenter: isCenter || true, zoom: zoom });
        },
        locateGeometryToExtent: function (geometry) {
          if(geometry && geometry.type === 'point'){
            this.logger('point without extent!');
            return false;
          }
          return this.locate({ geometry: geometry, isExtent: true});
        },
        locatePoint: function (x,y,isCenter,zoom) {
          return this.locate({ geometry: [x,y], isCenter: isCenter || true, zoom: zoom });
        },
        locatePolyline: function (geometry,isCenter,zoom) {
          if(geometry && geometry.type !== 'polyline'){
            this.logger('pass a polyline geometry!');
            return false;
          }
          return this.locate({ geometry: geometry, isCenter: isCenter || true, zoom: zoom });
        },
        locatePolygon: function (geometry, isCenter, zoom) {
          if(geometry && geometry.type !== 'polygon'){
            this.logger('pass a polygon geometry!');
            return false;
          }
          return this.locate({ geometry: geometry, isCenter: isCenter || true, zoom: zoom });
        },
        locateExtent: function (geometry, isCenter, zoom) {
          if(geometry && geometry.type !== 'extent'){
            this.logger('pass a extent geometry!');
            return false;
          }
          return this.locate({ geometry: geometry, isCenter: isCenter || true, zoom: zoom });
        },
        locateCircle: function (geometry, isCenter, zoom) {
          if(geometry && geometry.type !== 'circle'){
            this.logger('pass a circle geometry!');
            return false;
          }
          return this.locate({ geometry: geometry, isCenter: isCenter || true, zoom: zoom });
        },
       /* locate: function (geometry, isCenter, isEffect, zoom, style, fn, endStatic) {
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

        },*/

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
