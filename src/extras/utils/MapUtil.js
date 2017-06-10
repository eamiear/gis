/**
* Created by sk_ on 2017-6-10.
*/

/**
* @fileOverview This is base definition for all composed classes defined by the system
* Module representing a MapUtil.
* @module extras/utils/MapUtil
*
* 
*/
define([

],
function(

) {
  return declare(null,
  /**  @lends module:extras/utils/MapUtil */
  {

    /**
     * @constructs
     * 
     */
    constructor: function() {

},

    /**
     * @description getMouseEvent
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} e
     * @param {string} d
     * @param {string} c
     * @param {string} a
     * 
     * @example
     * <caption>Usage of getMouseEvent</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.getMouseEvent(e,d,c,a);
     * })
     * 
     *
     * 
     */
    getMouseEvent: function(e, d, c, a) {
      if (dojo.isIE) {
        e.onmouseenter = function() {
          if (c) {
            c()
          }
        };
        e.onmouseleave = function() {
          if (a) {
            a()
          }
        }
      } else {
        var b = false;
        e.onmouseover = function() {
          if (!b) {
            b = true;
            if (c) {
              c()
            }
          }
        };
        e.onmouseout = function() {
          var i = dojo.coords(e);
          var h = this,
          k = window.event || k,
          f = document.body.scrollLeft + k.clientX,
          l = document.body.scrollTop + k.clientY;
          var g = $y = 0;
          do {
            g += h.offsetLeft;
            $y += h.offsetTop
          } while (( h = h . offsetParent ) && h.tagName != "BODY");
          var j = {
            x: g,
            y: $y
          };
          if (f <= j.x || f >= (j.x + i.w) || l <= j.y || l >= (j.y + i.h)) {
            b = false;
            if (a) {
              a()
            }
          }
        }
      }
    },

    /**
     * @description getMouseEvents
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} d
     * @param {string} c
     * @param {string} a
     * 
     * @example
     * <caption>Usage of getMouseEvents</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.getMouseEvents(d,c,a);
     * })
     * 
     *
     * 
     */
    getMouseEvents: function(d, c, a) {
      if (dojo.isIE) {
        d.onmouseenter = function() {
          if (c) {
            c()
          }
        };
        d.onmouseleave = function() {
          if (a) {
            a()
          }
        }
      } else {
        var b = false;
        d.onmouseover = function() {
          if (!b) {
            b = true;
            if (c) {
              c()
            }
          }
        };
        d.onmouseout = function() {
          var i = dojo.coords(d);
          var h = this,
          k = window.event || k,
          f = document.body.scrollLeft + k.clientX,
          l = document.body.scrollTop + k.clientY;
          var g = $y = 0;
          do {
            g += h.offsetLeft;
            $y += h.offsetTop
          } while (( h = h . offsetParent ) && h.tagName != "BODY");
          var j = {
            x: g,
            y: $y
          };
          if (f <= j.x || f >= (j.x + i.w) || l <= j.y || l >= (j.y + i.h)) {
            b = false;
            if (a) {
              a()
            }
          }
        }
      }
    },

    /**
     * @description scrollObjectUp
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} c
     * @param {string} a
     * 
     * @example
     * <caption>Usage of scrollObjectUp</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.scrollObjectUp(c,a);
     * })
     * 
     *
     * @returns string
     */
    scrollObjectUp: function(c, a) {
      if (!c) {
        return
      }
      var b = this.clearScrollInterval(c);
      this.scrollUp = window.setInterval(dojo.hitch(this,
      function() {
        if (this.scrollStep > 0) {
          c.scrollTop = this.scrollStep - 1;
          this.scrollStep = this.scrollStep - 1
        } else {
          this.clearScrollInterval();
          this.scrollStep = c.scrollTop
        }
      }), a == null ? 10 : parseInt(a))
    },

    /**
     * @description scrollObjectNextUp
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} c
     * 
     * @example
     * <caption>Usage of scrollObjectNextUp</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.scrollObjectNextUp(c);
     * })
     * 
     *
     * @returns string
     */
    scrollObjectNextUp: function(c) {
      if (!c) {
        return
      }
      var b = this.clearScrollInterval(c);
      var a = c.scrollTop - b;
      this.scrollStep = c.scrollTop = a > 0 ? a: 0
    },

    /**
     * @description scrollObjectDown
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} c
     * @param {string} a
     * 
     * @example
     * <caption>Usage of scrollObjectDown</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.scrollObjectDown(c,a);
     * })
     * 
     *
     * @returns string
     */
    scrollObjectDown: function(c, a) {
      if (!c) {
        return
      }
      var b = this.clearScrollInterval(c);
      this.scrollDown = window.setInterval(dojo.hitch(this,
      function() {
        if (this.scrollStep < b) {
          c.scrollTop = this.scrollStep + 1;
          this.scrollStep = this.scrollStep + 1
        } else {
          this.scrollStep = c.scrollTop
        }
      }), a == null ? 10 : parseInt(a))
    },

    /**
     * @description scrollObjectNextDown
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} c
     * 
     * @example
     * <caption>Usage of scrollObjectNextDown</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.scrollObjectNextDown(c);
     * })
     * 
     *
     * @returns string
     */
    scrollObjectNextDown: function(c) {
      if (!c) {
        return
      }
      var b = this.clearScrollInterval(c);
      var a = c.scrollTop + b;
      this.scrollStep = c.scrollTop = dojo.coords(c).h < a ? dojo.coords(c).h: a
    },

    /**
     * @description clearScrollInterval
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} c
     * 
     * @example
     * <caption>Usage of clearScrollInterval</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.clearScrollInterval(c);
     * })
     * 
     *
     * @returns {*}
     */
    clearScrollInterval: function(c) {
      if (this.scrollUp) {
        window.clearInterval(this.scrollUp);
        this.scrollUp = null
      }
      if (this.scrollDown) {
        window.clearInterval(this.scrollDown);
        this.scrollDown = null
      }
      if (c) {
        var a = dojo.coords(c).h;
        var b = c.scrollHeight - a;
        return b
      }
    }
  });
  dojo.mixin(extras.utils.MapUtil, (function() {
    var q = 6378137,
    m = 3.141592653589793,
    l = 57.29577951308232,
    d = 0.017453292519943,
    n = Math.floor,
    g = Math.log,
    a = Math.sin,
    h = Math.exp,
    f = Math.atan;
    function c(s) {
      return s * l
    }
    function e(s) {
      return s * d
    }
    function k(s, u) {
      var t = e(u);
      return [e(s) * q, q / 2 * g((1 + a(t)) / (1 - a(t)))]
    }
    function b(s, v, u) {
      var t = c(s / q);
      if (u) {
        return [t, c((m / 2) - (2 * f(h( - 1 * v / q))))]
      }
      return [t - (n((t + 180) / 360) * 360), c((m / 2) - (2 * f(h( - 1 * v / q))))]
    }
    function i(A, x, t, v) {
      if (A instanceof esri.geometry.Point) {
        var D = x(A.x, A.y, v);
        return new esri.geometry.Point(D[0], D[1], new esri.SpatialReference(t))
      } else {
        if (A instanceof esri.geometry.Extent) {
          var y = x(A.xmin, A.ymin, v),
          B = x(A.xmax, A.ymax, v);
          return new esri.geometry.Extent(y[0], y[1], B[0], B[1], new esri.SpatialReference(t))
        } else {
          if (A instanceof esri.geometry.Polyline || A instanceof esri.geometry.Polygon) {
            var w = A instanceof esri.geometry.Polyline,
            C = w ? A.paths: A.rings,
            z = [],
            s;
            dojo.forEach(C,
            function(E) {
              z.push(s = []);
              dojo.forEach(E,
              function(F) {
                s.push(x(F[0], F[1], v))
              })
            });
            if (w) {
              return new esri.geometry.Polyline({
                paths: z,
                spatialReference: t
              })
            } else {
              return new esri.geometry.Polygon({
                rings: z,
                spatialReference: t
              })
            }
          } else {
            if (A instanceof esri.geometry.Multipoint) {
              var u = [];
              dojo.forEach(A.points,
              function(E) {
                u.push(x(E[0], E[1], v))
              });
              return new esri.geometry.Multipoint({
                points: u,
                spatialReference: t
              })
            }
          }
        }
      }
    }
    var r = 39.37,
    o = 20015077 / 180,
    j = esri.config.defaults,
    p = esri.WKIDUnitConversion;
    return {

      /**
     * @description geographicToWebMercator
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} s
     * 
     * @example
     * <caption>Usage of geographicToWebMercator</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.geographicToWebMercator(s);
     * })
     * 
     *
     * @returns string
     */
      geographicToWebMercator: function(s) {
        return i(s, k, {
          wkid: 102100
        })
      },

      /**
     * @description webMercatorToGeographic
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} s
     * @param {string} t
     * 
     * @example
     * <caption>Usage of webMercatorToGeographic</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.webMercatorToGeographic(s,t);
     * })
     * 
     *
     * @returns string
     */
      webMercatorToGeographic: function(s, t) {
        return i(s, b, {
          wkid: 4326
        },
        t)
      },

      /**
     * @description getScale
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} z
     * 
     * @example
     * <caption>Usage of getScale</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.getScale(z);
     * })
     * 
     *
     * @returns string
     */
      getScale: function(z) {
        var v, u, x, w;
        if (arguments.length > 1) {
          v = arguments[0];
          u = arguments[1];
          x = arguments[2]
        } else {
          v = z.extent;
          u = z.width;
          var t = z.spatialReference;
          if (t) {
            x = t.wkid;
            w = t.wkt
          }
        }
        var y;
        if (x) {
          y = p.values[p[x]]
        } else {
          if (w && (w.search(/^PROJCS/i) !== -1)) {
            var s = /UNIT\[([^\]]+)\]\]$/i.exec(w);
            if (s && s[1]) {
              y = parseFloat(s[1].split(",")[1])
            }
          }
        }
        return esri.geometry._getScale(v, u, y)
      },

      /**
     * @description _getScale
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} s
     * @param {string} u
     * @param {string} t
     * 
     * @example
     * <caption>Usage of _getScale</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance._getScale(s,u,t);
     * })
     * 
     *
     * @returns string
     */
      _getScale: function(s, u, t) {
        return (s.getWidth() / u) * (t || o) * r * j.screenDPI
      },

      /**
     * @description getExtentForScale
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {number} x
     * @param {number} y
     * 
     * @example
     * <caption>Usage of getExtentForScale</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance.getExtentForScale(x,y);
     * })
     * 
     *
     * @returns string
     */
      getExtentForScale: function(x, y) {
        var v, u, t = x.spatialReference;
        if (t) {
          v = t.wkid;
          u = t.wkt
        }
        var w;
        if (v) {
          w = p.values[p[v]]
        } else {
          if (u && (u.search(/^PROJCS/i) !== -1)) {
            var s = /UNIT\[([^\]]+)\]\]$/i.exec(u);
            if (s && s[1]) {
              w = parseFloat(s[1].split(",")[1])
            }
          }
        }
        return esri.geometry._getExtentForScale(x.extent, x.width, w, y, true)
      },

      /**
     * @description _getExtentForScale
     * @method
     * @memberOf module:extras/utils/MapUtil#
     * @param {string} s
     * @param {number} x
     * @param {string} t
     * @param {string} w
     * @param {string} u
     * 
     * @example
     * <caption>Usage of _getExtentForScale</caption>
     * require(['extras/utils/MapUtil'],function(MapUtil){
     *   var instance = new MapUtil();
     *   instance._getExtentForScale(s,x,t,w,u);
     * })
     * 
     *
     * @returns string
     */
      _getExtentForScale: function(s, x, t, w, u) {
        var v;
        if (u) {
          v = t
        } else {
          v = p.values[p[t]]
        }
        return s.expand(((w * x) / ((v || o) * r * j.screenDPI)) / s.getWidth())
      }
    }
  } ()), {

})
});