/**
 * Created by sk_ on 2017/8/1.
 */
/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a Animation.
 * @module extras/utils/Animation
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
    return declare(Radical, /**  @lends module:extras/control/LocatorControl */{
      className: 'Animation',
      /**
       * @constructs
       *
       */
      constructor: function (map) {
        this.map = map;
        this.duration = 1000;
        this.rate = 50;
      },

      /**
       * @description startBoxEffect
       * @method
       * @memberOf module:extras/utils/Animation#
       * @param {string} center
       *
       * @example
       * <caption>Usage of startBoxEffect</caption>
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
