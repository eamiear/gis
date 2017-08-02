/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a LayerLocate.
 * @module extras/controls/LayerLocate
 *
 * @requires dojo._base.declare
 * @requires dojo._base.lang
 * @requires esri.graphic
 * @requires esri.SpatialReference
 * @requires esri.geometry.webMercatorUtils
 * @requires esri.geometry.Geometry
 * @requires esri.geometry.Point
 * @requires extras.basic.Radical
 */
define([
    "dojo/_base/declare",
    "dojo/_base/lang",
    "esri/graphic",
    "esri/SpatialReference",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Geometry",
    "esri/geometry/Point",
    "extras/basic/Radical"],
  function (
    declare,
    lang,
    Graphic,
    SpatialReference,
    WebMercatorUtils,
    Geometry,
    Point,
    Radical
  ) {
    return declare(Radical, /**  @lends module:extras/controls/LocatorControl */{
      className: 'LocatorControl',
      /**
       * @constructs
       */
      constructor: function (map) {
        this.map = map;
        this.setIntervalhandler = null;
        this.locateLayer = this.createLayer({layerId: this.defaultLayerIds.locateLayerId});
      },

      /**
       * @description locate
       * @method
       * @memberOf module:extras/controls/LayerLocate#
       * @param {object} options
       * @param {array|object} options.geometry
       * @param {boolean}   [options.isCenter]          push graphic to center of the map
       * @param {boolean}   [options.isExtent]          set map's extent with graphic's extent
       * @param {number}    [options.zoom]              zoom in map to the specified number
       * @param {function}  [options.beforeLocate]      callback before be located
       * @param {function}  [options.located]
       *
       * @example
       * <caption>Usage of locate</caption>
       * require(['extras/controls/LayerLocate'],function(LayerLocate){
       *   new LayerLocate().locate({
       *      geometry: [113.12,23.33],
       *      isCenter: true
       *   });
       * })
       *
       * @example
       * <caption>Usage of locate</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locate({
       *      geometry: [113.12,23.33],
       *      isCenter: true,
       *      beforeLocate: function(){
       *        console.log('graphic is locating...')
       *      }
       *   });
       * })
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

        if (geometry) {
          if (geometry instanceof Geometry) {
            centerPoint = this.getGeometryCenter(geometry);
          } else if (geometry instanceof Array && geometry.length) {
            centerPoint = new Point(geometry[0], geometry[1], this.map.spatialReference);
          } else if (geometry instanceof Object && geometry.x && geometry.y) {
            centerPoint = new Point(geometry.x, geometry.y, this.map.spatialReference);
          }

          if (!centerPoint.spatialReference.isWebMercator() || this.isGeometry(centerPoint)) {
            centerPoint = WebMercatorUtils.geographicToWebMercator(centerPoint);
          }
          beforeLocate && beforeLocate();
          if ((isCenter || !this.map.extent.contains(centerPoint)) && zoom && !isNaN(zoom)) {
            deferred = this.map.centerAndZoom(centerPoint, Number(zoom));
          } else if (isCenter || !this.map.extent.contains(centerPoint)) {
            deferred = this.map.centerAt(centerPoint);
          } else if (isExtent) {
            geometryExtent = this.getGeometryExtent(geometry);
            deferred = this.map.setExtent(geometryExtent);
          }
          located && located.call(null, centerPoint);
          return deferred;
        } else {
          this.logger('geometry should not be empty!');
          return false;
        }
      },
      /**
       * locate graphic by the geometry
       * @memberOf module:extras/controls/LocatorControl#
       * @param {Geometry} geometry    geometry of graphic
       * @param {boolean} isCenter     locate graphic and place it in the middle
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locateGeometry({
       *      geometry: [113.12,23.33],
       *      isCenter: true,
       *      beforeLocate: function(){
       *        console.log('graphic is locating...')
       *      }
       *   });
       * })
       *
       * @returns {*}
       */
      locateGeometry: function (geometry, isCenter, zoom) {
        return this.locate({geometry: geometry, isCenter: isCenter || true, zoom: zoom});
      },
      /**
       * locate graphic by the extent
       * @memberOf module:extras/controls/LocatorControl#
       * @param {Geometry} geometry    geometry of graphic
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locateGeometryToExtent(geometry);
       * })
       *
       * @returns {*}
       */
      locateGeometryToExtent: function (geometry) {
        if (geometry && geometry.type === 'point') {
          this.logger('point without extent!');
          return false;
        }
        return this.locate({geometry: geometry, isExtent: true});
      },
      /**
       * locate a point
       * @memberOf module:extras/controls/LocatorControl#
       * @param {number} x            longitude of the graphic
       * @param {number} y            latitude of the graphic
       * @param {boolean} isCenter
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locatePoint(113.12,23.33,true,10);
       * })
       *
       * @returns {*}
       */
      locatePoint: function (x, y, isCenter, zoom) {
        return this.locate({geometry: [x, y], isCenter: isCenter || true, zoom: zoom});
      },
      /**
       * locate polyline graphic
       * @memberOf module:extras/controls/LocatorControl#
       * @param {number} geometry            geometry of the graphic
       * @param {boolean} isCenter
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locatePolyline(geometry,true);
       * })
       *
       * @returns {*}
       */
      locatePolyline: function (geometry, isCenter, zoom) {
        if (geometry && geometry.type !== 'polyline') {
          this.logger('pass a polyline geometry!');
          return false;
        }
        return this.locate({geometry: geometry, isCenter: isCenter || true, zoom: zoom});
      },
      /**
       * locate polygon graphic
       * @memberOf module:extras/controls/LocatorControl#
       * @param {number} geometry            geometry of the graphic
       * @param {boolean} isCenter
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locatePolygon(geometry,true);
       * })
       *
       * @returns {*}
       */
      locatePolygon: function (geometry, isCenter, zoom) {
        if (geometry && geometry.type !== 'polygon') {
          this.logger('pass a polygon geometry!');
          return false;
        }
        return this.locate({geometry: geometry, isCenter: isCenter || true, zoom: zoom});
      },
      /**
       * locate Extent
       * @memberOf module:extras/controls/LocatorControl#
       * @param {number} geometry            geometry of the graphic
       * @param {boolean} isCenter
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locateExtent(geometry,true);
       * })
       *
       * @returns {*}
       */
      locateExtent: function (geometry, isCenter, zoom) {
        if (geometry && geometry.type !== 'extent') {
          this.logger('pass a extent geometry!');
          return false;
        }
        return this.locate({geometry: geometry, isCenter: isCenter || true, zoom: zoom});
      },
      /**
       * locate Circle
       * @memberOf module:extras/controls/LocatorControl#
       * @param {number} geometry            geometry of the graphic
       * @param {boolean} isCenter
       * @param {number} zoom
       *
       * @example
       * <caption>Usage of locateGeometry</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   new LocatorControl(map).locateCircle(geometry,true);
       * })
       *
       * @returns {*}
       */
      locateCircle: function (geometry, isCenter, zoom) {
        if (geometry && geometry.type !== 'circle') {
          this.logger('pass a circle geometry!');
          return false;
        }
        return this.locate({geometry: geometry, isCenter: isCenter || true, zoom: zoom});
      },

      /**
       * @description highlight the graphic on map
       * @method
       * @memberOf module:extras/controls/LocatorControl#
       * @param {number} geometry
       * @param {object|Symbol} symbol
       * @param {boolean} [isNonpersistent]       when set to true ,it will continuous highlight on the graphic
       * @param {number} [persistentTime]         continuous times of the highlighted graphic
       * @param {number} [threshold]              duration of the highlighted effect
       *
       * @example
       * <caption>Usage of highlightOnMap</caption>
       * require(['extras/control/LocatorControl'],function(LocatorControl){
       *   var instance = new LocatorControl();
       *   instance.highlightOnMap(geometry, symbol, false);
       * })
       */
      highlightOnMap: function (geometry, symbol, isNonpersistent, persistentTime, threshold) {
        var graphic,
          graphicSymbol,
          stateInterval = true,
          persistentIndex = 0;

        graphicSymbol = this.getSymbolByGraphicType(geometry.type, this.dealWithDefaultSymbol(symbol || this.highlight.symbol[geometry.type]));
        graphic = new Graphic(geometry, graphicSymbol);
        graphic.setGeometry(geometry);

        this.unHighlightOnMap();
        this.clearLayer(this.locateLayer);
        graphic.id = this.highlight.defaultId;
        this.locateLayer.add(graphic);
        this.hightGraphic = graphic;

        this.setIntervalhandler = window.setInterval(dojo.hitch(this, function () {
          persistentIndex++;
          if (!this.hightGraphic) {
            window.clearInterval(this.setIntervalhandler);
          } else {
            stateInterval ? this.hightGraphic.hide() : this.hightGraphic.show();
          }
          stateInterval = !stateInterval;
          if (isNonpersistent && persistentIndex >= (persistentTime || this.highlight.defaultTimes)) {
            this.unHighlightOnMap();
          }
        }), threshold || this.highlight.threshold);
      },
      /**
       * @description unHighlight the graphic
       * @method
       * @memberOf module:extras/controls/LocatorControl#
       *
       * @example
       * <caption>Usage of unHighlightOnMap</caption>
       * require(['extras/controls/LocatorControl'],function(LocatorControl){
       *   var instance = new LayerLocate();
       *   instance.unHighlightOnMap();
       * })
       */
      unHighlightOnMap: function () {
        if (this.setIntervalhandler) {
          window.clearInterval(this.setIntervalhandler);
        }
        this.locateLayer.clear();
      }
    })
  });
