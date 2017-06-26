/**
 * Created by K on 2017/6/22.
 */
define(['exports'], function (exports) {
  exports.defaultSymbol = {
    "SimpleMarkSymbol": {
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
    },
    "PictureMarkerSimbol": {
      type: "esriPMS",
      angle: 0,
      width: 32,
      height: 32,
      xoffset: 0,
      yoffset: 0,
      url: selfUrl + "/themes/default/img/tt.png"
    },
    "TextSymbol": {
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
    },
    "SimpleLineSymbol": {
      type: "esriSLS",
      style: "esriSLSSolid",
      width: 3,
      color: [255, 0, 0, 255]
    },
    "SimpleFillSymbol": {
      type: "esriSFS",
      style: "esriSFSSolid",
      color: [0, 0, 0, 64],
      outline: {
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      }
    },
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
    "Point": {
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
    },
    "Polyline": {
      type: "esriSLS",
      style: "esriSLSSolid",
      width: 1.5,
      color: [255, 0, 0, 255]
    },
    "Polygon": {
      type: "esriSFS",
      style: "esriSFSSolid",
      color: [0, 0, 0, 64],
      outline: {
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      }
    },
    "Extent": {
      type: "esriSFS",
      style: "esriSFSSolid",
      color: [0, 0, 0, 64],
      outline: {
        type: "esriSLS",
        style: "esriSLSSolid",
        width: 1.5,
        color: [255, 0, 0, 255]
      }
    }
  };
});
