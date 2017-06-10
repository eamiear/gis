/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a TianDiTuTiledMap.
* @module extras/layer/TianDiTuTiledMap
*
* 
* @requires esri.layers.TiledMapServiceLayer 
*/
define(["esri/layers/TiledMapServiceLayer"],
function(
TiledMapServiceLayer) {
  return declare([esri.layers.TiledMapServiceLayer],
  /**  @lends module:extras/layer/TianDiTuTiledMap */
  {

    /**
     * @constructs
     * @param {string} a
     * @param {string} b
     */
    constructor: function(a, b) {

},

  })
});