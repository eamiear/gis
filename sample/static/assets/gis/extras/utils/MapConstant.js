/**
 * Created by K on 2017/6/27.
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
  return declare(null, {
    className: 'MapConstant',
    /**
     * @constructs
     *
     */
    constructor: function () {

    },
    // default symbols
    symbols: {
      // abstract symbols
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

      // symbol properties
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
    editSymbols: {

    },
    hightSymbol: {
      "Point": {
        "type": "esriPMS",
        "angle": 0,
        "width": 30,
        "height": 30,
        "xoffset": 0,
        "yoffset": 0,
        "url": ''
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
    },

    // mouse cursor style
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

    // default layer's id for graphic layers on the map
    defaultLayerIds: {
      //默认图层绘制层ID
      drawLayerId: 'smart_gis_draw_layer',
      // 默认添加
      addLayerId: 'smart_gis_add_layer',
      // 轨迹
      trackLayerId: 'smart_gis_track_layer',

      locateLayerId: 'smart_gis_locate_layer'
    },

    mapProperty: {
      wkid: 102100
    }
  })
});
