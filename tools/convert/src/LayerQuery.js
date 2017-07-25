/**
 * 地图查询类
 */



dojo.provide("extras.control.LayerQuery");
dojo.require("esri.graphic");
dojo.require("esri.layers.GraphicsLayer");
dojo.require("esri.geometry.Point");
dojo.require("esri.geometry.webMercatorUtils");
dojo.require("esri.toolbars.draw");
dojo.require("esri.symbols.PictureMarkerSymbol");
dojo.require("esri.dijit.PopupTemplate");


dojo.declare("extras.control.LayerQuery",null,{
  //dsdsf
	layerQueryLayer:null,
  coords: null,
  screenCoords: null,
  _frameIndex: 0,
  _framesAdvancing: true,
  _interval: null,
  templateString: "<div class='highlight'></div>",
	constructor:function(options,tag)
	{
		//发布toolBarLoadedEvent监听(用来获得MAP和Toolbar)
        dojo.subscribe("toolBarLoadedEvent", this, "initLayerQuery");

        //默认样式
        this.defaultSymbol = {
            "POINT": {
            	type:"esriSMS",
            	style:"esriSMSCircle",
                angle: 0,
                color:[255,0,0,255],
                outline:{
                	type:"esriSLS",
                	style:"esriSLSSolid",
                	width:1.5,
                	color:[255,255,255]
                },
                size:6.75,
                xoffset:0,
                yoffset:0,
            },
            "IMAGE": {
            	type:"esriPMS",
                angle: 0,
                width:32,
                height: 32,
                xoffset:0,
                yoffset:0,
                url: baseUrl + "/themes/default/images/tt.png"
            },
			"TEXT": {
				type:"esriTS",
                angle:0,
                color:[51,51,51,255],
                font:{
            		family:"微软雅黑",
            		size:9,
            		style:"normal",
            		variant:"normal",
            		weight:"normal"
                },
                horizontalAlignment:"center",
                kerning:true,
        		rotated:false,
        		text:"默认文本",
        		xoffset:0,
        		yoffset:0
            },
            "LINE": {
                type:"esriSLS",
                style:"esriSLSSolid",
                width:1.5,
                color:[255,0,0,255]
            },
            "POLYGON": {
            	type:"esriSFS",
                style:"esriSFSSolid",
                color:[0,0,0,64],
                outline:{
                	type:"esriSLS",
                	style:"esriSLSSolid",
                	width:1.5,
                	color:[255,0,0,255]
                }
            }
        };

        this.layerQueryLayer = new esri.layers.GraphicsLayer({id:"GXX_GIS_QUERYRESULT_LAYER"});
	},
	initLayerQuery : function(toolbar){
		this.toolbar = toolbar;
		this.map = this.toolbar.map;
		this.map.addLayer(this.layerQueryLayer);
	},
	startDraw:function(type,sybmol,callBackFun){
		this.layerQueryLayer.clear();
		this.map.reorderLayer(this.layerQueryLayer,this.map._layers.length -1);
		this.toolbar.draw(type,sybmol || this.defaultSymbol[type.toUpperCase()],dojo.hitch(this,function(graphic){
			if(graphic){
				callBackFun(graphic);
			}else{
				callBackFun(null);
			}
		}));
	},
	pullBoxSearch:function(){
		this.startDraw(esri.toolbars.draw.EXTENT, new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON),dojo.hitch(this,function(graphic){
			//this.map.graphics.add(graphic);
			this.layerQueryLayer.add(graphic);
		}));
	},
	polygonSearch:function(){
		this.startDraw(esri.toolbars.draw.POLYGON, new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON),dojo.hitch(this,function(graphic){
			this.layerQueryLayer.add(graphic);
		}));
	},
	/**
	 * 属性查询
	 * @param {Object} id	工程图层ID
	 * @param {Object} where	属性条件
	 * @param {Object} sussFunction		成功返回调用函数，以字符串格式返回数据
	 * @param {Object} errorFunction	失败返回调用函数,返回错误信息
	 */
	queryByAttribute : function(layerId,attrName,attrValue,isLike){
		var param = new SpatialQueryParam();
		param.layerId = layerId;
		param.attrName = attrName;
		param.attrValue = attrValue;
		param.isLike = isLike || true;
		return this.queryByLayerId(1,param)
	}
});

var SpatialQueryParam = function(){
	return {
		layerId : null,//工程图层ID
		geometry : null,//空间查询范围
		outFields : null,//返回字段
		where : null,//查询条件
		returnGeometry : true,//是否返回空间实体
		returnValues : true,//是否返回字段值信息
		returnAlias : true,//是否返回字段别名
		isReturnMis : true,//是否返回MIS关联信息,
		startRow : null,//分页起始记录数
		endRow : null,//分页终止记录数
		orderbyFields : null,
		groupbyFields : null,
		filtrateNum : 0,
		spatialRelationship : SpatialQueryParam.SPATIAL_REL_INTERSECTS//空间关系
	}
};

/*SpatialQueryParam.WFS_QUERY_TYPE_LIKE = "Like";
SpatialQueryParam.WFS_QUERY_TYPE_GREATERTHAN = "GreaterThan";
SpatialQueryParam.WFS_QUERY_TYPE_LESSTHANEQUALTO = "LessThanEqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_GREATERTHANEQUALTO = "GreaterThanEqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_EQUALTO = "EqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_NOTEQUALTO = "NotEqualTo";
SpatialQueryParam.WFS_QUERY_TYPE_BETWEEN = "Between";
SpatialQueryParam.WFS_QUERY_TYPE_NULLCHECK = "NullCheck";


SpatialQueryParam.SPATIAL_REL_CONTAINS = "ST_Contains";// 第二个几何完全被第一个几何包含
SpatialQueryParam.SPATIAL_REL_CROSSES = "ST_Crosses";// 两个几何相交 只适用于一部分实体判断
SpatialQueryParam.SPATIAL_REL_EQUALS = "ST_Equals";// 两个几何类型相同，并且坐标序列相同
SpatialQueryParam.SPATIAL_REL_INTERSECTS = "ST_Intersects";// 两个几何相交
SpatialQueryParam.SPATIAL_REL_OVERLAPS = "ST_Overlaps";// 比较的2个几何维数相同并且相交
SpatialQueryParam.SPATIAL_REL_TOUCHES = "ST_Touches";// 两个几何相交的部分都不在两个几何的内部(接触)
SpatialQueryParam.SPATIAL_REL_WITHIN = "ST_Within";// 第一个几何完全在第二个几何内部
SpatialQueryParam.SPATIAL_REL_DISJOINT = "ST_Disjoint";// 两个几何不相交*/
