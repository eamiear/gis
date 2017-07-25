/**
 * Created by K on 2017/6/5.
 */
var baseUrl = document.location.href.substring(0,document.location.href.lastIndexOf("/"));
var selfUrl = baseUrl.substring(0,baseUrl.lastIndexOf("/"));
var url = [location.protocol,'//',location.host,'/'].join('');
dojoConfig = {
  parseOnLoad: true,
  measureTotal:0,
  modulePaths: {
    "extras": url +"static/assets/gis/extras"
  }
  /*packages: [
    // local pacakges to test
    {
      name:"extras",
      location: url +"static/assets/gis/extras"
    }
  ]*/
};

var gisConfig = {
  defaultCenter: {x: 12615151.657772028, y: 2645790.939302407},
  // 地图瓦片请求URL
  maptiledCacheUrl: 'http://127.0.0.1/map/',//'http://172.16.16.109:8088',
  // 地图图片资源路径
  mapImagesUrl: url + 'static/assets/gis/images',
  // 地图其他资源路径
  mapResourcesUrl: url + 'static/assets/gis/resources',
  // 地图类型（1 -- 谷歌地图， 2 -- 天地图）
  mapType: 1
};
