/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a FlareClusterLayer.
* @module extras/layer/FlareClusterLayer
*
*
* @requires dojo._base.declare
* @requires dojo._base.lang
* @requires dojo/_base/array
* @requires dojo.on
* @requires dojo.fx
* @requires dojox.gfx
* @requires dojox.gfx.fx
* @requires dojox.gesture.tap
* @requires esri.SpatialReference
* @requires esri.geometry.Extent
* @requires esri.geometry.Multipoint
* @requires esri.geometry.Point
* @requires esri.geometry.ScreenPoint
* @requires esri.geometry.webMercatorUtils
* @requires esri.geometry.geometryEngine
* @requires esri.graphic
* @requires esri.Color
* @requires esri.renderers.ClassBreaksRenderer
* @requires esri.symbols.Font
* @requires esri.symbols.SimpleMarkerSymbol
* @requires esri.symbols.SimpleFillSymbol
* @requires esri.symbols.SimpleLineSymbol
* @requires esri.symbols.TextSymbol
* @requires esri.dijit.PopupTemplate
* @requires esri.layers.GraphicsLayer
*/
define(["dojo/_base/declare", "dojo/_base/lang", "dojo/_base/array", "dojo/on", "dojo/fx", "dojox/gfx", "dojox/gfx/dfx", "dojox/gesture/tap", "esri/SpatialReference", "esri/geometry/Extent", "esri/geometry/Multipoint", "esri/geometry/Point", "esri/geometry/ScreenPoint", "esri/geometry/webMercatorUtils", "esri/geometry/geometryEngine", "esri/graphic", "esri/Color", "esri/renderers/ClassBreaksRenderer", "esri/symbols/Font", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/TextSymbol", "esri/dijit/PopupTemplate", "esri/layers/GraphicsLayer"],
function(
declare, lang, array, on, fx, gfx, dfx, tap, SpatialReference, Extent, Multipoint, Point, ScreenPoint, webMercatorUtils, geometryEngine, graphic, Color, ClassBreaksRenderer, Font, SimpleMarkerSymbol, SimpleFillSymbol, SimpleLineSymbol, TextSymbol, PopupTemplate, GraphicsLayer) {
  return declare([esri.layers.GraphicsLayer],
  /**  @lends module:extras/layer/FlareClusterLayer */
  {

    /**
     * @constructs
     * @param {string} a
     */
    constructor: function(a) {
      a = a || {};
      this.spatialRef = a.spatialReference || new esri.SpatialReference({
        wkid: 102100
      });
      this.preClustered = a.preClustered === true;
      this.clusterRatio = a.clusterRatio || 75;
      this.displaySubTypeFlares = a.displaySubTypeFlares === true;
      this.subTypeFlareProperty = a.subTypeFlareProperty || null;
      this.flareColor = a.flareColor || new esri.Color([0, 0, 0, 0.5]);
      this.maxFlareCount = a.maxFlareCount || 8;
      this.displaySingleFlaresAtCount = a.displaySingleFlaresAtCount || 8;
      this.singleFlareTooltipProperty = a.singleFlareTooltipProperty || null;
      var b = new esri.symbols.TextSymbol().setColor(new esri.Color([255, 255, 255])).setAlign(esri.symbols.Font.ALIGN_START).setFont(new esri.symbols.Font("10pt").setWeight(esri.symbols.Font.WEIGHT_BOLD).setFamily("calibri")).setVerticalAlignment("middle");
      this.textSymbol = a.textSymbol || b;
      this.flareShowMode = a.flareShowMode || "mouse";
      this.clusteringBegin = a.clusteringBegin;
      this.clusteringComplete = a.clusteringComplete;
      this.clusterAreaDisplay = a.clusterAreaDisplay;
      this.clusterAreaRenderer = a.clusterAreaRenderer;
      if (this.clusterAreaDisplay && (this.clusterAreaDisplay !== "always" && this.clusterAreaDisplay !== "hover")) {
        console.error("clusterAreaDisplay can only be 'always' or 'hover'.");
        return
      }
      if (this.flareShowMode !== "mouse" && this.flareShowMode !== "tap") {
        console.error("flareShowMode option can only be 'mouse' or 'tap'");
        return
      }
      this.animationMultipleType = {
        combine: "combine",
        chain: "chain"
      };
      this.events = [];
      this.graphicEvents = [];
      this.animationsRunning = [];
      this.clusters = [];
      this.singles = []
    },

    /**
     * @description setRenderer
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     * @param {string} a
     *
     * @example
     * <caption>Usage of setRenderer</caption>
     * var instance = new FlareClusterLayer(a);
     * instance.setRenderer(b,a);
     *
     * @returns string
     */
    setRenderer: function(b, a) {
      if (a) {
        this.clusterAreaRenderer = a
      }
      return this.inherited(arguments)
    },

    /**
     * @description _setMap
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     * @param {string} a
     *
     * @example
     * <caption>Usage of _setMap</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._setMap(b,a);
     *
     * @returns string
     */
    _setMap: function(b, a) {
      this.map = b;
      this.surface = a;
      this.events.push(dojo.on(this.map, "resize", dojo._base.lang.hitch(this, this._mapResize)));
      this.events.push(dojo.on(this.map, "extent-change", dojo._base.lang.hitch(this, this._clusterData)));
      this.events.push(dojo.on(this.map, "click", dojo._base.lang.hitch(this, this._mapClick)));
      this.events.push(dojo.on(this.map.infoWindow, "show", dojo._base.lang.hitch(this, this._infoWindowShow)));
      this.events.push(dojo.on(this.map.infoWindow, "hide", dojo._base.lang.hitch(this, this._infoWindowHide)));
      this.events.push(dojo.on(this, "graphic-draw", this._graphicDraw));
      this.events.push(dojo.on(this, "graphic-node-remove", this._graphicNodeRemove));
      this.events.push(dojo.on(this, "mouse-over", this._graphicMouseOver));
      this.events.push(dojo.on(this, "mouse-out", this._graphicMouseOut));
      return this.inherited(arguments)
    },

    /**
     * @description _unsetMap
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of _unsetMap</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._unsetMap();
     *
     *
     */
    _unsetMap: function() {
      this.inherited(arguments);
      for (var b = 0,
      a = this.events.length; b < a; b++) {
        if (this.events[b]) {
          this.events[b].remove()
        }
      }
      for (var b = 0,
      a = this.graphicEvents.length; b < a; b++) {
        if (this.graphicEvents[b]) {
          this.graphicEvents[b].remove()
        }
      }
    },

    /**
     * @description onClick
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of onClick</caption>
     * var instance = new FlareClusterLayer(a);
     * instance.onClick(b);
     *
     * @returns string
     */
    onClick: function(b) {
      this._restoreInfoWindowSettings();
      if (b.graphic.attributes.isCluster) {
        b.stopPropagation();
        this._activateCluster(b.graphic);
        this.map.infoWindow.hide()
      } else {
        if (b.graphic.attributes.isFlare) {
          b.stopPropagation();
          var a = this._getFlareFromGraphic(b.graphic);
          if (!a) {
            this._hideFlareDetail();
            this.map.infoWindow.hide();
            return
          }
          if (a.isSummaryFlare || !a.singleData) {
            this._showFlareDetail(b.graphic);
            this.map.infoWindow.hide();
            return
          }
          var e = b.graphic;
          this.originalInfoWindow = {
            highlight: dojo._base.lang.clone(this.map.infoWindow.get("highlight")),
            anchor: dojo._base.lang.clone(this.map.infoWindow.anchor)
          };
          this.map.infoWindow.hide();
          this.map.infoWindow.clearFeatures();
          this.map.infoWindow.set("highlight", false);
          this.map.infoWindow.setFeatures([e]);
          var c = this.map.toScreen({
            x: a.mapPoint.x,
            y: a.mapPoint.y
          });
          this.map.infoWindow.cluster = this.activeCluster;
          var d = esri.geometry.webMercatorUtils.geographicToWebMercator(new esri.geometry.Point(a.singleData.x, a.singleData.y, this.spatialRef));
          this.map.infoWindow.features[0].geometry = d;
          this.map.infoWindow.show(c)
        }
      }
    },

    /**
     * @description add
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of add</caption>
     * var instance = new FlareClusterLayer(a);
     * instance.add(a);
     *
     * @returns string
     */
    add: function(a) {
      if (a.declaredClass) {
        this.inherited(arguments);
        return
      }
      if (this.preClustered) {
        return
      }
      var g = esri.geometry.webMercatorUtils.project(map.extent, new esri.SpatialReference({
        wkid: 102100
      }));
      if (!this.gridClusters || this.gridClusters.length === 0) {
        this._createClusterGrid()
      }
      var d = a;
      if (!this.allData) {
        this.allData = []
      }
      this.allData.push(d);
      if (this.spatialRef.isWebMercator()) {
        web = [d.x, d.y]
      } else {
        web = esri.geometry.webMercatorUtils.lngLatToXY(d.x, d.y)
      }
      if (web[0] < g.xmin || web[0] > g.xmax || web[1] < g.ymin || web[1] > g.ymax) {
        return
      }
      for (var c = 0,
      i = this.gridClusters.length; c < i; c++) {
        var h = this.gridClusters[c];
        if (web[0] < h.extent.xmin || web[0] > h.extent.xmax || web[1] < h.extent.ymin || web[1] > h.extent.ymax) {
          continue
        }
        h.x = h.clusterCount > 0 ? (d.x + (h.x * h.clusterCount)) / (h.clusterCount + 1) : d.x;
        h.y = h.clusterCount > 0 ? (d.y + (h.y * h.clusterCount)) / (h.clusterCount + 1) : d.y;
        if (this.clusterAreaDisplay) {
          h.points.push([d.x, d.y])
        }
        h.clusterCount++;
        var b = false;
        for (var k = 0,
        f = h.subTypeCounts.length; k < f; k++) {
          if (h.subTypeCounts[k].name === d.facilityType) {
            h.subTypeCounts[k].count++;
            b = true;
            break
          }
        }
        if (!b) {
          h.subTypeCounts.push({
            name: d.facilityType,
            count: 1
          })
        }
        h.singles.push(d);
        if (h.clusterCount === 1) {
          this._createSingle(d)
        } else {
          if (h.clusterCount === 2) {
            var e = this.singles.indexOf(h.singles[0]);
            this.remove(h.singles[0].graphic);
            this.singles.splice(e, 1);
            delete h.singles[0].graphic
          } else {
            this._removeCluster(h)
          }
          this._createCluster(h)
        }
      }
    },

    /**
     * @description clear
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of clear</caption>
     * var instance = new FlareClusterLayer(a);
     * instance.clear();
     *
     *
     */
    clear: function() {
      this.inherited(arguments);
      this.activeCluster = null;
      this.activeFlareObject = null;
      this._stopAnimations();
      var c = this.getNode();
      dojo.query("g.cluster-group", c).forEach(dojo.destroy);
      for (var b = 0,
      a = this.graphicEvents.length; b < a; b++) {
        if (this.graphicEvents[b]) {
          this.graphicEvents[b].remove()
        }
      }
      this.map.infoWindow.hide();
      this.map.infoWindow.clearFeatures();
      this.gridClusters = [];
      this.clusters = [];
      this.singles = []
    },

    /**
     * @description _mapResize
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of _mapResize</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._mapResize();
     *
     *
     */
    _mapResize: function() {
      dojo.query("g.cluster-group:empty", this.getNode()).forEach(dojo.destroy)
    },

    /**
     * @description _mapClick
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of _mapClick</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._mapClick(b);
     *
     * @returns string
     */
    _mapClick: function(b) {
      if (!b.target) {
        return
      }
      var a = b.target.getAttribute("class");
      if (!a || a.indexOf("cluster-object") === -1) {
        this._clearActiveCluster()
      } else {
        if (a.indexOf("cluster-object") !== -1) {
          if (this.map.infoWindow.cluster) {
            this._restoreInfoWindowSettings()
          }
          this.map.infoWindow.hide()
        }
      }
    },

    /**
     * @description _graphicDraw
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of _graphicDraw</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._graphicDraw(d);
     *
     * @returns string
     */
    _graphicDraw: function(d) {
      var c = d.graphic;
      if (c.attributes.isCluster) {
        var a = this._getClusterFromGraphic(c);
        this._createClusterGraphic(a);
        if (this.activeCluster === a) {
          this._clearActiveCluster()
        }
      } else {
        if (c.attributes.isClusterArea) {
          var b = c.getShape();
          b.moveToBack()
        }
      }
      return this.inherited(arguments)
    },

    /**
     * @description _graphicNodeRemove
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} c
     *
     * @example
     * <caption>Usage of _graphicNodeRemove</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._graphicNodeRemove(c);
     *
     *
     */
    _graphicNodeRemove: function(c) {
      var b = c.graphic;
      if (b.attributes.isCluster) {
        var a = this._getClusterFromGraphic(b);
        if (a) {
          dojo.destroy(a.groupShape.rawNode)
        }
      }
    },

    /**
     * @description _graphicMouseOver
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of _graphicMouseOver</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._graphicMouseOver(a);
     *
     *
     */
    _graphicMouseOver: function(a) {
      if (this.flareShowMode === "mouse") {
        if (a.graphic.attributes.isCluster) {
          this._activateCluster(a.graphic)
        } else {
          if (a.graphic.attributes.isFlare) {
            this._showFlareDetail(a.graphic)
          }
        }
      }
    },

    /**
     * @description _graphicMouseOut
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of _graphicMouseOut</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._graphicMouseOut(a);
     *
     *
     */
    _graphicMouseOut: function(a) {
      if (a.graphic.attributes.isFlare) {
        this._hideFlareDetail()
      }
    },

    /**
     * @description _infoWindowShow
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of _infoWindowShow</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._infoWindowShow(b);
     *
     * @returns {*}
     */
    _infoWindowShow: function(b) {
      for (var a = 0; a < this.map.infoWindow.features.length; a++) {
        if (this.map.infoWindow.features[a].attributes.isCluster || this.map.infoWindow.features[a].attributes.isClusterArea) {
          this.map.infoWindow.hide();
          return
        }
      }
    },

    /**
     * @description _infoWindowHide
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of _infoWindowHide</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._infoWindowHide(a);
     *
     *
     */
    _infoWindowHide: function(a) {
      this.map.infoWindow.cluster = null
    },

    /**
     * @description addPreClusteredData
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of addPreClusteredData</caption>
     * var instance = new FlareClusterLayer(a);
     * instance.addPreClusteredData(d);
     *
     *
     */
    addPreClusteredData: function(d) {
      if (this.clusteringBegin) {
        this.clusteringBegin()
      }
      this.allData = [];
      this.preClustered = true;
      for (var c = 0,
      a = d.length; c < a; c++) {
        if (d[c].clusterCount) {
          var b = d[c];
          this._createCluster(b)
        } else {
          this._createSingle(d[c])
        }
      }
      if (this.clusteringComplete) {
        this.clusteringComplete()
      }
    },

    /**
     * @description addData
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of addData</caption>
     * var instance = new FlareClusterLayer(a);
     * instance.addData(a);
     *
     *
     */
    addData: function(a) {
      this.allData = a;
      this._clusterData()
    },

    /**
     * @description _restoreInfoWindowSettings
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of _restoreInfoWindowSettings</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._restoreInfoWindowSettings();
     *
     *
     */
    _restoreInfoWindowSettings: function() {
      if (this.originalInfoWindow) {
        this.map.infoWindow.set("highlight", this.originalInfoWindow.highlight);
        this.map.infoWindow.anchor = this.originalInfoWindow.anchor
      }
    },

    /**
     * @description _clusterData
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of _clusterData</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._clusterData();
     *
     * @returns string
     */
    _clusterData: function() {
      if (this.preClustered) {
        return
      }
      if (this.clusteringBegin) {
        this.clusteringBegin()
      }
      this.clear();
      var k = esri.geometry.webMercatorUtils.project(this.map.extent, new esri.SpatialReference({
        wkid: 102100
      }));
      this._createClusterGrid(k);
      var a = this.allData.length;
      var f, d;
      for (var e = 0; e < a; e++) {
        d = this.allData[e];
        if (this.spatialRef.isWebMercator()) {
          f = [d.x, d.y]
        } else {
          f = esri.geometry.webMercatorUtils.lngLatToXY(d.x, d.y)
        }
        if (f[0] < k.xmin || f[0] > k.xmax || f[1] < k.ymin || f[1] > k.ymax) {
          continue
        }
        for (var c = 0,
        m = this.gridClusters.length; c < m; c++) {
          var l = this.gridClusters[c];
          if (f[0] < l.extent.xmin || f[0] > l.extent.xmax || f[1] < l.extent.ymin || f[1] > l.extent.ymax) {
            continue
          }
          l.x = l.clusterCount > 0 ? (d.x + (l.x * l.clusterCount)) / (l.clusterCount + 1) : d.x;
          l.y = l.clusterCount > 0 ? (d.y + (l.y * l.clusterCount)) / (l.clusterCount + 1) : d.y;
          if (this.clusterAreaDisplay) {
            l.points.push([d.x, d.y])
          }
          l.clusterCount++;
          var b = false;
          for (var n = 0,
          h = l.subTypeCounts.length; n < h; n++) {
            if (l.subTypeCounts[n].name === d.facilityType) {
              l.subTypeCounts[n].count++;
              b = true;
              break
            }
          }
          if (!b) {
            l.subTypeCounts.push({
              name: d.facilityType,
              count: 1
            })
          }
          l.singles.push(d)
        }
      }
      for (var e = 0,
      g = this.gridClusters.length; e < g; e++) {
        if (this.gridClusters[e].clusterCount === 1) {
          this._createSingle(this.gridClusters[e].singles[0])
        } else {
          if (this.gridClusters[e].clusterCount > 0) {
            this._createCluster(this.gridClusters[e])
          }
        }
      }
    },

    /**
     * @description _createClusterGrid
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} l
     *
     * @example
     * <caption>Usage of _createClusterGrid</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._createClusterGrid(l);
     *
     *
     */
    _createClusterGrid: function(l) {
      var c = Math.round(this.map.width / this.clusterRatio);
      var k = Math.round(this.map.height / this.clusterRatio);
      var b = (l.xmax - l.xmin) / c;
      var f = (l.ymax - l.ymin) / k;
      var m, a, h, n;
      this.gridClusters = [];
      for (var g = 0; g < c; g++) {
        m = l.xmin + (b * g);
        a = m + b;
        for (var e = 0; e < k; e++) {
          h = l.ymin + (f * e);
          n = h + f;
          var d = new esri.geometry.Extent({
            xmin: m,
            xmax: a,
            ymin: h,
            ymax: n
          });
          d.setSpatialReference(new esri.SpatialReference({
            wkid: 102100
          }));
          this.gridClusters.push({
            extent: d,
            clusterCount: 0,
            subTypeCounts: [],
            singles: [],
            points: []
          })
        }
      }
    },

    /**
     * @description _createSingle
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of _createSingle</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._createSingle(d);
     *
     *
     */
    _createSingle: function(d) {
      this.singles.push(d);
      delete d.graphic;
      var a = new esri.geometry.Point(d.x, d.y, this.spatialRef);
      var b = dojo._base.lang.clone(d);
      var c = new esri.Graphic(a, null, b, null);
      d.graphic = c;
      this.add(c)
    },

    /**
     * @description _createCluster
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of _createCluster</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._createCluster(b);
     *
     * @returns string
     */
    _createCluster: function(b) {
      this.clusters.push(b);
      var a = new esri.geometry.Point(b.x, b.y, this.spatialRef);
      delete b.graphic;
      delete b.graphicShape;
      delete b.groupShape;
      var c = {
        x: b.x,
        y: b.y,
        clusterCount: b.clusterCount
      };
      var h;
      if (this.clusterAreaDisplay && b.points && b.points.length > 0) {
        if (!this.clusterAreaRenderer) {
          console.error("_createCluster: clusterAreaRenderer must be set if clusterAreaDisplay is set.");
          return
        }
        var e = new esri.geometry.Multipoint(this.spatialRef);
        e.points = b.points;
        var d = esri.geometry.geometryEngine.convexHull(e, true);
        var f = dojo._base.lang.clone(c);
        f.isClusterArea = true;
        h = new esri.Graphic(d, null, f, null);
        h.setSymbol(this.clusterAreaRenderer.getSymbol(h));
        this.add(h);
        h.hide()
      }
      c.isCluster = true;
      var g = new esri.Graphic(a, null, c, null);
      b.graphic = g;
      b.areaGraphic = h;
      this.add(g)
    },

    /**
     * @description _createClusterGraphic
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} h
     *
     * @example
     * <caption>Usage of _createClusterGraphic</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._createClusterGraphic(h);
     *
     * @returns {*}
     */
    _createClusterGraphic: function(h) {
      if (h.groupShape) {
        dojo.destroy(h.groupShape.rawNode)
      }
      var j = this.surface.createGroup();
      j.rawNode.setAttribute("class", "cluster-group cluster-object");
      h.groupShape = j;
      var f = this.getNode();
      f.appendChild(j.rawNode);
      var k = h.graphic.getShape();
      if (!k) {
        return
      }
      var b;
      if (h.areaGraphic) {
        if (this.clusterAreaDisplay === "always") {
          h.areaGraphic.show()
        }
        b = h.areaGraphic.getShape();
        if (b) {
          b.rawNode.setAttribute("pointer-events", "none")
        }
      }
      h.graphicShape = k;
      h.graphicShape.rawNode.setAttribute("class", "cluster-object");
      j.add(h.graphicShape);
      var e = this._getShapeCenter(h.graphicShape);
      var a = j.createText({
        x: e.x,
        y: e.y + (this.textSymbol.font.size / 2 - 2),
        text: h.clusterCount,
        align: "middle"
      }).setFont({
        size: this.textSymbol.font.size,
        family: this.textSymbol.font.family,
        weight: this.textSymbol.font.weight
      }).setFill(this.textSymbol.color);
      a.rawNode.setAttribute("pointer-events", "none");
      j.add(a);
      h.textShape = a;
      var g = [];
      var d = dojox.gfx.fx.animateTransform({
        duration: 200,
        shape: j,
        transform: [{
          name: "scaleAt",
          start: [0, 0, e.x, e.y],
          end: [1, 1, e.x, e.y]
        }],
        onEnd: dojo.partial(this._animationEnd, this)
      });
      g.push(d);
      if (this.clusterAreaDisplay === "always" && b) {
        var i = this._getShapeCenter(b);
        var c = dojox.gfx.fx.animateTransform({
          duration: 200,
          shape: b,
          transform: [{
            name: "scaleAt",
            start: [0, 0, i.x, i.y],
            end: [1, 1, i.x, i.y]
          }],
          onEnd: dojo.partial(this._animationEnd, this)
        });
        g.push(c)
      }
      this._playAnimations(g, this.animationMultipleType.combine);
      if (this.flareShowMode === "mouse") {
        this.graphicEvents.push(dojo.on(j, "mouseleave", dojo._base.lang.hitch(this, this._clearActiveCluster)))
      }
    },

    /**
     * @description _activateCluster
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} g
     *
     * @example
     * <caption>Usage of _activateCluster</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._activateCluster(g);
     *
     * @returns string
     */
    _activateCluster: function(g) {
      var C = this._getClusterFromGraphic(g);
      if (!C) {
        return
      }
      if (this.activeCluster) {
        this._clearActiveCluster()
      }
      this.activeCluster = C;
      var P = C.groupShape;
      var L = C.graphicShape;
      P.moveToFront();
      var a = this._getShapeCenter(L);
      var v = [];
      if (this.clusterAreaDisplay === "hover") {
        C.areaGraphic.show();
        var d = dojox.gfx.fx.animateTransform({
          duration: 300,
          shape: C.areaGraphic.getShape(),
          transform: [{
            name: "scaleAt",
            start: [0, 0, a.x, a.y],
            end: [1, 1, a.x, a.y]
          }],
          onEnd: dojo.partial(this._animationEnd, this)
        });
        v.push(d)
      }
      var A = dojox.gfx.fx.animateTransform({
        duration: 400,
        shape: P,
        transform: [{
          name: "scaleAt",
          start: [1, 1, a.x, a.y],
          end: [1.3, 1.3, a.x, a.y]
        }],
        onEnd: dojo.partial(this._animationEnd, this)
      });
      v.push(A);
      this._playAnimations(v, this.animationMultipleType.combine);
      this.flareObjects = [];
      var l = (C.singles && C.singles.length > 0) && (C.clusterCount <= this.displaySingleFlaresAtCount);
      var w = !l && (this.displaySubTypeFlares && this.subTypeFlareProperty && (C.subTypeCounts && C.subTypeCounts.length > 0));
      if (!l && !w) {
        return
      }
      var r = L.getBoundingBox();
      var M = 8;
      var u = 4;
      var k = new esri.symbols.SimpleMarkerSymbol().setStyle(esri.symbols.SimpleMarkerSymbol.STYLE_CIRCLE).setSize(M * 2);
      var s = (a.x - (r.x - M - u)) + M;
      var f = P.createCircle({
        cx: a.x,
        cy: a.y,
        r: s
      }).setFill(new esri.Color([0, 0, 0, 0]));
      f.rawNode.setAttribute("class", "flare-object cluster-object");
      var E = [];
      if (l) {
        for (var R = 0,
        q = C.singles.length; R < q; R++) {
          delete C.singles[R].graphic;
          this.flareObjects.push({
            tooltipText: C.singles[R][this.singleFlareTooltipProperty],
            flareText: "",
            color: this.flareColor,
            singleData: C.singles[R],
            strokeWidth: 2
          })
        }
      } else {
        if (w) {
          var t = C.subTypeCounts.sort(function(j, i) {
            return i.count - j.count
          });
          for (var R = 0,
          q = t.length; R < q; R++) {
            this.flareObjects.push({
              tooltipText: t[R].count + " - " + t[R].name,
              flareText: t[R].count,
              color: this.flareColor,
              strokeWidth: 1
            })
          }
        }
      }
      var z = this.flareObjects.length > this.maxFlareCount;
      var J = z ? this.maxFlareCount: this.flareObjects.length;
      var N = (J % 2 === 0) ? -180 : -90;
      for (var R = 0,
      q = J; R < q; R++) {
        if (R >= this.maxFlareCount) {
          break
        }
        var B = this.flareObjects[R];
        var H = "";
        var e = z && R >= this.maxFlareCount - 1;
        if (e) {
          B.color = this.flareColor;
          B.isSummaryFlare = true;
          for (var Q = this.maxFlareCount - 1,
          S = this.flareObjects.length; Q < S; Q++) {
            H += Q > (this.maxFlareCount - 1) ? "\n": "";
            H += this.flareObjects[Q].tooltipText
          }
        } else {
          H = B.tooltipText
        }
        var b = parseInt(((360 / q) * R).toFixed());
        b = b + N;
        var p = b * (Math.PI / 180);
        B.degree = b;
        B.radius = M;
        B.center = {
          x: a.x + (s - M) * Math.cos(p),
          y: a.y + (s - M) * Math.sin(p)
        };
        var n = P.createGroup();
        var c = dojo._base.lang.clone(k);
        c.setColor(B.color).setOutline(new esri.symbols.SimpleLineSymbol(esri.symbols.SimpleLineSymbol.STYLE_SOLID, this.textSymbol.color, B.strokeWidth));
        var D = n.rawNode.getScreenCTM();
        var h = this.surface.rawNode.createSVGPoint();
        h.x = B.center.x;
        h.y = B.center.y;
        var F = h.matrixTransform(D);
        var m = new esri.geometry.ScreenPoint(F.x, F.y);
        B.mapPoint = this.map.toMap(m);
        var I = B.singleData ? dojo._base.lang.clone(B.singleData) : {};
        I.isFlare = true;
        var O = new esri.Graphic(B.mapPoint, c, I, null);
        this.add(O);
        var o = O.getShape();
        if (!o) {
          return
        }
        n.rawNode.appendChild(o.rawNode);
        var K = n.createText({
          x: B.center.x,
          y: B.center.y + (M / 2 - 1),
          text: !e ? B.flareText: "...",
          align: "middle"
        }).setFill(this.textSymbol.color).setFont({
          size: !e ? 7 : 10,
          family: this.textSymbol.font.family,
          weight: this.textSymbol.font.weight
        });
        K.rawNode.setAttribute("pointer-events", "none");
        n.setTransform({
          xx: 0,
          yy: 0
        });
        n.rawNode.setAttribute("class", "flare-object cluster-object");
        o.rawNode.setAttribute("class", "flare-graphic cluster-object");
        n.rawNode.setAttribute("data-tooltip", H);
        var G = dojox.gfx.fx.animateTransform({
          duration: 50,
          shape: n,
          transform: [{
            name: "scaleAt",
            start: [0, 0, B.center.x, B.center.y],
            end: [1, 1, B.center.x, B.center.y]
          }],
          onEnd: dojo.partial(this._animationEnd, this)
        });
        E.push(G);
        n.rawNode.setAttribute("data-center-x", B.center.x);
        n.rawNode.setAttribute("data-center-y", B.center.y);
        B.flareGroupShape = n
      }
      this._playAnimations(E, this.animationMultipleType.chain)
    },

    /**
     * @description _showFlareDetail
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of _showFlareDetail</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._showFlareDetail(b);
     *
     *
     */
    _showFlareDetail: function(b) {
      var a = this._getFlareFromGraphic(b);
      if (this.activeFlareObject && a !== this.activeFlareObject) {
        this._hideFlareDetail()
      }
      this.activeFlareObject = a;
      this._createTooltip(a.flareGroupShape)
    },

    /**
     * @description _getInfoWindowAnchor
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of _getInfoWindowAnchor</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._getInfoWindowAnchor(a);
     *
     * @returns string
     */
    _getInfoWindowAnchor: function(a) {
      if (a === -180) {
        return "left"
      } else {
        if (a > -10 && a < 10) {
          return "right"
        } else {
          if (a > -260 && a < -170) {
            return "left"
          } else {
            if (a <= -90) {
              return "top-left"
            } else {
              if (a > -90 && a <= 0) {
                return "top-right"
              } else {
                if (a > 0 && a <= 90) {
                  return "bottom-right"
                } else {
                  return "bottom-left"
                }
              }
            }
          }
        }
      }
    },

    /**
     * @description _hideFlareDetail
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of _hideFlareDetail</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._hideFlareDetail();
     *
     * @returns {*}
     */
    _hideFlareDetail: function() {
      if (!this.activeFlareObject) {
        return
      }
      var a = this.activeFlareObject;
      this._destroyTooltip(a.flareGroupShape);
      this.activeFlareObject = null
    },

    /**
     * @description _clearActiveCluster
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} g
     *
     * @example
     * <caption>Usage of _clearActiveCluster</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._clearActiveCluster(g);
     *
     * @returns string
     */
    _clearActiveCluster: function(g) {
      if (!this.activeCluster) {
        return
      }
      if (g) {
        var d = g.toElement || g.relatedTarget;
        if (d && (d.parentElement === this.map.infoWindow.domNode || (d.parentElement && d.parentElement.parentElement === this.map.infoWindow.domNode))) {
          return
        }
      }
      if (this.map.infoWindow.cluster) {
        this.map.infoWindow.hide()
      }
      var k = this.activeCluster;
      this._hideFlareDetail();
      var l = k.groupShape;
      var h = k.graphicShape;
      var a = this._getShapeCenter(h);
      var j = [];
      if (this.clusterAreaDisplay === "hover") {
        var m = dojox.gfx.fx.animateTransform({
          duration: 600,
          shape: k.areaGraphic.getShape(),
          transform: [{
            name: "scaleAt",
            start: [1, 1, a.x, a.y],
            end: [0, 0, a.x, a.y]
          }],
          onEnd: dojo.partial(this._animationEnd, this)
        });
        j.push(m)
      }
      var b = dojox.gfx.fx.animateTransform({
        duration: 400,
        shape: l,
        transform: [{
          name: "scaleAt",
          start: [1.3, 1.3, a.x, a.y],
          end: [1, 1, a.x, a.y]
        }],
        onEnd: dojo.partial(this._animationEnd, this)
      });
      j.push(b);
      this._playAnimations(j, this.animationMultipleType.combine);
      for (var c = 0,
      f = this.graphics.length; c < f; c++) {
        if (this.graphics[c].attributes.isFlare) {
          this.remove(this.graphics[c]);
          f--;
          c--
        }
      }
      dojo.query(".flare-object", l.rawNode).forEach(dojo.destroy);
      this.activeCluster = null
    },

    /**
     * @description _createTooltip
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} j
     *
     * @example
     * <caption>Usage of _createTooltip</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._createTooltip(j);
     *
     * @returns string
     */
    _createTooltip: function(j) {
      var e = dojo.query(".tooltip-text", j.rawNode).length;
      if (e > 0) {
        return
      }
      var m = j.rawNode.getAttribute("data-tooltip");
      if (!m) {
        console.log("no data-tooltip attribute on element");
        return
      }
      var o = m.split("\n");
      var g = parseInt(j.rawNode.getAttribute("data-center-x"));
      var d = parseInt(j.rawNode.getAttribute("data-center-y")) + 18;
      var c = j.createGroup({
        x: g,
        y: d
      });
      c.rawNode.setAttribute("class", "tooltip-text");
      var n = [];
      for (var f = 0,
      h = o.length; f < h; f++) {
        var b = c.createText({
          x: g,
          y: d + (f * 10),
          text: o[f],
          align: "middle"
        }).setFill("#000").setFont({
          size: 8,
          family: this.textSymbol.font.family,
          weight: this.textSymbol.font.weight
        });
        n.push(b);
        b.rawNode.setAttribute("pointer-events", "none")
      }
      var a = 2;
      var k = c.getBoundingBox();
      var l = c.createRect({
        x: k.x - a,
        y: k.y - a,
        width: k.width + (a * 2),
        height: k.height + (a * 2),
        r: 0
      }).setFill(new esri.Color([255, 255, 255, 0.9])).setStroke({
        color: "#000",
        width: 0.5
      });
      l.rawNode.setAttribute("pointer-events", "none");
      j.moveToFront();
      for (var f = 0,
      h = n.length; f < h; f++) {
        n[f].moveToFront()
      }
    },

    /**
     * @description _destroyTooltip
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of _destroyTooltip</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._destroyTooltip(a);
     *
     *
     */
    _destroyTooltip: function(a) {
      dojo.query(".tooltip-text", a.rawNode).forEach(dojo.destroy)
    },

    /**
     * @description _removeCluster
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of _removeCluster</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._removeCluster(b);
     *
     *
     */
    _removeCluster: function(b) {
      for (var c = 0,
      a = this.clusters.length; c < a; c++) {
        if (this.clusters[c] === b) {
          this.clusters.splice(c, 1);
          c--;
          a--
        }
      }
      this.remove(b.graphic);
      dojo.destroy(b.groupShape.rawNode)
    },

    /**
     * @description _getGraphicFromObject
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of _getGraphicFromObject</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._getGraphicFromObject(d);
     *
     * @returns {*}
     */
    _getGraphicFromObject: function(d) {
      for (var b = 0,
      a = this.graphics.length; b < a; b++) {
        var c = this.graphics[b];
        if (c.attributes.x === d.x && c.attributes.y === d.y) {
          return c
        }
      }
      return null
    },

    /**
     * @description _getClusterFromGraphic
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of _getClusterFromGraphic</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._getClusterFromGraphic(d);
     *
     * @returns {*}
     */
    _getClusterFromGraphic: function(d) {
      for (var c = 0,
      a = this.clusters.length; c < a; c++) {
        var b = this.clusters[c];
        if (b.graphic === d || (d.attributes.x === b.x && d.attributes.y === b.y)) {
          b.graphic = d;
          return b
        }
      }
      return null
    },

    /**
     * @description _getClusterFromGroupNode
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} b
     *
     * @example
     * <caption>Usage of _getClusterFromGroupNode</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._getClusterFromGroupNode(b);
     *
     * @returns {*}
     */
    _getClusterFromGroupNode: function(b) {
      for (var c = 0,
      a = this.clusters.length; c < a; c++) {
        if (this.clusters[c].groupShape.rawNode === b) {
          return this.clusters[c]
        }
      }
    },

    /**
     * @description _getFlareFromGraphic
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of _getFlareFromGraphic</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._getFlareFromGraphic(d);
     *
     * @returns string
     */
    _getFlareFromGraphic: function(d) {
      for (var b = 0,
      a = this.flareObjects.length; b < a; b++) {
        var c = this.flareObjects[b];
        if (c.singleData && (c.singleData.x === d.attributes.x && c.singleData.y === d.attributes.y)) {
          return c
        }
        if (d.geometry.x === c.mapPoint.x && d.geometry.y === c.mapPoint.y) {
          return c
        }
      }
      return null
    },

    /**
     * @description _getShapeCenter
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} a
     *
     * @example
     * <caption>Usage of _getShapeCenter</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._getShapeCenter(a);
     *
     * @returns {*}
     */
    _getShapeCenter: function(a) {
      var b = a.getBoundingBox();
      x = b.x + b.width / 2;
      y = b.y + b.height / 2;
      return {
        x: x,
        y: y
      }
    },

    /**
     * @description _animationEnd
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     *
     * @example
     * <caption>Usage of _animationEnd</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._animationEnd(d);
     *
     * @returns {*}
     */
    _animationEnd: function(d) {
      var b = dojo.query("> text", this.shape.rawNode).forEach(function(f) {
        var e = new dojox.gfx.Text(f);
        e.setTransform({
          xx: 1,
          yy: 1
        })
      });
      for (var c = 0,
      a = d.animationsRunning.length; c < a; c++) {
        if (d.animationsRunning[c] === this) {
          d.animationsRunning.splice(c, 1);
          return
        }
      }
    },

    /**
     * @description _playAnimations
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     * @param {string} d
     * @param {string} c
     *
     * @example
     * <caption>Usage of _playAnimations</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._playAnimations(d,c);
     *
     *
     */
    _playAnimations: function(d, c) {
      if (c === this.animationMultipleType.combine) {
        dojo.fx.combine(d).play()
      } else {
        if (c === this.animationMultipleType.chain) {
          dojo.fx.chain(d).play()
        } else {
          for (var b = 0,
          a = d.length; b < a; b++) {
            d[b].play()
          }
        }
      }
      this.animationsRunning = this.animationsRunning.concat(d)
    },

    /**
     * @description _stopAnimations
     * @method
     * @memberOf module:extras/layer/FlareClusterLayer#
     *
     *
     * @example
     * <caption>Usage of _stopAnimations</caption>
     * var instance = new FlareClusterLayer(a);
     * instance._stopAnimations();
     *
     *
     */
    _stopAnimations: function() {
      for (var b = 0,
      a = this.animationsRunning.length; b < a; b++) {
        this.animationsRunning[b].stop()
      }
      this.animationsRunning = []
    }

  })
});
