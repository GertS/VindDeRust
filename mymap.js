$( document ).ready(function() {
    console.log( "ready to execute the code" );
    var timeoutHandler;
    var basemapNr = 2;
    var initLocation = {
    	lat: 52.078660,
    	lng: 4.292499,
    	zoomLevel: 14, 

    };
    map = initBaseMap(basemapNr,initLocation);
    var requestVariable = "Geluidbelasting_wegen";
    var requestVariable2 = "pot_fijnstof_invang"
    
    var benchCluster = L.markerClusterGroup();

    getBenches(map.getBounds(), benchCluster);
	
	map.on('click', function(e) {
		getValueFromWMS(e.latlng.lat,e.latlng.lng,"Geluidbelasting_wegen",true);
		getValueFromWMS(e.latlng.lat,e.latlng.lng,"pot_fijnstof_invang",true);
    });


	// Functions for timout between start draging and zooming and starting of ajax request.
    function mapMoveHandler() {
		// cancel any timeout currently running
		window.clearTimeout(timeoutHandler);
		// create new timeout to fire sesarch function after 750ms
		timeoutHandler = window.setTimeout(function() {
			getBenches(map.getBounds(), benchCluster);
		}, 750);
	}
	function mapDragHandler() {
		// cancel any timeout currently running
		window.clearTimeout(timeoutHandler);
	}

	map.on('moveend', mapMoveHandler);
	map.on('drag', mapDragHandler);
});


function listAvailableBasemaps(){
	/**
	* lists the basemaps which can be used
	*/
	// free basemap providers: http://leaflet-extras.github.io/leaflet-providers/preview/index.html
	var Thunderforest_TransportDark = L.tileLayer('http://{s}.tile.thunderforest.com/transport-dark/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		maxZoom: 19
	});
	var Thunderforest_Landscape = L.tileLayer('http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.opencyclemap.org">OpenCycleMap</a>, &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});
	var Hydda_Full = L.tileLayer('http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png', {
		attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
	});
	var Stamen_Toner = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner/{z}/{x}/{y}.{ext}', {
		attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png'
	});
	var CartoDB_DarkMatter = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
		attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
		subdomains: 'abcd',
		maxZoom: 19
	});

	var basemaps = [Thunderforest_TransportDark,Thunderforest_Landscape,Hydda_Full,Stamen_Toner,CartoDB_DarkMatter];	
	return basemaps;
}
function initBaseMap(basemapNr,initLocation){
	/**
	* Loads the basemap and shows it on the screen.
	* The basemapNR is the basemap fetched from listAvailableBasemaps()
	*/
	var basemap = listAvailableBasemaps()[basemapNr];
	var map = L.map('map').setView([initLocation.lat,initLocation.lng],initLocation.zoomLevel);
	basemap.addTo(map);
	return map;
}
function getValueFromWMS(lat,lng,requestVariable,byClicking){
	/**
	* Does an AJAX request to get the value of a certain location
	* defined in latitude and longitude (EPSG:4326)
	* the paramater to be requested is in requestVariable
	*/
	bbox = {
		bottomLat: 	lat-0.001,
		topLat: 	lat+0.001,
		leftLng: 	lng-0.001,
		rightLng: 	lng+0.001
	}
	if (requestVariable == "Geluidbelasting_wegen"){
		var url = "http://geoservice.pbl.nl/arcgis/services/projecten/Geluidbelasting_wegen_2008_Atlas_Leefomgeving/MapServer/WmsServer?\
		SERVICE=WMS&\
		VERSION=1.3.0&\
		REQUEST=GetFeatureInfo&\
		BBOX="+bbox.bottomLat+","+bbox.leftLng+","+bbox.topLat+","+bbox.rightLng+"&\
		CRS=EPSG:4326&\
		WIDTH=300&\
		HEIGHT=800&\
		LAYERS=0&\
		STYLES=default&\
		FORMAT=image/jpeg&\
		QUERY_LAYERS=0&\
		INFO_FORMAT=text/plain\
		&I=150\
		&J=400\
		&FEATURE_COUNT=10";
		$.ajax({url: url, 
			success: function(result){
				value = result.split(";")[3];
				addMarker("roadNoise",value,lat,lng,byClicking);
			}, error: function(errorThrown){
				console.log(errorThrown,"noise dB",lat,lng);
			}, timeout: 5000 // sets timeout to 5 seconds
		});
	}else if (requestVariable == "pot_fijnstof_invang"){ //Cross origin problem
		var url = "https://crossorigin.me/http://geodata.rivm.nl/geoserver/dank/wms?\
		SERVICE=WMS&\
		VERSION=1.3.0&\
		REQUEST=GetFeatureInfo&\
		BBOX="+bbox.bottomLat+","+bbox.leftLng+","+bbox.topLat+","+bbox.rightLng+"&\
		CRS=EPSG:4326&\
		WIDTH=300&\
		HEIGHT=800&\
		LAYERS=altr_a15_gv_lzuifijnstof&\
		STYLES=altr_a15_20141120_gv_lzuifijnstof&\
		FORMAT=image/jpeg&\
		QUERY_LAYERS=altr_a15_gv_lzuifijnstof&\
		INFO_FORMAT=application/json\
		&i=150\
		&j=400\
		&FEATURE_COUNT=1";
		$.ajax({url: url,
			success: function(result){
				value = parseFloat(result.features[0].properties.GRAY_INDEX);
				addMarker("fijnstofGroen",value,lat,lng,byClicking);			
		}, error: function(errorThrown){
			console.log(errorThrown,"fijnstof",lat,lng);
		}, timeout: 5000 // sets timeout to 5 seconds
	});
	}
}

