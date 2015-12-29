$( document ).ready(function() {
    console.log( "ready to execute the code" );
    var basemapNr = 2;
    var initLocation = {
    	lat: 52.3690427,
    	lng: 4.8960702,
    	zoomLevel: 13
    };
    map = initBaseMap(basemapNr,initLocation);
    var requestVariable = "Geluidbelasting_wegen";
    getValueFromWMS(initLocation.lat,initLocation.lng,requestVariable);

    var bench = new L.OverPassLayer({
		query: "node(BBOX)['amenity'='bench'];out;",
	});

	map.addLayer(bench);
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
	};
	$.ajax({url: url, success: function(result){
		console.log(result.split(";")[3]);
	}});
}