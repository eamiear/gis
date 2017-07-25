/**
 * 地图工具类
 */
dojo.provide("extras.control.ToolBar");
dojo.require("esri.layers.GraphicsLayer");
dojo.require("esri.toolbars.navigation");
dojo.require("esri.toolbars.draw");
dojo.require("extras.tools.MeasureDrawTool");
dojo.require("esri.symbols.SimpleFillSymbol");
dojo.require("esri.symbols.SimpleLineSymbol");
dojo.require("esri.symbols.SimpleMarkerSymbol");
dojo.require("esri.symbols.PictureMarkerSymbol");
dojo.require("esri.symbols.Font");
dojo.require("esri.symbols.TextSymbol");


dojo.declare("extras.control.ToolBar",null,{
	gisObject:null,
	map:null,
	constructor:function(gisObject)
	{
		this.gisObject = gisObject;
		
		//发布mapLoadedEvent监听
        dojo.subscribe("mapLoadedEvent", this, "initToolbar");
	},
	initToolbar:function(map){
		this.map = map;
		try{
			this.navToolbar = new esri.toolbars.Navigation(this.map);
			this.drawToolbar = new esri.toolbars.Draw(this.map);
			this.measureToolbar = new extras.tools.MeasureDrawTool(this.map);
			
			this.drawLayer = new esri.layers.GraphicsLayer({id:"GXX_GIS_DRAW_LAYER"});
			this.trackLayer = new esri.layers.GraphicsLayer({id:"GXX_GIS_ALL_TRACK_LAYER"});
			this.tmpTrackLayer = new esri.layers.GraphicsLayer({id:"GXX_GIS_TEMP_TRACK_LAYER"});
			this.map.addLayer(this.drawLayer);
			this.map.addLayer(this.trackLayer);
			this.map.addLayer(this.tmpTrackLayer);
			this.pan();
		}catch(e){
			
		}
		
		dojo.publish("toolBarLoadedEvent", [this]);
	},
	 setMouseCursor: function(type){
        var cur = baseUrl + '/themes/cursor/pan.ani';
        switch (type.toString()) {
            case extras.control.ToolBar.PAN:
                cur = baseUrl + '/themes/cursor/pan.ani';
                break;
            case extras.control.ToolBar.ZOOMIN:
                cur = baseUrl + '/themes/cursor/zoomin.ani';
                break;
            case extras.control.ToolBar.ZOOMOUT:
                cur = baseUrl + '/themes/cursor/zoomout.ani';
                break;
            case extras.control.ToolBar.POLYGON:
                cur = baseUrl + '/themes/cursor/select_poly.ani';
                break;
            case extras.control.ToolBar.POLYLINE:
                cur = baseUrl + '/themes/cursor/select_polyline.ani';
                break;
            case extras.control.ToolBar.OVAL:
                cur = baseUrl + '/themes/cursor/select_polyline.ani';
                break;
            case extras.control.ToolBar.POINT:
                cur = baseUrl + '/themes/cursor/click.ani';
                break;
			case extras.control.ToolBar.IDENTIFY:
                cur = baseUrl + '/themes/cursor/Hand.cur';
                break;
            case extras.control.ToolBar.EXTENT:
                cur = baseUrl + '/themes/cursor/select_extent.ani';
                break;
            case extras.control.ToolBar.POSITION:
                cur = baseUrl + '/themes/cursor/SunPositionTool.ani';
                break;
        }
        //this.map.setMapCursor(cur);
        //dojo.byId(this.map.id).style.cursor = "url(" + cur + ")";
    },
    removeDrawGraphic:function(graphic){
    	if(graphic){
    		this.drawLayer.remove(graphic);
    	}
    },
    draw: function(type, symbol, handler, handler_before,idKey){
    	this.deactivateToolbar();
    	switch(type){
	    	case esri.toolbars.draw.POINT:
	    	case esri.toolbars.draw.MULTI_POINT:
	    		this.drawToolbar.setMarkerSymbol(symbol || extras.control.ToolBar.POINT);
	    		break;
	    	case esri.toolbars.draw.POLYLINE:
	    		this.drawToolbar.setLineSymbol(symbol || extras.control.ToolBar.POLYLINE);
	    		break;
	    	case esri.toolbars.draw.ARROW:
	    		this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
	    		break;
	    	case esri.toolbars.draw.POLYGON:
	    		this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
	    		break;
	    	case esri.toolbars.draw.CIRCLE:
	    		this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
	    		break;
	    	case esri.toolbars.draw.EXTENT:
	    		this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
	    		break;
	    	default: 
	    		this.drawToolbar.setFillSymbol(symbol || extras.control.ToolBar.POLYGON);
    			break;
    	}
    	var onDrawEndHandler = dojo.connect(this.drawToolbar, "onDrawEnd", dojo.hitch(this,function(geometry) {
    		this.drawToolbar.deactivate();
    		
    		var graphic = new esri.Graphic(geometry,symbol);
    		idKey && (graphic.id = idKey);
    		this.drawLayer.add(graphic);
    		
    		if(onDrawEndHandler){
    			dojo.disconnect(onDrawEndHandler);
    		}
    		if(handler){
    			handler(graphic);
    		}
    	}));
    	
    	this.drawToolbar.activate(type);
    },
    indraw: function(type, symbol, handler, handler_before,idKey){
    	type = type.toLowerCase().replace(/_/g, "");
    	
    	this.deactivateToolbar();
    	this.drawToolbar.activate(type);
    	
    	var renderSymbol = symbol;
    	switch(type){
	    	case "point":
	    	case "multipoint":
	    		renderSymbol = symbol || extras.control.ToolBar.POINT;
	    		this.drawToolbar.setMarkerSymbol(renderSymbol);
	    		break;
	    	case "polyline":
	    	case "freehandpolyline":
	    		renderSymbol = symbol || extras.control.ToolBar.POLYLINE;
	    		this.drawToolbar.setLineSymbol(renderSymbol);
	    		break;
	    	default: 
	    		renderSymbol = symbol || extras.control.ToolBar.POLYGON;
	    		this.drawToolbar.setFillSymbol(renderSymbol);
    			break;
    	}
    	
    	
    	var onDrawEndHandler = dojo.connect(this.drawToolbar, "onDrawEnd", dojo.hitch(this,function(geometry) {
    		this.drawToolbar.deactivate();
    		
    		var graphic = new esri.Graphic(geometry,renderSymbol);
    		idKey && (graphic.id = idKey);
    		this.drawLayer.add(graphic);
    		
    		if(onDrawEndHandler){
    			dojo.disconnect(onDrawEndHandler);
    		}
    		if(handler){
    			handler(graphic);
    		}
    	}));
    	
    	
    },
    deactivateToolbar:function(){
    	this.navToolbar.deactivate();
		this.drawToolbar.deactivate();
		this.measureToolbar.deactivate();
    },
    zoomIn:function(){
    	this.setMouseCursor(extras.control.ToolBar.ZOOMIN);
    	this.deactivateToolbar();
    	this.navToolbar.activate(esri.toolbars.Navigation.ZOOM_IN);
    },
    zoomOut:function(){
    	this.setMouseCursor(extras.control.ToolBar.ZOOMOUT);
    	this.deactivateToolbar();
    	this.navToolbar.activate(esri.toolbars.Navigation.ZOOM_OUT);
    },
	pan:function(){
		this.setMouseCursor(extras.control.ToolBar.ZOOMOUT);
    	this.deactivateToolbar();
    	this.navToolbar.activate(esri.toolbars.Navigation.PAN);
	},
	fullExtent:function(){
		this.navToolbar.zoomToFullExtent();
	},
	previous:function(){
		this.navToolbar.zoomToPrevExtent();
	},
	next:function(){
		this.navToolbar.zoomToNextExtent();
	},
	measureLength:function(){
		this.deactivateToolbar();
		this.measureToolbar.activate(esri.toolbars.draw.POLYLINE);
	},
	measureArea:function(){
		this.deactivateToolbar();
		this.measureToolbar.activate(esri.toolbars.draw.POLYGON);
	},
	clearDrawLayer: function(){
		this.drawLayer && this.drawLayer.clear();
	},
	clearTrackLayer: function(){
		this.trackLayer && this.trackLayer.clear();
	},
	clearTmptrackLayer: function(){
		this.tmpTrackLayer && this.tmpTrackLayer.clear();
	},
	clearMeasureLayer: function(){
		this.measureToolbar.clearAll();
	},
	clear:function(){
		 this.setMouseCursor(extras.control.ToolBar.PAN);
		 if( this.measureToolbar){
			 this.measureToolbar.clearAll();
		 }
		 if(this.map){
			 this.map.graphics.clear();
		 }
	     this.pan();
	},
	print:function(){
		
	},
	showMessageWidget:function(){
		
	},
	destroy:function(){
		this.clear();
		this.navToolbar = null;
		this.drawToolbar = null;
		this.measureToolbar = null;
		this.map = null;
		this.gisObject = null;
	},
	setCenter:function(x,y,zoom){
		this.map.centerAtZoom();
	},
	getCenter:function(){
		return this.map.center;
	},
	getExtent:function(){
		return this.map.extent;
	},
	getScale:function(){
		return this.map.getScale();
	},
	zoomToExtent:function(){
		
	},
	getLayerByName:function(layerName){
		
	},
	getLayerById:function(layerId){
		this.map.getLayer(layerId);
	},
	bindMapEvents:function(evtName,bindFunction){
		
	},
	showInfoWindow:function(geometry){
		this.gisObject.layerLocate.unHightlightOnMap();
		//this.gisObject.layerLocate.locateByGeometry(geometry,null,true,true);
		//this.pan();
	}
});


