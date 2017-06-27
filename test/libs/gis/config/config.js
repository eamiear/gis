/**
 * Created by K on 2017/6/5.
 */
var baseUrl = document.location.href.substring(0,document.location.href.lastIndexOf("/"));
var selfUrl = baseUrl.substring(0,baseUrl.lastIndexOf("/"));
var url = [location.protocol,'//',location.host,'/'].join('');
djConfig = {
  parseOnLoad: true,
  measureTotal:0,
  modulePaths: {
    "extras": url +"libs/gis/extras"
  }
};

var gisConfig = {
  // 地图瓦片请求URL
  maptiledCacheUrl: 'http://172.16.16.109:8088',
  // 地图图片资源路径
  mapImagesUrl: url + 'static/assets/gis/images',
  // 地图其他资源路径
  mapResourcesUrl: url + 'static/assets/gis/resources',
  // 地图类型（1 -- 谷歌地图， 2 -- 天地图）
  mapType: 1
};
