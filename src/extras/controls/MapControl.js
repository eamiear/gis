/**
 * Created by sk_ on 2017-6-10.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a MapControl.
 * @module extras/control/MapControl
 *
 * @requires dojo._base.declare
 * @requires dojo.fx
 */
define([
    "dojo/_base/declare",
    "dojo/fx"
  ],
  function (declare,fx) {
    return declare(null,
      /**  @lends module:extras/control/MapControl */
      {

        /**
         * @constructs
         * @param {object} gisObj
         */
        constructor: function (gisObj) {

          this.gisObj = gisObj;
          dojo.subscribe("toolBarLoadedEvent", this, "initLayerDraw");

          this.defaultSymbol = {
            "Point": {
              width: 18,
              height: 18,
              url: baseUrl + "/themes/default/img/info.gif"
            },
            "Line": {
              strokeWeight: 3,
              strokeOpacity: 1,
              strokeColor: "#e6111b",
              strokeDashstyle: "longdashdotdot"
            },
            "Polygon": {
              strokeWeight: 2,
              strokeOpacity: 1,
              strokeColor: "#2b07e5",
              fillColor: "#2b07e5",
              fillOpacity: 0.6,
              strokeDashstyle: "longdashdotdot"
            }
          };

        },

        /**
         * @description initLayerDraw
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} toolbar
         *
         * @example
         * <caption>Usage of initLayerDraw</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.initLayerDraw(toolbar);
     * })
         *
         *
         *
         */
        initLayerDraw: function (toolbar) {
          this.toolbar = toolbar;

          if (this.zoomin_1 == null || this.zoomin_2 == null || this.zoomin_3 == null || this.zoomin_4 == null) {
            this.zoomin_1 = this.createImg("zoomin_1.png");
            this.zoomin_2 = this.createImg("zoomin_2.png");
            this.zoomin_3 = this.createImg("zoomin_3.png");
            this.zoomin_4 = this.createImg("zoomin_4.png");
          }
          if (this.zoomout_1 == null || this.zoomout_2 == null || this.zoomout_3 == null || this.zoomout_4 == null) {
            this.zoomout_1 = this.createImg("zoomout_1.png");
            this.zoomout_2 = this.createImg("zoomout_2.png");
            this.zoomout_3 = this.createImg("zoomout_3.png");
            this.zoomout_4 = this.createImg("zoomout_4.png");
          }

          dojo.publish("applicationComplete", [true]);
        },

        /**
         * @description showZoomInFlash
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {number} xy
         *
         * @example
         * <caption>Usage of showZoomInFlash</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showZoomInFlash(xy);
     * })
         *
         *
         *
         */
        showZoomInFlash: function (xy) {
          var animations = [];
          animations.push(this.fxResize(this.zoomin_1, {
              left: xy.x - 30,
              top: xy.y - 30
            },
            {
              left: xy.x - 60,
              top: xy.y - 60
            }));
          animations.push(this.fxResize(this.zoomin_2, {
              left: xy.x + 30,
              top: xy.y - 30
            },
            {
              left: xy.x + 60,
              top: xy.y - 60
            }));
          animations.push(this.fxResize(this.zoomin_3, {
              left: xy.x + 30,
              top: xy.y + 30
            },
            {
              left: xy.x + 60,
              top: xy.y + 60
            }));
          animations.push(this.fxResize(this.zoomin_4, {
              left: xy.x - 30,
              top: xy.y + 30
            },
            {
              left: xy.x - 60,
              top: xy.y + 60
            }));
          fx.combine(animations).play();
        },

        /**
         * @description showZoomOutFlash
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {number} xy
         *
         * @example
         * <caption>Usage of showZoomOutFlash</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showZoomOutFlash(xy);
     * })
         *
         *
         *
         */
        showZoomOutFlash: function (xy) {
          var animations = [];
          animations.push(this.fxResize(this.zoomout_1, {
              left: xy.x - 60,
              top: xy.y - 60
            },
            {
              left: xy.x - 30,
              top: xy.y - 30
            }));
          animations.push(this.fxResize(this.zoomout_2, {
              left: xy.x + 60,
              top: xy.y - 60
            },
            {
              left: xy.x + 30,
              top: xy.y - 30
            }));
          animations.push(this.fxResize(this.zoomout_3, {
              left: xy.x + 60,
              top: xy.y + 60
            },
            {
              left: xy.x + 30,
              top: xy.y + 30
            }));
          animations.push(this.fxResize(this.zoomout_4, {
              left: xy.x - 60,
              top: xy.y + 60
            },
            {
              left: xy.x - 30,
              top: xy.y + 30
            }));
          fx.combine(animations).play();
        },

        /**
         * @description showZoomInBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showZoomInBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showZoomInBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showZoomInBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.zoomIn.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.zoomIn.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showZoomOutBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showZoomOutBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showZoomOutBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showZoomOutBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.zoomOut.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.zoomOut.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showPanBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showPanBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showPanBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showPanBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.pan.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.pan.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showPreviousBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showPreviousBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showPreviousBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showPreviousBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.previous.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.previous.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showNextBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showNextBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showNextBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showNextBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.next.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.next.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showFullExtentBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showFullExtentBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showFullExtentBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showFullExtentBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.fullExtent.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.fullExtent.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showMeasureLengthBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showMeasureLengthBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showMeasureLengthBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showMeasureLengthBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.measureLength.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.measureLength.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showMeasureAreaBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showMeasureAreaBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showMeasureAreaBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showMeasureAreaBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.measureArea.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.measureArea.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showPrintBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showPrintBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showPrintBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showPrintBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.print.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.print.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description showClearBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showClearBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showClearBtn(showOrHide);
     * })
         *
         *
         * @returns {*}
         */
        showClearBtn: function (showOrHide) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          if (showOrHide != this.gisObj.toolPanel.clear.isShow) {
            this.gisObj.toolPanel._isreload = true;
            this.gisObj.toolPanel.clear.isShow = showOrHide;
            this.gisObj.toolPanel.startup();
          }
        },

        /**
         * @description addToolPanelBtn
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {object} param
         *
         * @example
         * <caption>Usage of addToolPanelBtn</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.addToolPanelBtn(param);
     * })
         *
         *
         * @returns {*}
         */
        addToolPanelBtn: function (param) {
          if (!this.gisObj.toolPanel) {
            return;
          }
          this.gisObj.toolPanel._isreload = true;
          this.gisObj.toolPanel.toolbar_js.push(param);
          this.gisObj.toolPanel.startup();
        },

        /**
         * @description showZoomBar
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showZoomBar</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showZoomBar(showOrHide);
     * })
         *
         *
         *
         */
        showZoomBar: function (showOrHide) {
          showOrHide ? this.gisObj.addZoomBar() : this.gisObj.deleteZoomBar();
        },

        /**
         * @description showScalebar
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showScalebar</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showScalebar(showOrHide);
     * })
         *
         *
         *
         */
        showScalebar: function (showOrHide) {
          showOrHide ? this.gisObj.addScalebar() : this.gisObj.deleteScalebar();
        },

        /**
         * @description showOmap
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showOmap</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showOmap(showOrHide);
     * })
         *
         *
         *
         */
        showOmap: function (showOrHide) {
          showOrHide ? this.gisObj._omap.showOmap() : this.gisObj._omap.hideOmap();
        },

        /**
         * @description showToolPanel
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showToolPanel</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showToolPanel(showOrHide);
     * })
         *
         *
         *
         */
        showToolPanel: function (showOrHide) {
          showOrHide ? this.gisObj.toolPanel.showToolBarPanel() : this.gisObj.toolPanel.hideToolBarPanel();
        },

        /**
         * @description showBaseMap
         * @method
         * @memberOf module:extras/control/MapControl#
         *
         *
         * @example
         * <caption>Usage of showBaseMap</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showBaseMap();
     * })
         *
         *
         *
         */
        showBaseMap: function () {
          dojo.forEach(this.gisObj.imageLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(false)
              }
            }));

          dojo.forEach(this.gisObj.baseLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(true)
              }
            }));
        },

        /**
         * @description showImageMap
         * @method
         * @memberOf module:extras/control/MapControl#
         *
         *
         * @example
         * <caption>Usage of showImageMap</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showImageMap();
     * })
         *
         *
         *
         */
        showImageMap: function () {
          dojo.forEach(this.gisObj.baseLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(false)
              }
            }));

          dojo.forEach(this.gisObj.imageLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(true)
              }
            }));
        },

        /**
         * @description showCoordinate
         * @method
         * @memberOf module:extras/control/MapControl#
         *
         *
         * @example
         * <caption>Usage of showCoordinate</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showCoordinate();
     * })
         *
         *
         *
         */

        /**
         * @description showToolPanel
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} showOrHide
         *
         * @example
         * <caption>Usage of showToolPanel</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showToolPanel(showOrHide);
     * })
         *
         *
         *
         */
        showToolPanel: function (showOrHide) {
          showOrHide ? this.gisObj.toolPanel.showToolBarPanel() : this.gisObj.toolPanel.hideToolBarPanel();
        },

        showBaseMap: function () {
          dojo.forEach(this.gisObj.imageLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(false)
              }
            }));

          dojo.forEach(this.gisObj.baseLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(true)
              }
            }));
        },

        showImageMap: function () {
          dojo.forEach(this.gisObj.baseLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(false)
              }
            }));

          dojo.forEach(this.gisObj.imageLayer, dojo.hitch(this,
            function (layer, index) {
              if (layer) {
                layer.setVisibility(true)
              }
            }));
        },

        showCoordinate: function (showOrHide) {
          showOrHide ? this.gisObj.addCoordinate() : this.gisObj.deleteCoordinate();
        },

        showToolPanel: function (showOrHide) {
          showOrHide ? this.gisObj.toolPanel.showToolBarPanel() : this.gisObj.toolPanel.hideToolBarPanel();
        },

        /**
         * @description screenCapture
         * @method
         * @memberOf module:extras/control/MapControl#
         *
         *
         * @example
         * <caption>Usage of screenCapture</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.screenCapture();
     * })
         *
         *
         *
         */
        screenCapture: function () {

        },

        /**
         * @description showInfowindow
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {object} param
         *
         * @example
         * <caption>Usage of showInfowindow</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.showInfowindow(param);
     * })
         *
         *
         *
         */
        showInfowindow: function (param) {
          if (!this.gisObj.map.infoWindow) {
            var infoWindow = new InfoWindow({},
              domConstruct.create("div"));
            infoWindow.startup();
            this.gisObj.map.setInfoWindow(infoWindow);
          }
          var lonlat = new esri.geometry.Point(parseFloat(param.x), parseFloat(param.y));
          var geom = esri.geometry.webMercatorUtils.geographicToWebMercator(lonlat);
          if (geom) {
            this.gisObj.map.infoWindow.setTitle(param.title);
            this.gisObj.map.infoWindow.setContent(param.context);
            this.gisObj.map.infoWindow.resize(parseFloat(param.width), parseFloat(param.height));
            this.gisObj.map.infoWindow.show(this.gisObj.map.toScreen(lonlat), this.gisObj.map.getInfoWindowAnchor(this.gisObj.map.toScreen(lonlat)));
          }
        },

        /**
         * @description hideInfowindow
         * @method
         * @memberOf module:extras/control/MapControl#
         *
         *
         * @example
         * <caption>Usage of hideInfowindow</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.hideInfowindow();
     * })
         *
         *
         *
         */
        hideInfowindow: function () {
          this.gisObj.map.infoWindow.hide();
        },

        /**
         * @description addInfoTip
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {object} param
         *
         * @example
         * <caption>Usage of addInfoTip</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.addInfoTip(param);
     * })
         *
         *
         * @returns {*}
         */
        addInfoTip: function (param) {
          var infoTip = new AG.MicMap.gis.InfoTip(param.id, param.className || 'infoTip roundcorner bluegray', param.offset || {
              x: 0,
              y: 0
            },
            false, param.parentObject, param.alpha, "");
          infoTip.bindMap(this.gisObj.map);
          infoTip.setContent(param.context);
          infoTip.setLocation(param.location || 'right');

          infoTip.show(param.x, param.y);

          return infoTip;
        },

        /**
         * @description hideInfoTip
         * @method
         * @memberOf module:extras/control/MapControl#
         *
         *
         * @example
         * <caption>Usage of hideInfoTip</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
     *   instance.hideInfoTip();
     * })
         *
         *
         *
         */
        hideInfoTip: function () {
          alert("建设中...")
        },

        /**
         * @description fxResize
         * @method
         * @memberOf module:extras/control/MapControl#
         * @param {string} node
         * @param {string}  start
         * @param {string}  end
         *
         * @example
         * <caption>Usage of fxResize</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
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
         * @memberOf module:extras/control/MapControl#
         * @param {string} src
         *
         * @example
         * <caption>Usage of createImg</caption>
         * require(['extras/control/MapControl'],function(MapControl){
     *   var instance = new MapControl(gisObj);
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
          node.style.width = 7;
          node.style.height = 7;

          var mapDiv = dojo.byId(this.gisObj.map.id);
          mapDiv.appendChild(node);
          return node;
        }

      })
  });
