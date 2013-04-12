// "Compile" with http://chris.zarate.org/bookmarkleter
function enhanceMap(map) {
	var kmlUrl = 'https://maps.google.com/maps/ms?msa=0&output=kml&msid=217694540754022493585.0004d551e620a2b06ec95';
	var kmlLayer = new google.maps.KmlLayer({
		clickable: false,
		map: map,
		preserveViewport: true,
		suppressInfoWindows: true,
		url: kmlUrl,
	});
	window.map = map;
}

if (typeof espcGoogleMap == 'object') {
	// Properties Search Page Map View
	// e.g. http://www.espc.com/properties.aspx?view=map
	enhanceMap(espcGoogleMap);
}
else if (typeof drawMapDetails == 'function') {
	// Properties Details Page Map
	// e.g. http://www.espc.com/properties/details.aspx?pid=123456
	$('a[href=#map]').click();
	$('#gmap').height(800).width(800);
	setTimeout(function() {
		var mapId = 'gmap';
		var mapElement = document.getElementById(mapId);
		var attributes = $(mapElement).attr('title').split(', ');
		var latitude = parseFloat(attributes[0]);
		var longitude = parseFloat(attributes[1]);
		var title = attributes.slice(2).join(', ');
		map = drawMapDetails(mapElement, null, latitude, longitude, title);
		enhanceMap(map);
	}, 1000);
}
else {
	alert('No ESPC map found!');
}
