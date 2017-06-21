/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a BaiduTiledMap.
 * @module extras/layer/BaiduTiledMap
 *
 * @requires dojo._base.declare
 * @requires esri.SpatialReference
 * @requires esri.layers.TiledMapServiceLayer
 * @requires esri.geometry.webMercatorUtils
 * @requires esri.layers.TileInfo
 */
define([
    "dojo/_base/declare",
    "esri/SpatialReference",
    "esri/layers/TiledMapServiceLayer",
    "esri/geometry/webMercatorUtils",
    "esri/layers/TileInfo"],
  function (declare,
            SpatialReference,
            TiledMapServiceLayer,
            webMercatorUtils,
            TileInfo) {
    return declare([TiledMapServiceLayer],
      /**  @lends module:extras/layer/BaiduTiledMap */
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
          this.initialExtent = (this.fullExtent = new esri.geometry.Extent(-2.0037508342787E7, -2.003750834278E7, 2.003750834278E7, 2.0037508342787E7, this.spatialReference));
          this.scale = [591657527.591555, 295828763.795777, 147914381.897889, 73957190.948944, 36978595.474472, 18489297.737236, 9244648.868618, 4622324.434309, 2311162.217155, 1155581.108577, 577790.554289, 288895.277144, 144447.638572, 72223.819286, 36111.9096437, 18055.9548224, 9027.977411, 4513.988705, 2256.994353, 1128.497176];
          this.resolution = [156543.033928, 78271.5169639999, 39135.7584820001, 19567.8792409999, 9783.93962049996, 4891.96981024998, 2445.98490512499, 1222.99245256249, 611.49622628138, 305.748113140558, 152.874056570411, 76.4370282850732, 38.2185141425366, 19.1092570712683, 9.55462853563415, 4.77731426794937, 2.38865713397468, 1.19432856685505, 0.597164283559817, 0.298582141647617];
          this.tileInfo = new TileInfo({
            "rows": 256,
            "cols": 256,
            "compressionQuality": 90,
            "origin": {
              "x": -2.0037508342787E7,
              "y": 2.0037508342787E7
            },
            "spatialReference": this.spatialReference,
            "lods": [{
              "level": 0,
              "resolution": this.resolution[0],
              "scale": this.scale[0]
            },
              {
                "level": 1,
                "resolution": this.resolution[1],
                "scale": this.scale[1]
              },
              {
                "level": 2,
                "resolution": this.resolution[2],
                "scale": this.scale[2]
              },
              {
                "level": 3,
                "resolution": this.resolution[3],
                "scale": this.scale[3]
              },
              {
                "level": 4,
                "resolution": this.resolution[4],
                "scale": this.scale[4]
              },
              {
                "level": 5,
                "resolution": this.resolution[5],
                "scale": this.scale[5]
              },
              {
                "level": 6,
                "resolution": this.resolution[6],
                "scale": this.scale[6]
              },
              {
                "level": 7,
                "resolution": this.resolution[7],
                "scale": this.scale[7]
              },
              {
                "level": 8,
                "resolution": this.resolution[8],
                "scale": this.scale[8]
              },
              {
                "level": 9,
                "resolution": this.resolution[9],
                "scale": this.scale[9]
              },
              {
                "level": 10,
                "resolution": this.resolution[10],
                "scale": this.scale[10]
              },
              {
                "level": 11,
                "resolution": this.resolution[11],
                "scale": this.scale[11]
              },
              {
                "level": 12,
                "resolution": this.resolution[12],
                "scale": this.scale[12]
              },
              {
                "level": 13,
                "resolution": this.resolution[13],
                "scale": this.scale[13]
              },
              {
                "level": 14,
                "resolution": this.resolution[14],
                "scale": this.scale[14]
              },
              {
                "level": 15,
                "resolution": this.resolution[15],
                "scale": this.scale[15]
              },
              {
                "level": 16,
                "resolution": this.resolution[16],
                "scale": this.scale[16]
              },
              {
                "level": 17,
                "resolution": this.resolution[17],
                "scale": this.scale[17]
              },
              {
                "level": 18,
                "resolution": this.resolution[18],
                "scale": this.scale[18]
              },
              {
                "level": 19,
                "resolution": this.resolution[19],
                "scale": this.scale[19]
              }]
          });
          this.loaded = true;
          this.onLoad(this)
        },

        /**
         * @description getTileUrl
         * @method
         * @memberOf module:extras/layer/BaiduTiledMap#
         * @param {string} a
         * @param {string} b
         * @param {string} c
         *
         * @example
         * <caption>Usage of getTileUrl</caption>
         * require(['extras/layer/BaiduTiledMap'],function(BaiduTiledMap){
     *   var instance = new BaiduTiledMap(a);
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
              i = "http://online" + h + ".map.bdimg.com/tile/?qt=tile&x=" + g + "&y=" + numY + "&z=" + a + "&styles=pl&udt=20150928&scaler=1"
            } else if (this.mapStyle === "Image") {
              i = "http://shangetu" + h + ".map.bdimg.com/it/u=x=" + g + ";y=" + numY + ";z=" + a + ";v=009;type=sate&fm=46&udt=20150601"
            } else if (this.mapStyle === "POI") {
              i = "http://online" + h + ".map.bdimg.com/tile/?qt=tile&x=" + g + "&y=" + numY + "&z=" + a + "&styles=sl&v=083&udt=20150815"
            }
          } else {
            if (this.mapStyle === "roadmap") {
              i = this.tile_url + "/" + a + "/" + g + "/" + numY + this.suffix
            } else if (this.mapStyle === "Image") {
              i = this.tile_url + "/" + a + "/" + g + "/" + numY + this.suffix
            } else if (this.mapStyle === "POI") {
              i = this.tile_url + "/" + a + "/" + g + "/" + numY + this.suffix
            }
          }
          return i
        }

      })
  });