dojo.mixin(extras.control.ToolBar, {
    "PAN": "1",
    "ZOOMIN": "2",
    "ZOOMOUT": "3",
    "POLYGON": "4",
    "POLYLINE": "5",
    "POINT": "6",
    "EXTENT": "7",
	"IDENTIFY" : "8",
	"OVAL" : "9",
	"POSITION" : "10"
});
dojo.mixin(extras.control.ToolBar, {
    "POINT": new esri.symbols.SimpleMarkerSymbol({
	  "color": [255,255,255,64],
	  "size": 24,
	  "angle": -30,
	  "xoffset": 0,
	  "yoffset": 0,
	  "type": "esriSMS",
	  "style": "esriSMSCircle",
	  "outline": {
	    "color": [255,0,0,255],
	    "width": 3,
	    "type": "esriSLS",
	    "style": "esriSLSSolid"
	  }
	}),
    "POLYLINE": new esri.symbols.SimpleLineSymbol({
        type:"esriSLS",
        style:"esriSLSSolid",
        width:2,
        color:[255,0,0,255]
    }),
    "POLYGON": new esri.symbols.SimpleFillSymbol({
    	type:"esriSFS",
        style:"esriSFSSolid",
        color:[0,0,0,64],
        outline:{
        	type:"esriSLS",
        	style:"esriSLSSolid",
        	width:1.5,
        	color:[255,0,0,255]
        }
    })
});