dojo.provide("extras.utils");
extras.utils.GPSConvertor = {
  PI: 3.141592653589793,
  x_pi: 3.141592653589793 * 3000 / 180,
  delta: function(h, c) {
    var j = 6378245;
    var f = 0.006693421622965943;
    var g = this.transformLat(c - 105, h - 35);
    var b = this.transformLon(c - 105, h - 35);
    var d = h / 180 * this.PI;
    var i = Math.sin(d);
    i = 1 - f * i * i;
    var e = Math.sqrt(i);
    g = (g * 180) / ((j * (1 - f)) / (i * e) * this.PI);
    b = (b * 180) / (j / e * Math.cos(d) * this.PI);
    return {
      lat: g,
      lon: b
    }
  },
  gcj_encrypt: function(a, b) {
    if (this.outOfChina(a, b)) {
      return {
        lat: a,
        lon: b
      }
    }
    var c = this.delta(a, b);
    return {
      lat: a + c.lat,
      lon: b + c.lon
    }
  },
  gcj_decrypt: function(a, b) {
    if (this.outOfChina(a, b)) {
      return {
        lat: a,
        lon: b
      }
    }
    var c = this.delta(a, b);
    return {
      lat: a - c.lat,
      lon: b - c.lon
    }
  },
  gcj_decrypt_exact: function(b, g) {
    var n = 0.01;
    var h = 1e-9;
    var l = n,
      a = n;
    var d = b - l,
      m = g - a;
    var j = b + l,
      o = g + a;
    var c, k, f = 0;
    while (1) {
      c = (d + j) / 2;
      k = (m + o) / 2;
      var e = this.gcj_encrypt(c, k);
      l = e.lat - b;
      a = e.lon - g;
      if ((Math.abs(l) < h) && (Math.abs(a) < h)) {
        break
      }
      if (l > 0) {
        j = c
      } else {
        d = c
      }
      if (a > 0) {
        o = k
      } else {
        m = k
      }
      if (++f > 10000) {
        break
      }
    }
    return {
      lat: c,
      lon: k
    }
  },
  bd_encrypt: function(b, d) {
    var a = d,
      f = b;
    var e = Math.sqrt(a * a + f * f) + 0.00002 * Math.sin(f * this.x_pi);
    var c = Math.atan2(f, a) + 0.000003 * Math.cos(a * this.x_pi);
    bdLon = e * Math.cos(c) + 0.0065;
    bdLat = e * Math.sin(c) + 0.006;
    return {
      lat: bdLat,
      lon: bdLon
    }
  },
  bd_decrypt: function(e, f) {
    var a = f - 0.0065,
      h = e - 0.006;
    var g = Math.sqrt(a * a + h * h) - 0.00002 * Math.sin(h * this.x_pi);
    var d = Math.atan2(h, a) - 0.000003 * Math.cos(a * this.x_pi);
    var c = g * Math.cos(d);
    var b = g * Math.sin(d);
    return {
      lat: b,
      lon: c
    }
  },
  transferWgs84ToBaidu: function(c, b) {
    var a = this.gcj_encrypt(b, c);
    return this.bd_encrypt(a.lat, a.lon)
  },
  transferBaiduToToWgs84: function(b, a) {
    var c = this.bd_decrypt(a, b);
    return this.gcj_decrypt(c.lat, c.lon)
  },
  mercator_encrypt: function(b, c) {
    var a = c * 20037508.34 / 180;
    var d = Math.log(Math.tan((90 + b) * this.PI / 360)) / (this.PI / 180);
    d = d * 20037508.34 / 180;
    return {
      lat: d,
      lon: a
    }
  },
  mercator_decrypt: function(b, c) {
    var a = c / 20037508.34 * 180;
    var d = b / 20037508.34 * 180;
    d = 180 / this.PI * (2 * Math.atan(Math.exp(d * this.PI / 180)) - this.PI / 2);
    return {
      lat: d,
      lon: a
    }
  },
  distance: function(f, i, d, h) {
    var b = 6371000;
    var g = Math.cos(f * this.PI / 180) * Math.cos(d * this.PI / 180) * Math.cos((i - h) * this.PI / 180);
    var e = Math.sin(f * this.PI / 180) * Math.sin(d * this.PI / 180);
    var j = g + e;
    if (j > 1) {
      j = 1
    }
    if (j < -1) {
      j = -1
    }
    var c = Math.acos(j);
    var a = c * b;
    return a
  },
  outOfChina: function(a, b) {
    if (b < 72.004 || b > 137.8347) {
      return true
    }
    if (a < 0.8293 || a > 55.8271) {
      return true
    }
    return false
  },
  transformLat: function(a, c) {
    var b = -100 + 2 * a + 3 * c + 0.2 * c * c + 0.1 * a * c + 0.2 * Math.sqrt(Math.abs(a));
    b += (20 * Math.sin(6 * a * this.PI) + 20 * Math.sin(2 * a * this.PI)) * 2 / 3;
    b += (20 * Math.sin(c * this.PI) + 40 * Math.sin(c / 3 * this.PI)) * 2 / 3;
    b += (160 * Math.sin(c / 12 * this.PI) + 320 * Math.sin(c * this.PI / 30)) * 2 / 3;
    return b
  },
  transformLon: function(a, c) {
    var b = 300 + a + 2 * c + 0.1 * a * a + 0.1 * a * c + 0.1 * Math.sqrt(Math.abs(a));
    b += (20 * Math.sin(6 * a * this.PI) + 20 * Math.sin(2 * a * this.PI)) * 2 / 3;
    b += (20 * Math.sin(a * this.PI) + 40 * Math.sin(a / 3 * this.PI)) * 2 / 3;
    b += (150 * Math.sin(a / 12 * this.PI) + 300 * Math.sin(a / 30 * this.PI)) * 2 / 3;
    return b
  }
};
