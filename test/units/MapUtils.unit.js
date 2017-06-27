/**
 * Created by K on 2017/6/27.
 */
require(["extras/utils/MapUtil"], function (MapUtil) {
  var mapUtil = new MapUtil();

  describe("This is an exmaple suite", function() {
    it("contains spec with an expectation", function() {
      expect(true).toBe(true);
      expect(false).toBe(false);
      expect(false).not.toBe(true);
    });
  });

  describe("when invoke getImageBasicPath method", function() {
    it("return a basic path of image", function() {
      expect(mapUtil.getImageBasicPath()).toBe('http://127.0.0.1:4002/static/assets/gis/images/');
    });
  });

  describe("when invoke getImageAbsPath method", function() {
    it("return an absolute path of image when passed the name of the image", function() {
      expect(mapUtil.getImageAbsPath('icon.jpg')).toBe('http://127.0.0.1:4002/static/assets/gis/images/icon.jpg');
    });
    it("return an  absolute hierarchy path of image", function() {
      expect(mapUtil.getImageAbsPath('rr','bb','icon.jpg')).toBe('http://127.0.0.1:4002/static/assets/gis/images/rr/bb/icon.jpg');
    });
  });

});
