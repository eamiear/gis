/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a GoogleTiledMap.
 * @module extras/layer/GoogleTiledMap
 *
 * @requires dojo._base.declare
 * @requires esri.SpatialReference
 * @requires esri.layers.TiledMapServiceLayer
 * @requires esri.geometry.webMercatorUtils
 * @requires esri.geometry.Extent
 * @requires esri.layers.TileInfo
 */
define([
    "dojo/_base/declare",
    "esri/SpatialReference",
    "esri/layers/TiledMapServiceLayer",
    "esri/geometry/webMercatorUtils",
    "esri/geometry/Extent",
    "esri/layers/TileInfo"],
  function (declare,
            SpatialReference,
            TiledMapServiceLayer,
            webMercatorUtils,
            Extent,
            TileInfo) {
    return declare([TiledMapServiceLayer],
      /**  @lends module:extras/layer/GoogleTiledMap */
      {

        /** @member online */
        online: false,

        /** @member mapStyle */
        mapStyle: "roadmap",

        /**
         * @constructs
         * @param {string} a
         */
        constructor: function (a) {
          this.spatialReference = new SpatialReference({
            wkid: 102113
          });
          this.online = a.online || false;
          this.mapStyle = a.mapStyle || "roadmap";
          this.layerId = a.layerId;
          this.suffix = a.suffix || ".png";
          this.tile_url = a.tile_url;
          this.fullExtent = new Extent(-20037508.342787, -20037508.342787, 20037508.342787, 20037508.342787, this.spatialReference);
          this.initialExtent = new Extent(12557877.595482401, 2596928.9267310356, 12723134.450635016, 2688653.360673282);
          this.tileInfo = new TileInfo({
            "rows": 256,
            "cols": 256,
            "compressionQuality": 0,
            "origin": {
              "x": -20037508.342787,
              "y": 20037508.342787
            },
            "spatialReference": {
              "wkid": 102113
            },
            "lods": [{
              "level": 3,
              "scale": 73957190.948944,
              "resolution": 19567.8792409999
            },
              {
                "level": 4,
                "scale": 36978595.474472,
                "resolution": 9783.93962049996
              },
              {
                "level": 5,
                "scale": 18489297.737236,
                "resolution": 4891.96981024998
              },
              {
                "level": 6,
                "scale": 9244648.868618,
                "resolution": 2445.98490512499
              },
              {
                "level": 7,
                "scale": 4622324.434309,
                "resolution": 1222.99245256249
              },
              {
                "level": 8,
                "scale": 2311162.217155,
                "resolution": 611.49622628138
              },
              {
                "level": 9,
                "scale": 1155581.108577,
                "resolution": 305.748113140558
              },
              {
                "level": 10,
                "scale": 577790.554289,
                "resolution": 152.874056570411
              },
              {
                "level": 11,
                "scale": 288895.277144,
                "resolution": 76.4370282850732
              },
              {
                "level": 12,
                "scale": 144447.638572,
                "resolution": 38.2185141425366
              },
              {
                "level": 13,
                "scale": 72223.819286,
                "resolution": 19.1092570712683
              },
              {
                "level": 14,
                "scale": 36111.909643,
                "resolution": 9.55462853563415
              },
              {
                "level": 15,
                "scale": 18055.954822,
                "resolution": 4.77731426794937
              },
              {
                "level": 16,
                "scale": 9027.977411,
                "resolution": 2.38865713397468
              },
              {
                "level": 17,
                "scale": 4513.988705,
                "resolution": 1.19432856685505
              },
              {
                "level": 18,
                "scale": 2256.994353,
                "resolution": 0.597164283559817
              },
              {
                "level": 19,
                "scale": 1128.497176,
                "resolution": 0.298582141647617
              }]
          });
          this.loaded = true;
          this.onLoad(this)
        },

        /**
         * @description getTileUrl
         * @method
         * @memberOf module:extras/layer/GoogleTiledMap#
         * @param {string} a
         * @param {string} b
         * @param {string} c
         *
         * @example
         * <caption>Usage of getTileUrl</caption>
         * require(['extras/layer/GoogleTiledMap'],function(GoogleTiledMap){
     *   var instance = new GoogleTiledMap(a);
     *   instance.getTileUrl(a,b,c);
     * })
         *
         *
         * @returns {*}
         */
        getTileUrl: function (a, b, c) {
          var d = a - 1;
          var e = parseInt(Math.pow(2, d));
          var f = e - 1;
          var g = c - e,
            numY = ( -b) + f;
          var h = (c + b) % 8 + 1;
          var i;
          if (this.online) {
            if (this.mapStyle === "roadmap") {
              i = "http://mt" + (c % 4) + ".google.cn/vt/lyrs=m@226000000&hl=zh-CN&gl=cn&x=" + c + "&y=" + b + "&z=" + a + "&s=Gali"
            } else if (this.mapStyle === "Image") {
              i = "http://mt" + (c % 4) + ".google.cn/vt/lyrs=s@157&hl=zh-CN&gl=cn&x=" + c + "&y=" + b + "&z=" + a + "&s="
            } else if (this.mapStyle === "POI") {
              i = "http://mt" + (c % 4) + ".google.cn/vt/lyrs=s@157&hl=zh-CN&gl=cn&x=" + c + "&y=" + b + "&z=" + a + "&s="
            }
          } else {
            if (this.mapStyle === "roadmap") {
              i = this.tile_url + "/roadmap/" + a + "/" + c + "/" + b + "." + this.suffix
            } else if (this.mapStyle === "Image") {
              i = this.tile_url + "/satellite/" + a + "/" + c + "/" + b + "." + this.suffix
            } else if (this.mapStyle === "POI") {
              i = this.tile_url + "/overlay/" + a + "/" + c + "/" + b + "." + this.suffix
            }
          }
          return i
        }

      })
  });
