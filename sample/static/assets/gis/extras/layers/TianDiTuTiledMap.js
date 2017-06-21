/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a TianDiTuTiledMap.
 * @module extras/layer/TianDiTuTiledMap
 *
 *@requires dojo._base.declare
 * @requires esri.layers.TiledMapServiceLayer
 */
define([
    "dojo/_base/declare",
    "esri/layers/TiledMapServiceLayer"
  ],
  function (declare,
            TiledMapServiceLayer) {
    return declare([TiledMapServiceLayer],
      /**  @lends module:extras/layer/TianDiTuTiledMap */
      {

        /**
         * @constructs
         * @param {string} a
         * @param {string} b
         */
        constructor: function (a, b) {

        }

      })
  });
