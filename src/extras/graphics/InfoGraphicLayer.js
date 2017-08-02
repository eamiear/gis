/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a InfoGraphicLayer.
 * @module extras/graphics/InfoGraphicLayer
 *
 * @requires dojo._base.declare
 * @requires esri.layers.GraphicsLayer
 *
 */
define([
    "dojo/_base/declare",
    "esri/layers/GraphicsLayer"
  ],
  function (
    declare,
    GraphicsLayer
  ) {
    return declare([GraphicsLayer], /**  @lends module:extras/graphics/InfoGraphicLayer */ {
        /**
         * @constructs
         *
         */
        constructor: function (options) {
          this._id = options.id || "";
          this._divId = options.divId;
          this._bindGraphicLayer = options.bindGraphicLayer || null;
          this.visible = true;
        },
        /**
         * @private
         * @description _setMap
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         * @param {string} map
         * @param {string}  surface
         *
         * @returns {*}
         */
        _setMap: function (map, surface) {
          var div = this.inherited(arguments);
          return div;
        },

        /**
         * @private
         * @description _unsetMap
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         */
        _unsetMap: function () {
          this.inherited(arguments);
        },

        /**
         * @description hide
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         *
         * @example
         * <caption>Usage of hide</caption>
         * require(['extras/graphics/InfoGraphicLayer'],function(InfoGraphicLayer){
         *   var instance = new InfoGraphicLayer();
         *   instance.hide();
         * })
         */
        hide: function () {
          this.visible = false;
          if (this.clickGraphic) {
            $("#div_" + this.clickGraphic.id).hide();
          }
          var _graphics = this.graphics;
          for (var i = 0, dl = _graphics.length; i < dl; i++) {
            _graphics[i].hide();
          }
        },

        /**
         * @description show
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         *
         * @example
         * <caption>Usage of show</caption>
         * require(['extras/graphics/InfoGraphicLayer'],function(InfoGraphicLayer){
         *   var instance = new InfoGraphicLayer();
         *   instance.show();
         * })
         */
        show: function () {
          this.visible = true;
          if (this.clickGraphic) {
            $("#div_" + this.clickGraphic.id).show();
          }
          var _graphics = this.graphics;
          for (var i = 0,
                 dl = _graphics.length; i < dl; i++) {
            _graphics[i].show();
          }
        },

        /**
         * @description remove
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         * @param {string} graphic
         *
         * @example
         * <caption>Usage of remove</caption>
         * require(['extras/graphics/InfoGraphicLayer'],function(InfoGraphicLayer){
         *   var instance = new InfoGraphicLayer();
         *   instance.remove(graphic);
         * })
         *
         * @returns {*}
         */
        remove: function (graphic) {
          if (!this._map) {
            return;
          }
          this.inherited(arguments);
        },

        /**
         * @private
         * @description _refresh
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         * @param {string} redrawFlag
         * @param {number}  zoomFlag
         *
         * @returns {*}
         */
        _refresh: function (redrawFlag, zoomFlag) {
          if (!this.visible) return;

          var gs = this.graphics,
            _draw = this._draw;
          for (i = 0; i < gs.length; i++) {
            _draw(gs[i], redrawFlag, zoomFlag);
          }
          this.show();
        },

        /**
         * @private
         * @description _onPanStartHandler
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         */
        _onPanStartHandler: function () {
          this.hide();
          this.inherited(arguments);
        },

        /**
         * @private
         * @description _onZoomStartHandler
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         *
         */
        _onZoomStartHandler: function () {
          this.inherited(arguments);
        },

        /**
         * @private
         * @description _onExtentChangeHandler
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         * @param {string} delta
         * @param {number}  extent
         * @param {number}  levelChange
         * @param {string}  lod
         *
         */
        _onExtentChangeHandler: function (delta, extent, levelChange, lod) {
          this._refresh(true, true);
          this.inherited(arguments);
        },

        /**
         * @private
         * @description _draw
         * @method
         * @memberOf module:extras/graphics/InfoGraphicLayer#
         * @param {string} graphic
         * @param {string}  redrawFlag
         * @param {number}  zoomFlag
         *
         * @returns {*}
         */
        _draw: function (graphic, redrawFlag, zoomFlag) {
          var dx, dy, screenPos, geometry, graphicShade;
          if (!this._map) return;
          this.inherited(arguments);
          if (this.clickGraphic && this.clickGraphic._shape && this.clickGraphic.id == graphic.id) {
            geometry = graphic.geometry;
            screenPos = this._map.toScreen(geometry);
            graphicShade = graphic._shape.shape;

            dx = screenPos.x - $('.ui-popup').width() / 2;
            dy = screenPos.y - $('.ui-popup').height() - graphicShade.width * 3 / 4;
            $('.ui-popup').css({
              'left': dx,
              'top': dy
            }).addClass('ui-popup-top');
          }
        }
      })
  });
