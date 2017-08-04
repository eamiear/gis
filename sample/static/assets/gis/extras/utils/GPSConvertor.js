/**
 * @fileOverview This is base definition for all composed classes defined by the system
 * Module representing a GPSConvertor.
 *
 * 互联网在线地图使用的坐标系
 *   火星坐标系：
 *     iOS 地图（其实是高德）
 *     Gogole地图
 *     搜搜、阿里云、高德地图
 *   百度坐标系：
 *      百度地图
 *   WGS84坐标系：
 *      国际标准，谷歌国外地图、osm地图等国外的地图
 *
 * @module extras/utils/GPSConvertor
 *
 */
define(function () {
  return {
    PI: 3.141592653589793,
    x_pi: 3.141592653589793 * 3000 / 180,
    delta: function(lat, lon) {
      var a = 6378245.0;//a: 卫星椭球坐标投影到平面地图坐标系的投影因子。
      var ee = 0.00669342162296594323;//ee: 椭球的偏心率。
      var dLat = this.transformLat(lon - 105.0, lat - 35.0);
      var dLon = this.transformLon(lon - 105.0, lat - 35.0);
      var radLat = lat / 180.0 * this.PI;
      var magic = Math.sin(radLat);
      magic = 1 - ee * magic * magic;
      var sqrtMagic = Math.sqrt(magic);
      dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * this.PI);
      dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * this.PI);
      return { lat: dLat, lon: dLon };
    },
    /**
     * 【WGS-84】地球坐标（国际标准GPS坐标系） 转为 【GCJ-02】火星坐标（国测局坐标系）
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} wgsLat
     * @param {number} wgsLon
     * @returns {*}
     */
    wgs84ToGcj02: function (wgsLat, wgsLon) {
      wgsLat = parseFloat(wgsLat);
      wgsLon = parseFloat(wgsLon);
      if (this.outOfChina(wgsLat, wgsLon)) return {lat: wgsLat, lon: wgsLon};

      var delta = this.delta(wgsLat, wgsLon);
      return {lat: wgsLat + delta.lat, log: wgsLon + delta.lon};
    },
    /**
     * 【GCJ-02】火星坐标（国测局坐标系）转为 【WGS-84】地球坐标（国际标准GPS坐标系）
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} gcjLat
     * @param {number} gcjLon
     * @returns {*}
     */
    gcj02ToWgs84: function (gcjLat, gcjLon) {
      gcjLat = parseFloat(gcjLat);
      gcjLon = parseFloat(gcjLon);
      if (this.outOfChina(gcjLat, gcjLon)) return {lat: gcjLat, lon: gcjLon};

      var delta = this.delta(gcjLat, gcjLon);
      return {lat: gcjLat - delta.lat, log: gcjLon - delta.lon};
    },
    /**
     * 【GCJ-02】火星坐标（国测局坐标系）转为 【WGS-84】地球坐标（国际标准GPS坐标系） 精确转换
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} gcjLat
     * @param {number} gcjLon
     * @returns {{lat: *, lon: *}}
     */
    gcj02ToWgs84Exact: function (gcjLat, gcjLon) {
      gcjLat = parseFloat(gcjLat);
      gcjLon = parseFloat(gcjLon);
      var initDelta = 0.01;
      var threshold = 0.000000001;
      var dLat = initDelta, dLon = initDelta;
      var mLat = gcjLat - dLat, mLon = gcjLon - dLon;
      var pLat = gcjLat + dLat, pLon = gcjLon + dLon;
      var wgsLat, wgsLon, i = 0;
      while (1) {
        wgsLat = (mLat + pLat) / 2;
        wgsLon = (mLon + pLon) / 2;
        var tmp = this.gcj02ToWgs84(wgsLat, wgsLon);
        dLat = tmp.lat - gcjLat;
        dLon = tmp.lon - gcjLon;
        if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold))  break;
        if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
        if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

        if (++i > 10000) break;
      }
      return {'lat': wgsLat, 'lon': wgsLon};
    },
    /**
     * 【GCJ-02】火星坐标（国测局坐标系）转为 【BD-09】百度坐标
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} gcjLat
     * @param {number} gcjLon
     * @returns {{lat: number, lon: number}}
     */
    gcj02ToBd09: function (gcjLat, gcjLon) {
      var x = parseFloat(gcjLon), y = parseFloat(gcjLat);
      var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * this.x_pi);
      var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * this.x_pi);
      var bdLon = z * Math.cos(theta) + 0.0065;
      var bdLat = z * Math.sin(theta) + 0.006;
      return {'lat' : bdLat,'lon' : bdLon};
    },
    /**
     * 【BD-09】百度坐标 转为 【GCJ-02】火星坐标（国测局坐标系）
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} bdLat
     * @param {number} bdLon
     * @returns {{lat: number, lon: number}}
     */
    bd09ToGcj02: function (bdLat, bdLon) {
      var x = +bdLon - 0.0065, y = +bdLat - 0.006;
      var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * this.x_pi);
      var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * this.x_pi);
      var gcjLon = z * Math.cos(theta);
      var gcjLat = z * Math.sin(theta);
      return {'lat' : gcjLat, 'lon' : gcjLon};
    },
    /**
     * 【WGS-84】地球坐标（国际标准GPS坐标系） 转为 【BD-09】百度坐标
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} wgsLat
     * @param {number} wgsLon
     * @returns {*|{lat, lon}|{lat: number, lon: number}}
     */
    wgs84ToBd09: function(wgsLat, wgsLon) {
      var gcj02 = this.wgs84ToGcj02(wgsLat, wgsLon);
      return this.gcj02ToBd09(gcj02.lat, gcj02.lon);
    },
    /**
     * 【BD-09】百度坐标 转为 【WGS-84】地球坐标（国际标准GPS坐标系）
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} bdLat
     * @param {number} bdLon
     * @returns {*|{lat, lon}|{lat, log}}
     */
    bd09ToWgs84: function(bdLat, bdLon) {
      var gcj02 = this.bd09ToGcj02(bdLat, bdLon);
      return this.gcj02ToWgs84(gcj02.lat, gcj02.lon);
    },
    /**
     * 【WGS-84】地球坐标（国际标准GPS坐标系） 转为 墨卡托坐标
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} wgsLat
     * @param {number} wgsLon
     * @returns {{lat: number, lon: number}}
     */
    wgs84ToMercator: function(wgsLat, wgsLon) {
      var x = +wgsLon * 20037508.34 / 180.;
      var y = Math.log(Math.tan((90. + (+wgsLat)) * this.PI / 360.)) / (this.PI / 180.);
      y = y * 20037508.34 / 180.;
      return {'lat' : y, 'lon' : x};
    },
    /**
     * 墨卡托坐标 转为 【WGS-84】地球坐标（国际标准GPS坐标系）
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} mercatorLat
     * @param {number} mercatorLon
     * @returns {{lat: number, lon: number}}
     */
    mercatorToWgs84: function(mercatorLat, mercatorLon) {
      var x = +mercatorLon / 20037508.34 * 180.;
      var y = +mercatorLat / 20037508.34 * 180.;
      y = 180 / this.PI * (2 * Math.atan(Math.exp(y * this.PI / 180.)) - this.PI / 2);
      return {'lat' : y, 'lon' : x};
    },
    /**
     * 计算两点之间的距离
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} latA
     * @param {number} lonA
     * @param {number} latB
     * @param {number} lonB
     * @returns {number}
     */
    distance: function(latA, lonA, latB, lonB) {
      var earthR = 6371000.;
      var x = Math.cos(latA * this.PI / 180.) * Math.cos(latB * this.PI / 180.) * Math.cos((lonA - lonB) * this.PI / 180);
      var y = Math.sin(latA * this.PI / 180.) * Math.sin(latB * this.PI / 180.);
      var s = x + y;
      if (s > 1) s = 1;
      if (s < -1) s = -1;
      var alpha = Math.acos(s);
      return alpha * earthR;
    },
    /**
     * 判断坐标是否在中国以外
     * 谷歌地图在国内为 GCJ-02坐标系，在国外为 WGS-84 坐标系
     * @memberOf module:extras/utils/GPSConvertor#
     * @param {number} lat
     * @param {number} lon
     * @returns {boolean}
     */
    outOfChina: function(lat, lon) {
      return (lon < 72.004 || lon > 137.8347) || (lat < 0.8293 || lat > 55.8271);
    },
    transformLat: function(x, y) {
      var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(y * this.PI) + 40.0 * Math.sin(y / 3.0 * this.PI)) * 2.0 / 3.0;
      ret += (160.0 * Math.sin(y / 12.0 * this.PI) + 320 * Math.sin(y * this.PI / 30.0)) * 2.0 / 3.0;
      return ret;
    },
    transformLon: function(x, y) {
      var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
      ret += (20.0 * Math.sin(6.0 * x * this.PI) + 20.0 * Math.sin(2.0 * x * this.PI)) * 2.0 / 3.0;
      ret += (20.0 * Math.sin(x * this.PI) + 40.0 * Math.sin(x / 3.0 * this.PI)) * 2.0 / 3.0;
      ret += (150.0 * Math.sin(x / 12.0 * this.PI) + 300.0 * Math.sin(x / 30.0 * this.PI)) * 2.0 / 3.0;
      return ret;
    }
  };
});