function getBenches(bbox, clusterGroup) {
	/**
	* AJAX request to get bench features from OSM Overpass
	* Conversion from OSM Json to GeoJson
	* Clustering of benches
	* Requires boundingbox from view and a layerGroup
	**/
	$.ajax({
    	url: 'http://overpass.osm.rambler.ru/cgi/interpreter?data=[out:json];node[amenity=bench](' + bbox.getSouthWest().lat + ',' + bbox.getSouthWest().lng + ',' + bbox.getNorthEast().lat + ',' + bbox.getNorthEast().lng + ');out;',
    	dataType: 'json',
    	type: 'GET',
    	async: true,
    	crossDomain: true
		
	}).done(function(data) {
		var geo_data = osmtogeojson(data);
		clusterGroup.clearLayers();
		$('.leaflet-marker-pane').find('img').each(function(i) { 
			if($(this).attr("alt") == "notclicked"){$(this).remove()}; //Delete all the markers that are not created by clicking in a 'houtje-touwtje' way
		});
		$.each(geo_data.features, function(key, feature) {
			
			var benchIcon = new L.icon({
			iconUrl: 'icon/bench_single.png',
			iconSize: [50,35]
			});

			var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {opacity: 0.0});
			clusterGroup.addLayer(marker);
		});
		// map.addLayer(clusterGroup,{opacity:0.6});
		/////////////////////
		//Get markerclusters:
		/////////////////////
		clusterGroup._map = map;
		var i, l, layer;
		if (!isFinite(clusterGroup._map.getMaxZoom())) {
			throw "Map has no maxZoom specified";
		}
		if (!clusterGroup._gridClusters) {
			clusterGroup._generateInitialClusters();
		}
				for (i = 0, l = clusterGroup._needsRemoving.length; i < l; i++) {
			layer = clusterGroup._needsRemoving[i];
			clusterGroup._removeLayer(layer, true);
		}
		clusterGroup._needsRemoving = [];
		clusterGroup._zoom = clusterGroup._map.getZoom();
		clusterGroup._currentShownBounds = clusterGroup._getExpandedVisibleBounds();
		clusterGroup._bindEvents();
		l = clusterGroup._needsClustering;
		clusterGroup._needsClustering = [];
		clusterGroup.addLayers(l);


		getParamFromClusters(clusterGroup);
		
	})
	.fail(function(error) {
    	console.log(error);
    	console.log( "error" );
    });
}

function getParamFromClusters(clusterGroup) {
	/**
	* AJAX request to get road noise and greenness of the center of the cluster groups
	**/
	cg = clusterGroup._featureGroup.getLayers();
	$.each(cg, function(key,feature) {
		cgLat = feature._latlng.lat;
		cgLng = feature._latlng.lng;
		cgCount=feature._childCount; //Benches per cluster
		addMarker("bench",cgCount,cgLat,cgLng,false);
		getValueFromWMS(cgLat,cgLng,"Geluidbelasting_wegen",false);
		getValueFromWMS(cgLat,cgLng,"pot_fijnstof_invang",false);
	});
}

