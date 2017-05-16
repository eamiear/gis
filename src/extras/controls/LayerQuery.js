/**
 * @module extras/controls/LayerQuery
 */
define([
	"dojo/_base/declare",
    "dojo/_base/Deferred",
	"esri/graphic",
	"esri/layers/GraphicsLayer",
	"esri/geometry/Point",
	"esri/symbols/PictureMarkerSymbol",
	"esri/geometry/webMercatorUtils"
], function(
	declare,
    Deferred,
	Graphic,
	GraphicsLayer,
	Point,
	PictureMarkerSymbol,
	webMercatorUtils
) {
	/**
	 * @description LayerQuery
	 * @class
	 * @namespace extras.controls.LayerQuery
	 * @name LayerQuery
	 * @constructor
	 */
	return declare("extras.controls.LayerQuery",null,{
		layerQueryLayer:null,
        //默认样式
        defaultSymbol: {
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
                yoffset:0
            },
            "IMAGE": {
                type:"esriPMS",
                angle: 0,
                width:32,
                height: 32,
                xoffset:0,
                yoffset:0,
                url: this.getRootPath() + "/themes/default/images/tt.png"
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
            "POLYLINE": {
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
        },
		constructor:function(){
			//发布toolBarLoadedEvent监听(用来获得MAP和Toolbar)
			dojo.subscribe("toolBarLoadedEvent", this, "initLayerQuery");

			this.mapCommonUtils = new extras.utils.MapCommonUtils();
			this.layerQueryLayer = new extras.graphic.InfoGraphicLayer({id:"GXX_GIS_QUERYRESULT_LAYER"});
		},
		/**
		 * @private
		 */
		initLayerQuery : function(toolbar){
			this.toolbar = toolbar;
			this.map = this.toolbar.map;
			this.map.addLayer(this.layerQueryLayer);
		},
		/**
		 * @method
		 * @name startDraw
		 * @memberof LayerQuery
		 * @description startDraw
		 * @param {string} type
		 * @param {object} sybmol
		 * @param {boolean} isNotClearLayer 是否不清空图层(默认 false - 清空)
		 *
		 * @example <caption>Usage of startDraw</caption>
		 *  startDraw(type,sybmol,isNotClearLayer);
		 */
		startDraw: function(type,sybmol,isNotClearLayer){
            var deferred = new Deferred();
			!isNotClearLayer && this.layerQueryLayer.clear();
			this.map.reorderLayer(this.layerQueryLayer,this.map._layers.length -1);
			this.toolbar.draw(type,sybmol || this.defaultSymbol[type.toUpperCase()],dojo.hitch(this,function(graphic){
                deferred.resolve(graphic);
			}));
            return deferred.promise;
		},
		basicSearch: function(type,symbol,isNotClearLayer,callback){
			var renderSymbol;
			symbol = symbol || {};
			switch(type){
				case "point":
				case "multipoint":
					//dojo.mixin({}, this.defaultSymbol.POINT,symbol);
					break;
				case "polyline":
				case "freehandpolyline":
					renderSymbol = new esri.symbols.SimpleLineSymbol(dojo.mixin({}, this.defaultSymbol.LINE,symbol));
					break;
				default:
					renderSymbol = new esri.symbols.SimpleFillSymbol(dojo.mixin({}, this.defaultSymbol.POLYGON,symbol));
					break;
			}
            return this.startDraw(type, renderSymbol,isNotClearLayer).then(function (graphic) {
                callback && callback(graphic);
            });
		},
        /**
         *
         * @param {string} options.type					图形类型（'polygon,polyline,extent,circle...'）
         * @param {object} options.symbol				图元样式
         * @param {boolean} options.isNotClearLayer	    是否不清除图层  （默认不清除）
         * @param {object} options.attributes			图元属性
         * @param {string} options.subscribeHook		发布订阅监听钩子
         * @example <caption>Usage of </caption>
         * var options = {
         *   type: 'polygon',
         *   subscribeHook: 'pullCircleFinish'
         * }
         * GisObject.layerQuery.domainSearch(options);
         */
        domainSearch: function(options){
            options = options || {};
            return this.basicSearch(options.type || esri.toolbars.draw.POLYGON,options.symbol,options.isNotClearLayer || true).then(dojo.hitch(this,function(graphic){
                dojo.mixin(graphic.attributes, options.attributes,{type: 'search'});
                this.toolbar.drawLayer.clear();
                this.layerQueryLayer.add(graphic);
                dojo.publish(options.subscribeHook || 'domain-search',[graphic]);
            }));
        },
		pullBoxSearch:function(){
            return this.domainSearch({
                type: esri.toolbars.draw.EXTENT,
                symbol: new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON),
                subscribeHook: 'pullBoxSearchFinish'
            });
		},
		polygonSearch:function(){
            return this.domainSearch({
                type: esri.toolbars.draw.POLYGON,
                symbol: new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON),
                subscribeHook: 'polygonSearchFinish'
            });
		},
		lineSearch:function(){
            return this.domainSearch({
                type: esri.toolbars.draw.FREEHAND_POLYLINE,
                symbol: new esri.symbols.SimpleLineSymbol(this.defaultSymbol.LINE),
                subscribeHook: 'lineSearchFinish'
            });
		},
		circleSearch:function(){
            return this.domainSearch({
                type: esri.toolbars.draw.CIRCLE,
                symbol: new esri.symbols.SimpleFillSymbol(this.defaultSymbol.POLYGON),
                subscribeHook: 'circleSearchFinish'
            });
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
		},
		/**
		 * 空间查询
		 * @param {Object} id
		 * @param {Object} geometry
		 * @param {Object} sussFunction
		 * @param {Object} errorFunction
		 */
		queryByGeometry : function(layerId,geometry){
			var param = new SpatialQueryParam();
			param.layerId = layerId;
			param.geometry = geometry;
			return this.queryByLayerId(2,param)
		},
		/**
		 * 综合查询
		 * @param {Object} params
		 * @param {Object} sussFunction
		 * @param {Object} errorFunction
		 */
		queryByAttrAndGeo : function(layerId,geometry,attrName,attrValue,isLike){
			var param = new SpatialQueryParam();
			param.layerId = layerId;
			param.geometry = geometry;
			param.attrName = attrName;
			param.attrValue = attrValue;
			return this.queryByLayerId(3,param)
		},
		queryByLayerId:function(type,param){
			var layerId = param.layerId;
			var attrName = param.attrName;
			var attrValue = param.attrValue;
			var geometry = param.geometry || null;
			var isLike = param.isLike || true; //默认是模糊查询
			var layer = this.map.getLayer(layerId);
			var resultData = null;
			if(layer){
				if(type == 1){ // 属性是查询
					resultData = this.getGraphicByAttribute(layer,attrName,attrValue,isLike);
				}else if(type == 2){ //空间查询
					resultData = this.getGraphicByGeometry(layer,geometry);
				}else if(type == 3){ //属性空间联合查询
					resultData = this.getGraphicByAttributeAndGeometry(layer,geometry,attrName,attrValue,isLike);
				}
			}
			return resultData;
		},
		getGraphicBy: function(layer,property, value) {
			var feature = null;
			if(layer){
				if(typeof layer === "string"){
					layer = this.map.getLayer(layer);
				}
				var graphics = layer.graphics;
				if(!graphics || !graphics.length) return null;

				for(var i=0, len= graphics.length; i<len; ++i) {
					var graphic = graphics[i];
					// Handle For Cluster Graphic
					if(graphic[property] == undefined && graphic['attributes']['clusterCount']){
						for(var k = 0; k < graphic.attributes.clusterCount; k++){
							if(graphic.attributes.data[k][property] == value){
								//feature = graphics[i];
								// Add At 2017/04/25 处理智能追踪时，设备聚合情况下，获取不了图元得问题
								var tgraphic = graphic.attributes.data[k];
								tgraphic.layerId = graphic.getLayer()._id;
								tgraphic.rawNode = graphic.getShape().rawNode;
								tgraphic.spatialReference = graphic.geometry && graphic.geometry.spatialReference;
								feature = this.mapCommonUtils.buildClusterGraphic(tgraphic);
								break;
							}
						}
					}else if(graphics[i][property] == value) {
						feature = graphics[i];
						break;
					}
				}
			}
			return feature;
		},
		getGraphicById: function(layer,idKey) {
			return this.getGraphicBy(layer,'id', idKey);
		},
		getAllGraphic:function(layer){
			if(typeof layer === "string"){
				layer = this.map.getLayer(layer);
			}
			return layer.graphics;
		},
		getGraphicByAttributeAndGeometry:function(layer,geometry,attrName,attrValue,isLike){
			var foundGraphics = null;
			var resultData = this.getGraphicByAttribute(layer,attrName,attrValue,isLike);
			if(resultData && resultData.lenght > 0){
				foundGraphics = [];
				dojo.forEach(resultData,function(graphic, index){
					if(geometry.contains(graphic.geometry)){
						foundGraphics.push(graphic);
					}
				});
			}
			return foundGraphics;
		},
		getGraphicByGeometry:function(layer,geometry){
			var foundGraphics = null;
			if(layer && geometry){
				foundGraphics = [];
				var allGraphic = this.getAllGraphic(layer);
				for(var i = 0,len = allGraphic.length; i < len; i++) {
					var g = allGraphic[i];
					if(geometry.contains(g.geometry)){
						foundGraphics.push(g);
					}
				}
			}
			return foundGraphics;
		},
		getGraphicByAttribute: function(layer,attrName, attrValue,isLike) {
			var foundGraphics = null;
			if(layer){
				var feature = null;
				foundGraphics = [];
				var graphics = layer.graphics;
				if(!graphics || !graphics.length) return null;

				for(var i = 0,len = graphics.length; i < len; i++) {
					feature = graphics[i];

					if(feature && feature.attributes) {
						if(feature['attributes']['clusterCount']){
							for(var k = 0; k < feature.attributes.clusterCount; k++){
								var graphic = feature.attributes.data[k];
								graphic.layerId = feature.getLayer()._id;
								graphic.spatialReference = feature.geometry && feature.geometry.spatialReference;

								if(!isLike && (graphic[attrName] == value)){
									graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
									foundGraphics.push(graphic);
								}else if(graphic[attrName].indexOf(attrValue) != -1){
									graphic = this.mapCommonUtils.buildClusterGraphic(graphic);
									foundGraphics.push(graphic);
								}
							}
						}else if(!isLike && (feature.attributes[attrName] == attrValue)){
							foundGraphics.push(feature);
						}else if(feature.attributes[attrName].indexOf(attrValue) != -1) {
							foundGraphics.push(feature);
						}
					}
					/*if(feature && feature.attributes) {
					 if(!isLike){
					 if (feature.attributes[attrName] == attrValue) {
					 foundGraphics.push(feature);
					 }
					 }else{
					 if (feature.attributes[attrName].indexOf(attrValue) != -1){
					 foundGraphics.push(feature);
					 }
					 }
					 }*/
				}
			}
			return foundGraphics;
		},
		getRootPath: function(){
			return [location.protocol,"//",location.host,"/",location.pathname.split('/')[1]].join('');
		},
		clear: function(){
			this.layerQueryLayer && this.layerQueryLayer.clear();
		}
	})
});