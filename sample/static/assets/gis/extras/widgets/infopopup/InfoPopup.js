/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a InfoPopup.
* @module extras/InfoPopup
*
* 
* @requires dijit._Widget 
* @requires dijit._Templated 
*/
define(["dijit/_Widget", "dijit/_Templated"],
function(
Widget, Templated) {
  return declare([dijit._Widget, dijit._Templated],
  /**  @lends module:extras/InfoPopup */
  {

    /** @member 
	map */
    map: null,

    /** @member 
	visible */
    visible: false,

    /** @member 
	coords */
    coords: null,

    /** @member 
	screenCoords */
    screenCoords: null,

    /** @member 
	link */
    link: "",

    /** @member 
	alignment */
    alignment: "",

    /**
     * @constructs
     * @param {object} params
     */
    constructor: function(params) {

      this.templatePath = selfUrl + "/templates/InfoPopup.html";
      this.connects = [];

    },

    /**
     * @description postCreate
     * @method
     * @memberOf module:extras/InfoPopup#
     * 
     * 
     * @example
     * <caption>Usage of postCreate</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.postCreate();
     * })
     * 
     *
     * 
     */
    postCreate: function() {
      if (this.map) {
        this.connects.push(dojo.connect(this.map, "onExtentChange", this, "extentChangeHandler"));
        this.connects.push(dojo.connect(this.map, "onPan", this, "panHandler"));
      }
      dojo.setSelectable(this.domNode, false);

      var boxContainerMargin = dojo.marginBox(this.containerNode);
      var boxPopupContent = dojo.contentBox(this.domNode);
      boxContainerMargin.w = boxPopupContent.w;
      dojo.marginBox(this.containerNode, boxContainerMargin);
      dojo.style(this.containerNode, "height", "");
    },

    /**
     * @description uninitialize
     * @method
     * @memberOf module:extras/InfoPopup#
     * 
     * 
     * @example
     * <caption>Usage of uninitialize</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.uninitialize();
     * })
     * 
     *
     * 
     */
    uninitialize: function() {
      dojo.forEach(this.connects,
      function(x) {
        dojo.disconnect(x);
      })
    },

    /**
     * @description setInfo
     * @method
     * @memberOf module:extras/InfoPopup#
     * @param {object}  params
     * 
     * @example
     * <caption>Usage of setInfo</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.setInfo( params);
     * })
     * 
     *
     * 
     */
    setInfo: function(params) {
      if (params) {
        if (params.title) {
          this.titleNode.innerHTML = params.title;
        }
        if (params.content) {
          this.contentNode.innerHTML = params.content;
          if (dojo.isIE) {
            dojo.query("img", this.contentNode).forEach(function(img) {
              img.parentNode.removeChild(img);
            });
          }
        }
        this.link = params.link;
        if (params.link) {
          dojo.style(this.linkNode, "display", "block");
          dojo.attr(this.linkNode, "title", this.link);
        }
        else {
          dojo.style(this.linkNode, "display", "none");
        }

        if (dojo.isIE) {
          dojo.style(this.closeButton, {
            left: "",
            right: "2px"
          });

          var contentBox = dojo.contentBox(this.containerNode);
          if (contentBox.h < 40) {
            dojo.style(this.containerNode, "height", "40px");
          }
          else {
            dojo.style(this.containerNode, "height", "");
          }
        }

        var b = dojo.coords(this.containerNode);
        var mTop = (b.h / 2) + "px";
        dojo.style(this.domNode, "marginTop", "-" + mTop);
        dojo.style(this.leaderNode, "marginTop", mTop);
      }
    },

    /**
     * @description setCoords
     * @method
     * @memberOf module:extras/InfoPopup#
     * @param {string}  mapPoint
     * 
     * @example
     * <caption>Usage of setCoords</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
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
     * @memberOf module:extras/InfoPopup#
     * @param {number} extent
     * @param {string}  delta
     * @param {number}  levelChange
     * @param {string}  lod
     * 
     * @example
     * <caption>Usage of extentChangeHandler</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
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
     * @memberOf module:extras/InfoPopup#
     * @param {number} extent
     * @param {string}  delta
     * 
     * @example
     * <caption>Usage of panHandler</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
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
     * @memberOf module:extras/InfoPopup#
     * @param {string}  loc
     * 
     * @example
     * <caption>Usage of _locate</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance._locate( loc);
     * })
     * 
     *
     * 
     */
    _locate: function(loc) {
      try {
        if (loc) {

          var isLeft = (loc.x < this.map.width / 2);

          var isNeutral = Math.abs(loc.x - this.map.width / 2) < 5;

          if (isNeutral) {
            if (this.alignment === "") {
              this.alignment = isLeft ? "left": "right";
            }
          }
          else {
            this.alignment = isLeft ? "left": "right";
          }

          if (this.alignment === "left") {

            dojo.style(this.domNode, {
              top: loc.y + "px",
              left: loc.x + "px",
              right: ""
            });

            dojo.style(this.leaderNode, {
              left: "1px",
              right: ""
            });

            if (!dojo.isIE) {
              dojo.style(this.closeButton, {
                left: "",
                right: "-22px"
              });

            }
          }
          else {

            var x = this.map.width - loc.x;
            dojo.style(this.domNode, {
              top: loc.y + "px",
              right: x + "px",
              left: ""
            });

            dojo.style(this.leaderNode, {
              left: "",
              right: "1px"
            });

            if (!dojo.isIE) {
              dojo.style(this.closeButton, {
                left: "-24px",
                right: ""
              });

            }
          }
        }
      }
      catch(err) {
        console.error("Error locating infopopup:", err);
      }
    },

    /**
     * @description show
     * @method
     * @memberOf module:extras/InfoPopup#
     * 
     * 
     * @example
     * <caption>Usage of show</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.show();
     * })
     * 
     *
     * 
     */
    show: function() {
      dojo.fadeIn({
        node: this.domNode
      }).play();
      this.visible = true;
    },

    /**
     * @description hide
     * @method
     * @memberOf module:extras/InfoPopup#
     * 
     * 
     * @example
     * <caption>Usage of hide</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.hide();
     * })
     * 
     *
     * 
     */
    hide: function() {
      dojo.fadeOut({
        node: this.domNode
      }).play();
      this.visible = false;
    },

    /**
     * @description onFollowLink
     * @method
     * @memberOf module:extras/InfoPopup#
     * @param {string} evt
     * 
     * @example
     * <caption>Usage of onFollowLink</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.onFollowLink(evt);
     * })
     * 
     *
     * 
     */
    onFollowLink: function(evt) {
      window.open(this.link);
    },

    /**
     * @description onClose
     * @method
     * @memberOf module:extras/InfoPopup#
     * @param {string} evt
     * 
     * @example
     * <caption>Usage of onClose</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.onClose(evt);
     * })
     * 
     *
     * 
     */
    onClose: function(evt) {

},

    /**
     * @description onPin
     * @method
     * @memberOf module:extras/InfoPopup#
     * @param {string} evt
     * 
     * @example
     * <caption>Usage of onPin</caption>
     * require(['extras/InfoPopup'],function(InfoPopup){
     *   var instance = new InfoPopup(params);
     *   instance.onPin(evt);
     * })
     * 
     *
     * 
     */
    onPin: function(evt) {

      dojo.fadeOut({
        node: this.pinButton
      }).play();
    }

  })
});