/**
 * Created by sk_ on 2017/6/27.
 */

/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a MapConstant.
 * @module extras/utils/MapConstant
 *
 * @requires dojo._base.declare
 * @requires esri/symbols/SimpleFillSymbol
 * @requires esri/symbols/SimpleLineSymbol
 * @requires esri/symbols/SimpleMarkerSymbol
 * @requires esri/symbols/PictureMarkerSymbol
 * @requires esri/symbols/Font
 * @requires esri/symbols/TextSymbol
 */
define([
  "dojo/_base/declare",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/symbols/PictureMarkerSymbol",
  "esri/symbols/Font",
  "esri/symbols/TextSymbol"
], function (
  declare,
  SimpleFillSymbol,
  SimpleLineSymbol,
  SimpleMarkerSymbol,
  PictureMarkerSymbol,
  Font,
  TextSymbol
) {
  return declare(null,  /**  @lends module:extras/control/ToolBar */ {
    className: 'MapConstant',
    /**
     * @constructs
     *
     */
    constructor: function () {

    },
    /**
     * default symbols
     * @member symbols
     */
    symbols: {
      "SimpleMarkSymbol": new SimpleMarkerSymbol({
        type: "esriSMS",
        style: "esriSMSCircle",
        angle: 0,
        color: [255, 0, 0, 255],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 255, 255]
        },
        size: 6.75,
        xoffset: 0,
        yoffset: 0
      }),
      "PictureMarkerSimbol": new PictureMarkerSymbol({
        type: "esriPMS",
        angle: 0,
        width: 32,
        height: 32,
        xoffset: 0,
        yoffset: 0,
        url: ""
      }),
      "TextSymbol": new TextSymbol({
        type: "esriTS",
        angle: 0,
        color: [51, 51, 51, 255],
        font: {
          family: "微软雅黑",
          size: 12,
          style: "normal",
          variant: "normal",
          weight: "normal"
        },
        horizontalAlignment: "center",
        kerning: true,
        rotated: false,
        text: "添加默认文本",
        xoffset: 0,
        yoffset: 0
      }),
      "SimpleLineSymbol": new SimpleLineSymbol({
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 3,
        color: [255, 0, 0, 255]
      }),
      "SimpleFillSymbol": new SimpleFillSymbol({
        type: "esriSFS",
        style: "esriSFSSolid",
        color: [0, 0, 0, 64],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 0, 0, 255]
        }
      }),
      'PictureFillSymbol': {
        "type": "esriPFS",
        //"url" : "866880A0",
        "imageData": "iVBORw0KGgoAAAANSUhEUgAAAFQAAABUCAYAAAAcaxDBAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAM9JREFUeJzt0EEJADAMwMA96l/zTBwUSk5ByLxQsx1wTUOxhmINxRqKNRRrKNZQrKFYQ7GGYg3FGoo1FGso1lCsoVhDsYZiDcUaijUUayjWUKyhWEOxhmINxRqKNRRrKNZQrKFYQ7GGYg3FGoo1FGso1lCsoVhDsYZiDcUaijUUayjWUKyhWEOxhmINxRqKNRRrKNZQrKFYQ7GGYg3FGoo1FGso1lCsoVhDsYZiDcUaijUUayjWUKyhWEOxhmINxRqKNRRrKNZQrKFYQ7GGYh/hIwFRFpnZNAAAAABJRU5ErkJggg==",
        "contentType": "image/png",
        "color": null,
        "outline": {
          "type": "esriSLS",
          "style": "esriSLSSolid",
          "color": [110, 110, 110, 255],
          "width": 1
        },
        "width": 63,
        "height": 63,
        "angle": 0,
        "xoffset": 0,
        "yoffset": 0,
        "xscale": 1,
        "yscale": 1
      },

      // concrete symbol
      "Text": new TextSymbol({
        type: "esriTS",
        angle: 0,
        color: [51, 51, 51, 255],
        font: {
          family: "微软雅黑",
          size: 12,
          style: "normal",
          variant: "normal",
          weight: "normal"
        },
        horizontalAlignment: "center",
        kerning: true,
        rotated: false,
        text: "添加默认文本",
        xoffset: 0,
        yoffset: 0
      }),
      "Circle": new SimpleMarkerSymbol({
        type: "esriSMS",
        style: "esriSMSCircle",
        angle: 0,
        color: [255, 0, 0, 255],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 3,
          color: [255, 255, 255]
        },
        size: 18,
        xoffset: 0,
        yoffset: 0
      }),
      "Point": new SimpleMarkerSymbol({
        type: "esriSMS",
        style: "esriSMSCircle",
        angle: 0,
        color: [255, 0, 0, 255],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 3,
          color: [255, 255, 255]
        },
        size: 18,
        xoffset: 0,
        yoffset: 0
      }),
      "Polyline": new SimpleLineSymbol({
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      }),
      "Polygon": new SimpleFillSymbol({
        type: "esriSFS",
        style: "esriSFSSolid",
        color: [0, 0, 0, 64],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 0, 0, 255]
        }
      }),
      "Extent": new SimpleFillSymbol({
        type: "esriSFS",
        style: "esriSFSSolid",
        color: [0, 0, 0, 64],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 1.5,
          color: [255, 0, 0, 255]
        }
      }),

      /**
       * symbol properties
       * @member PointProp
       */
      PointProp: {
        type: "esriSMS",
        style: "esriSMSCircle",
        angle: 0,
        color: [255, 0, 0, 255],
        outline: {
          type: "esriSLS",
          style: "esriSLSSolid",
          width: 3,
          color: [255, 255, 255]
        },
        size: 18,
        xoffset: 0,
        yoffset: 0
      }
    },
    /**
     * edit symbol properties
     * @member editSymbols
     */
    editSymbols: {

    },
    /**
     * @member highlight
     */
    highlight: {
      defaultId: 'highlight_graphic',       // the id of the highlighted graphic
      defaultTimes: 8,                      // times to highlighted graphic
      threshold: 1000,                      // highlighted threshold
      symbol: {                             // symbol of the highlighted graphic
        "Point": {
          "type": "esriPMS",
          "angle": 0,
          "width": 30,
          "height": 30,
          "xoffset": 0,
          "yoffset": 0,
          "url": ''
        },
        "Polyline": {
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
      }
    },
    /**
     * @method
     */
    symbolFactory: function (graphicType,symbolAttr) {
      var symbol = null;
      switch (graphicType){
        case 'point':
        case 'multipoint':
        case 'simplemarkersymbol':
          symbol = new SimpleMarkerSymbol(symbolAttr);
          break;
        case 'image':
        case 'picturemarkersymbol':
          symbol = new PictureMarkerSymbol(symbolAttr);
          break;
        case 'polyline':
        case 'simplelinesymbol':
          symbol = new SimpleLineSymbol(symbolAttr);
          break;
        case 'text':
        case 'textsymbol':
          symbol = new TextSymbol(symbolAttr);
          break;
        default:
          symbol = new SimpleFillSymbol(symbolAttr);
          break;
      }
      return symbol;
    },

    /**
     * mouse cursor style
     * @member mouseCursor
     */
    mouseCursor: {
      "PAN": "cursor/pan.ani",
      "ZOOMIN": "cursor/zoomin.ani",
      "ZOOMOUT": "cursor/zoomout.ani",
      "POLYGON": "cursor/select_poly.ani",
      "POLYLINE": "cursor/select_polyline.ani",
      "POINT": "cursor/select_polyline.ani",
      "EXTENT": "cursor/select_extent.ani",
      "IDENTIFY": "cursor/Hand.cur",
      "OVAL": "cursor/select_polyline.ani",
      "POSITION": "cursor/SunPositionTool.ani"
    },

    /**
     * default layer's id for graphic layers on the map
     * @member defaultLayerIds
     */
    defaultLayerIds: {
      //默认图层绘制层ID
      drawLayerId: 'smart_gis_draw_layer',
      // 默认添加
      addLayerId: 'smart_gis_add_layer',
      // 轨迹
      trackLayerId: 'smart_gis_track_layer',

      locateLayerId: 'smart_gis_locate_layer',
      // query layer
      queryLayerId: 'smart_gis_query_layer',
      // temporary draw layer id for query
      queryDrawLayerId: 'smart_gis_query_draw_layer'
    },
    /**
     * @member graphicType
     */
    graphicType: {
      POINT: 'point',
      POLYGON: 'polygon',
      PLYLINE: 'polyline',
      FREEHAND_POLYLINE: 'freehandpolyline',
      EXTENT: 'extent',
      CIRCLE: 'circle',
      ELLIPSE: 'ellipse',
      SECTOR: 'sector'
    },
    /**
     * @member mapProperty
     */
    mapProperty: {
      wkid: 102100
    },
    /**
     * @member Animation
     */
    Animation: {

    }
  })
});
