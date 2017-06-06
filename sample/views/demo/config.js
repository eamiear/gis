/**
 * 加载配置文件
 */

var baseUrl = document.location.href.substring(0,document.location.href.lastIndexOf("/"));
var selfUrl = baseUrl.substring(0,baseUrl.lastIndexOf("/"));
djConfig = {
    parseOnLoad: true,
    measureTotal:0,
    modulePaths: {
        "extras": selfUrl +"/static/assets/gis/extras"
    }
};

var gisConfig = {
    maptiledCacheUrl: 'http://172.16.16.109:8088',
    mapType: 1
}
