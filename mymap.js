$( document ).ready(function() {
    console.log( "ready to execute the code" );
    var basemapNr = 2;
    var initLocation = {
    	lat: 51.9167,
    	lng: 4.5000,
    	zoomLevel: 13
    };
    map = initBaseMap(basemapNr,initLocation);
    var requestVariable = "Geluidbelasting_wegen";
    var requestVariable2 = "pot_fijnstof_invang"
    // getValueFromWMS(initLocation.lat,initLocation.lng,requestVariable);
    // getValueFromWMS(initLocation.lat,initLocation.lng,requestVariable2);
    
    var benchCluster = L.markerClusterGroup();

    getBenches(map.getBounds(), benchCluster);
	
	map.on('click', function(e) {
		// console.log(e);
		getValueFromWMS(e.latlng.lat,e.latlng.lng,"Geluidbelasting_wegen");
		getValueFromWMS(e.latlng.lat,e.latlng.lng,"pot_fijnstof_invang");
    });

	map.on('moveend', function() {
    	getBenches(map.getBounds(), benchCluster);
    });

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
function getValueFromWMS(lat,lng,requestVariable){
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
		$.ajax({url: url, success: function(result){
			value = result.split(";")[3];
			// console.log(value);
			if (parseFloat(value) > 55.0){
				var marker = L.marker([lat,lng],{icon:speakerIcon}).addTo(map).bindPopup("geluid van wegen: "+ parseInt(value)+"dB");
				// var marker = L.marker([lat,lng],{icon:speakerIcon});
				// clusterGroup.addLayer(marker);
				// map.addLayer(clusterGroup);
			}
			// var marker = L.marker([lat,lng]).addTo(map).bindPopup(value+"dB");
		}});
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
				console.log(value);
				if (value > 36){
					var marker = L.marker([lat,lng],{icon:leafIconLarge}).addTo(map);
				}else if (value > 0){
					var marker = L.marker([lat,lng],{icon:leafIconSmall}).addTo(map);
				}				
		}, error: function(errorThrown){
			console.log(errorThrown);
		}});
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
		$.each(geo_data.features, function(key, feature) {
			
			var benchIcon = new L.icon({
			iconUrl: 'icon/bench_single.png',
			iconSize: [50,35]
			});

			var marker = L.marker([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {icon: benchIcon});
			clusterGroup.addLayer(marker);
			// map.addLayer(clusterGroup);
		});
		map.addLayer(clusterGroup);
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
		// var marker = L.marker([feature._latlng.lat,feature._latlng.lng]).addTo(map);
		// console.log(feature._latlng);
		getValueFromWMS(cgLat,cgLng,"Geluidbelasting_wegen");
		getValueFromWMS(cgLat,cgLng,"pot_fijnstof_invang");
	});
}

var speakerIcon = new L.icon({
	iconUrl: 'icon/loudspeaker.png',
	iconSize: [20,20],
	iconAnchor:   [-10, 10] //positioning
});
var leafIconSmall = new L.icon({
	iconUrl: 'icon/leaf.png',
	iconSize: [25,10],
	iconAnchor:   [-10, 0] //positioning
});
var leafIconLarge = new L.icon({
	iconUrl: 'icon/leaf.png',
	iconSize: [40,20],
	iconAnchor:   [-10, 0] //positioning
});