/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a Highlight.
* @module extras/Highlight
*
* 
* @requires dijit._Widget 
* @requires dijit._Templated 
*/
define(["dijit/_Widget", "dijit/_Templated"],
function(
Widget, Templated) {
  return declare([dijit._Widget, dijit._Templated],
  /**  @lends module:extras/Highlight */
  {

    /** @member 
	map */
    map: null,

    /** @member 
	mode */
    mode: "off",

    /** @member 
	coords */
    coords: null,

    /** @member 
	screenCoords */
    screenCoords: null,

    /** @member 
	_frameIndex */
    _frameIndex: 0,

    /** @member 
	_framesAdvancing */
    _framesAdvancing: true,

    /** @member 
	_interval */
    _interval: null,

    /** @member 
	templateString */
    templateString: "<div class='highlight'></div>",

    /**
     * @constructs
     * @param {object} params
     */
    constructor: function(params) {

      var folderUrl = selfUrl + "/themes/default/images/highlight/";
      this.animationFrameUrls = ["url(" + folderUrl + "glow000.png)", "url(" + folderUrl + "glow010.png)", "url(" + folderUrl + "glow020.png)", "url(" + folderUrl + "glow030.png)", "url(" + folderUrl + "glow040.png)", "url(" + folderUrl + "glow050.png)", "url(" + folderUrl + "glow060.png)", "url(" + folderUrl + "glow070.png)", "url(" + folderUrl + "glow080.png)", "url(" + folderUrl + "glow090.png)", "url(" + folderUrl + "glow100.png)"];

      this.ringImageUrl = "url(" + folderUrl + "ring.png)";

    },

    /**
     * @description postCreate
     * @method
     * @memberOf module:extras/Highlight#
     * 
     * 
     * @example
     * <caption>Usage of postCreate</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.postCreate();
     * })
     * 
     *
     * 
     */
    postCreate: function() {
      if (this.map) {
        dojo.connect(this.map, "onExtentChange", this, "extentChangeHandler");
        dojo.connect(this.map, "onPan", this, "panHandler");
      }

      if (!dojo.isIE) {
        dojo.style(this.domNode, "visibility", "hidden");
        this.setMode("flashing");
        setTimeout(dojo.hitch(this,
        function() {
          this.setMode("off");
          dojo.style(this.domNode, "visibility", "visible");
        }), 1000);
      }
    },

    /**
     * @description setCoords
     * @method
     * @memberOf module:extras/Highlight#
     * @param {string}  mapPoint
     * 
     * @example
     * <caption>Usage of setCoords</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.setCoords( mapPoint);
     * })
     * 
     *
     * 
     */
    setCoords: function(mapPoint) {
      if (mapPoint) {
        this.coords = mapPoint;
        this.screenCoords = this.map.toScreen(mapPoint);
        this._locate(this.screenCoords);
      }
    },

    /**
     * @description extentChangeHandler
     * @method
     * @memberOf module:extras/Highlight#
     * @param {number} extent
     * @param {string}  delta
     * @param {number}  levelChange
     * @param {string}  lod
     * 
     * @example
     * <caption>Usage of extentChangeHandler</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.extentChangeHandler(extent, delta, levelChange, lod);
     * })
     * 
     *
     * 
     */
    extentChangeHandler: function(extent, delta, levelChange, lod) {
      if (this.coords) {
        this.screenCoords = this.map.toScreen(this.coords);
      }
      this._locate(this.screenCoords);
    },

    /**
     * @description panHandler
     * @method
     * @memberOf module:extras/Highlight#
     * @param {number} extent
     * @param {string}  delta
     * 
     * @example
     * <caption>Usage of panHandler</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.panHandler(extent, delta);
     * })
     * 
     *
     * 
     */
    panHandler: function(extent, delta) {
      if (this.screenCoords) {
        var sp = new esri.geometry.Point();
        sp.x = this.screenCoords.x + delta.x;
        sp.y = this.screenCoords.y + delta.y;
      }
      this._locate(sp);
    },

    /**
     * @description _locate
     * @method
     * @memberOf module:extras/Highlight#
     * @param {string}  loc
     * 
     * @example
     * <caption>Usage of _locate</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance._locate( loc);
     * })
     * 
     *
     * 
     */
    _locate: function(loc) {
      if (loc) {
        dojo.style(this.domNode, {
          top: loc.y + "px",
          left: loc.x + "px"
        });
      }
    },

    /**
     * @description setMode
     * @method
     * @memberOf module:extras/Highlight#
     * @param {number}  mode
     * 
     * @example
     * <caption>Usage of setMode</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.setMode( mode);
     * })
     * 
     *
     * 
     */
    setMode: function(mode) {
      mode = mode.toLowerCase();
      if (mode && mode !== this.mode) {
        if (this.interval) {
          clearInterval(this.interval);
          this.interval = null;
        }

        if (mode === "flashing") {

          this._frameIndex = 0;
          this.interval = setInterval(dojo.hitch(this, "advanceFrame"), 100);
          this.updateAnimation();

          this.mode = mode;
        }
        else {
          dojo.style(this.domNode, "backgroundImage", "");
          this.mode = "off"
        }
      }
    },

    /**
     * @description advanceFrame
     * @method
     * @memberOf module:extras/Highlight#
     * 
     * 
     * @example
     * <caption>Usage of advanceFrame</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.advanceFrame();
     * })
     * 
     *
     * 
     */
    advanceFrame: function() {
      try {
        if (this._framesAdvancing) {
          if (this._frameIndex < this.animationFrameUrls.length - 1) {
            this._frameIndex++;
          }
          else {
            this._framesAdvancing = false;
          }
        }
        else {
          if (this._frameIndex > 0) {
            this._frameIndex--;
          }
          else {
            this._framesAdvancing = true;
          }
        }
        this.updateAnimation();
      }
      catch(err) {
        console.error("Error advancing highlight animation", err);
      }
    },

    /**
     * @description updateAnimation
     * @method
     * @memberOf module:extras/Highlight#
     * 
     * 
     * @example
     * <caption>Usage of updateAnimation</caption>
     * require(['extras/Highlight'],function(Highlight){
     *   var instance = new Highlight(params);
     *   instance.updateAnimation();
     * })
     * 
     *
     * 
     */
    updateAnimation: function() {
      dojo.style(this.domNode, "backgroundImage", this.animationFrameUrls[this._frameIndex]);
    }

  })
});