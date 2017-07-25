/**
 * Created by K on 2017/7/17.
 */

define([
  "dojo/_base/declare",
  "esri/layers/GraphicsLayer",
  "extras/basic/Radical",
  "extras/graphics/InfoGraphicLayer"
], function (
  declare,
  GraphicsLayer,
  Radical,
  InfoGraphicLayer
) {
  return declare(Radical, {
    className: 'LayerContol',
    /**
     * @constructs
     *
     */
    constructor: function (map) {
      this.map = map;
    },
    _addGraphicToLayer: function (layer,graphicObj,graphicType) {

    }



  })
});
