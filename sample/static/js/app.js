
var map, markerSymbol, lineSymbol, fillSymbol;
// 初始化地图，底图使用openstreetmap在线地图
//streets,satellite,hybrid,terrain,topo,gray,dark-gray,oceans,national-geographic,osm,dark-gray-vector,gray-vector,streets-vector,topo-vector,streets-night-vector,streets-relief-vector,streets-navigation-vector
(function () {
    require(["esri/map",
            "esri/Color",
            "esri/symbols/SimpleMarkerSymbol",
            "esri/symbols/SimpleLineSymbol",
            "esri/symbols/SimpleFillSymbol",
            "dojo/domReady!"],
             function (Map, Color, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol) {
                 map = new Map("mapDiv", {
                     center: [113, 23],
                     zoom: 10,
                     logo: false,
                     slider: true,
                     sliderPosition: "bottom-left",
                     basemap: "national-geographic"
                 });

                 markerSymbol = new SimpleMarkerSymbol(SimpleMarkerSymbol.STYLE_SQUARE, 8, null, new Color("#FF0000"));
                 lineSymbol = new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color("#FF0000"), 2);
                 fillSymbol = new SimpleFillSymbol(SimpleFillSymbol.STYLE_SOLID, this.lineSymbol, new Color([255, 0, 0, 0.25]));

                 map.on("load", function () {
                     initEvents();
                 });
             });
})();
function initEvents() {
    require(["dojo"], function (dojo) {
        console.log(dojo.version.toString());
        var d = new dojo.Deferred();
        function delay(delay){
            setTimeout(function(){
                console.log('delaying...');
                d.resolve('hello')
            }, delay || 1000)
        }
        delay();
        d.then(function(v){
            console.log('deferred -- ',v)
        })
    });
}

function onDrawEnd(evt) {
    require(["esri/graphic",
        "esri/symbols/jsonUtils",
        "esri/geometry/Point",
        "esri/geometry/Polyline",
        "esri/geometry/Polygon"
    ],
     function (Graphic, jsonUtils, Point, Polyline, Polygon) {

     });
}

function onEditEnd(evt) {

}

function activate(type) {

}