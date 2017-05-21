define(["dojo/_base/declare","dojo/_base/Deferred","esri/graphic","esri/layers/GraphicsLayer","esri/geometry/Point","esri/symbols/PictureMarkerSymbol","esri/symbols/SimpleLineSymbol","esri/symbols/SimpleFillSymbol","esri/geometry/webMercatorUtils"],function(e,t,r,i,a,o,s,l,n){return e([],{layerQueryLayer:null,defaultSymbol:{POINT:{type:"esriSMS",style:"esriSMSCircle",angle:0,color:[255,0,0,255],outline:{type:"esriSLS",style:"esriSLSSolid",width:1.5,color:[255,255,255]},size:6.75,xoffset:0,yoffset:0},IMAGE:{type:"esriPMS",angle:0,width:32,height:32,xoffset:0,yoffset:0,url:this.getRootPath()+"/themes/default/images/tt.png"},TEXT:{type:"esriTS",angle:0,color:[51,51,51,255],font:{family:"微软雅黑",size:9,style:"normal",variant:"normal",weight:"normal"},horizontalAlignment:"center",kerning:!0,rotated:!1,text:"默认文本",xoffset:0,yoffset:0},LINE:{type:"esriSLS",style:"esriSLSSolid",width:1.5,color:[255,0,0,255]},POLYLINE:{type:"esriSLS",style:"esriSLSSolid",width:1.5,color:[255,0,0,255]},POLYGON:{type:"esriSFS",style:"esriSFSSolid",color:[0,0,0,64],outline:{type:"esriSLS",style:"esriSLSSolid",width:1.5,color:[255,0,0,255]}}},constructor:function(){dojo.subscribe("toolBarLoadedEvent",this,"initLayerQuery"),this.mapCommonUtils=new extras.utils.MapCommonUtils,this.layerQueryLayer=new extras.graphic.InfoGraphicLayer({id:"GXX_GIS_QUERYRESULT_LAYER"})},initLayerQuery:function(e){this.toolbar=e,this.map=this.toolbar.map,this.map.addLayer(this.layerQueryLayer)},startDraw:function(e,r,i){var a=new t;return!i&&this.layerQueryLayer.clear(),this.map.reorderLayer(this.layerQueryLayer,this.map._layers.length-1),this.toolbar.draw(e,r||this.defaultSymbol[e.toUpperCase()],dojo.hitch(this,function(e){a.resolve(e)})),a.promise},basicSearch:function(e,t,r,i){var a;switch(t=t||{},e){case"point":case"multipoint":break;case"polyline":case"freehandpolyline":a=new s(dojo.mixin({},this.defaultSymbol.LINE,t));break;default:a=new l(dojo.mixin({},this.defaultSymbol.POLYGON,t))}return this.startDraw(e,a,r).then(function(e){i&&i(e)})},domainSearch:function(e){return e=e||{},this.basicSearch(e.type||esri.toolbars.draw.POLYGON,e.symbol,e.isNotClearLayer||!0).then(dojo.hitch(this,function(t){dojo.mixin(t.attributes,e.attributes,{type:"search"}),this.toolbar.drawLayer.clear(),this.layerQueryLayer.add(t),dojo.publish(e.subscribeHook||"domain-search",[t])}))},pullBoxSearch:function(){return this.domainSearch({type:esri.toolbars.draw.EXTENT,symbol:l(this.defaultSymbol.POLYGON),subscribeHook:"pullBoxSearchFinish"})},polygonSearch:function(){return this.domainSearch({type:esri.toolbars.draw.POLYGON,symbol:l(this.defaultSymbol.POLYGON),subscribeHook:"polygonSearchFinish"})},lineSearch:function(){return this.domainSearch({type:esri.toolbars.draw.FREEHAND_POLYLINE,symbol:s(this.defaultSymbol.LINE),subscribeHook:"lineSearchFinish"})},circleSearch:function(){return this.domainSearch({type:esri.toolbars.draw.CIRCLE,symbol:l(this.defaultSymbol.POLYGON),subscribeHook:"circleSearchFinish"})},queryByAttribute:function(e,t,r,i){var a=new SpatialQueryParam;return a.layerId=e,a.attrName=t,a.attrValue=r,a.isLike=i||!0,this.queryByLayerId(1,a)},queryByGeometry:function(e,t){var r=new SpatialQueryParam;return r.layerId=e,r.geometry=t,this.queryByLayerId(2,r)},queryByAttrAndGeo:function(e,t,r,i,a){var o=new SpatialQueryParam;return o.layerId=e,o.geometry=t,o.attrName=r,o.attrValue=i,this.queryByLayerId(3,o)},queryByLayerId:function(e,t){var r=t.layerId,i=t.attrName,a=t.attrValue,o=t.geometry||null,s=t.isLike||!0,l=this.map.getLayer(r),n=null;return l&&(1==e?n=this.getGraphicByAttribute(l,i,a,s):2==e?n=this.getGraphicByGeometry(l,o):3==e&&(n=this.getGraphicByAttributeAndGeometry(l,o,i,a,s))),n},getGraphicBy:function(e,t,r){var i=null;if(e){"string"==typeof e&&(e=this.map.getLayer(e));var a=e.graphics;if(!a||!a.length)return null;for(var o=0,s=a.length;o<s;++o){var l=a[o];if(void 0==l[t]&&l.attributes.clusterCount){for(var n=0;n<l.attributes.clusterCount;n++)if(l.attributes.data[n][t]==r){var u=l.attributes.data[n];u.layerId=l.getLayer()._id,u.rawNode=l.getShape().rawNode,u.spatialReference=l.geometry&&l.geometry.spatialReference,i=this.mapCommonUtils.buildClusterGraphic(u);break}}else if(a[o][t]==r){i=a[o];break}}}return i},getGraphicById:function(e,t){return this.getGraphicBy(e,"id",t)},getAllGraphic:function(e){return"string"==typeof e&&(e=this.map.getLayer(e)),e.graphics},getGraphicByAttributeAndGeometry:function(e,t,r,i,a){var o=null,s=this.getGraphicByAttribute(e,r,i,a);return s&&s.lenght>0&&(o=[],dojo.forEach(s,function(e,r){t.contains(e.geometry)&&o.push(e)})),o},getGraphicByGeometry:function(e,t){var r=null;if(e&&t){r=[];for(var i=this.getAllGraphic(e),a=0,o=i.length;a<o;a++){var s=i[a];t.contains(s.geometry)&&r.push(s)}}return r},getGraphicByAttribute:function(e,t,r,i){var a=null;if(e){var o=null;a=[];var s=e.graphics;if(!s||!s.length)return null;for(var l=0,n=s.length;l<n;l++)if((o=s[l])&&o.attributes)if(o.attributes.clusterCount)for(var u=0;u<o.attributes.clusterCount;u++){var y=o.attributes.data[u];y.layerId=o.getLayer()._id,y.spatialReference=o.geometry&&o.geometry.spatialReference,i||y[t]!=value?-1!=y[t].indexOf(r)&&(y=this.mapCommonUtils.buildClusterGraphic(y),a.push(y)):(y=this.mapCommonUtils.buildClusterGraphic(y),a.push(y))}else i||o.attributes[t]!=r?-1!=o.attributes[t].indexOf(r)&&a.push(o):a.push(o)}return a},getRootPath:function(){return[location.protocol,"//",location.host,"/",location.pathname.split("/")[1]].join("")},clear:function(){this.layerQueryLayer&&this.layerQueryLayer.clear()}})});