function addMarker(variable,value,lat,lng,byClicking){
	if (variable == "bench"){
		iconName = 'zitten';
		// iconName = 'bankje';
		if(value < 1 || typeof value === 'undefined'){
			iconName += 'S';
		}else if(value < 15){
			iconName += 'M';
		}else{
			iconName += 'L';
		}
	}
	if (variable == "roadNoise"){
		iconName = 'stilte';
		if(value > 55 ){
			iconName += 'S';
		}else if(value > 40){
			iconName += 'M';
		}else{
			iconName += 'L';
		}
	}
	if (variable == "fijnstofGroen"){
		iconName = 'groen';
		if(value < 0 ){
			iconName += 'S';
		}else if(value < 38){
			iconName += 'M';
		}else{
			iconName += 'L';
		}
	}
	// console.log(iconName, value);
	if (byClicking){
		L.marker([lat,lng],{icon:window[iconName],alt:"clicked"}).addTo(map);
	}else{
		L.marker([lat,lng],{icon:window[iconName],alt:"notclicked"}).addTo(map);
	}
}

//Icon variables:
var smallPixels = 50;
var mediumPixels= 100;
var largePixels = 150;

var zittenPosX = 0.7;
var zittenPosY = 0.5;
var bankjePosX = zittenPosX;
var bankjePosY = zittenPosY;
var groenPosX = 0.4;
var groenPosY = 0.8;
var stiltePosX = 0.2;
var stiltePosY = 0.2;

//Icons:
//Zitten:
var zittenS = new L.icon({ //zitten small
	iconUrl: 'icon/zitten.png',
	iconSize: [smallPixels,smallPixels],
	iconAnchor:   [zittenPosX*smallPixels, zittenPosY*smallPixels] //positioning
});
var zittenM = new L.icon({ //zitten medium
	iconUrl: 'icon/zitten.png',
	iconSize: [mediumPixels,mediumPixels],
	iconAnchor:   [zittenPosX*mediumPixels, zittenPosY*mediumPixels] //positioning
});
var zittenL = new L.icon({ //zitten large
	iconUrl: 'icon/zitten.png',
	iconSize: [largePixels,largePixels],
	iconAnchor:   [zittenPosX*largePixels, zittenPosY*largePixels] //positioning
});
//Bankje:
var bankjeS = new L.icon({ //bankje small
	iconUrl: 'icon/bankje.png',
	iconSize: [smallPixels,smallPixels],
	iconAnchor:   [bankjePosX*smallPixels, bankjePosY*smallPixels] //positioning
});
var bankjeM = new L.icon({ //bankje medium
	iconUrl: 'icon/bankje.png',
	iconSize: [mediumPixels,mediumPixels],
	iconAnchor:   [bankjePosX*mediumPixels, bankjePosY*mediumPixels] //positioning
});
var bankjeL = new L.icon({ //bankje large
	iconUrl: 'icon/bankje.png',
	iconSize: [largePixels,largePixels],
	iconAnchor:   [bankjePosX*largePixels, bankjePosY*largePixels] //positioning
});
//Groen:
var groenS = new L.icon({ //groen small
	iconUrl: 'icon/groen.png',
	iconSize: [smallPixels,smallPixels],
	iconAnchor:   [groenPosX*smallPixels, groenPosY*smallPixels] //positioning
});
var groenM = new L.icon({ //groen medium
	iconUrl: 'icon/groen.png',
	iconSize: [mediumPixels,mediumPixels],
	iconAnchor:   [groenPosX*mediumPixels, groenPosY*mediumPixels] //positioning
});
var groenL = new L.icon({ //groen large
	iconUrl: 'icon/groen.png',
	iconSize: [largePixels,largePixels],
	iconAnchor:   [groenPosX*largePixels, groenPosY*largePixels] //positioning
});
//Stilte:
var stilteS = new L.icon({ //stilte small
	iconUrl: 'icon/stilte.png',
	iconSize: [smallPixels,smallPixels],
	iconAnchor:   [stiltePosX*smallPixels, stiltePosY*smallPixels] //positioning
});
var stilteM = new L.icon({ //stilte medium
	iconUrl: 'icon/stilte.png',
	iconSize: [mediumPixels,mediumPixels],
	iconAnchor:   [stiltePosX*mediumPixels, stiltePosY*mediumPixels] //positioning
});
var stilteL = new L.icon({ //stilte large
	iconUrl: 'icon/stilte.png',
	iconSize: [largePixels,largePixels],
	iconAnchor:   [stiltePosX*largePixels, stiltePosY*largePixels] //positioning
});

// spinner stuff:
$body = $("body");

$(document).on({
    ajaxStart: function() { $body.addClass("loading");    },
    ajaxStop: function() { $body.removeClass("loading"); }    
});
