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

function createDistanceMatrixTable(destinations) {
	div = $('#matrixDiv');
	div.html('');

	table = $('<table/>').appendTo(div);

	headerRow = $('<tr/>').appendTo(table);
	$('<th/>').appendTo(headerRow);
	destinations.forEach(function(destination) {
		$('<th>' + destination + '</th>').appendTo(headerRow);
	});
	return table;
}

function getDistanceMatrixCallBack(type, table) {
	return function(response, status) {
		if (status != google.maps.DistanceMatrixStatus.OK)
			return false;

		tableRow = $('<tr/>').appendTo(table);
		$('<th>' + type + '</th>').appendTo(tableRow);

		response.rows[0].elements.forEach(function(element) {
			$('<td>' + element.distance.text + '<br>'
			         + element.duration.text + '</td>').appendTo(tableRow);
		});
	}
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
	$('#map, #gmap').height(800).width(800);
	$('#map').height(1000);
	$('#map').append('<div id="matrixDiv"/>');
	setTimeout(function() {
		var mapId = 'gmap';
		var mapElement = document.getElementById(mapId);
		var attributes = $(mapElement).attr('title').split(', ');
		var latitude = parseFloat(attributes[0]);
		var longitude = parseFloat(attributes[1]);
		var title = attributes.slice(2).join(', ');
		map = drawMapDetails(mapElement, null, latitude, longitude, title);
		enhanceMap(map);
		var houseLocation = new google.maps.LatLng(latitude, longitude);
		var distanceMatrixService = new google.maps.DistanceMatrixService();
		var destinations = [
			"St Paul's and St George's Church, Edinburgh",
			"Princes Street, Edinburgh",
			"Royal Infirmary of Edinburgh",
			"Tollcross Health Centre, Edinburgh"
		];

		var table = createDistanceMatrixTable(destinations);

		var distanceMatrixCarOptions = {
			origins: [houseLocation],
			destinations: destinations,
			unitSystem: google.maps.UnitSystem.IMPERIAL,
			travelMode: google.maps.TravelMode.DRIVING,
		};
		distanceMatrixService.getDistanceMatrix(distanceMatrixCarOptions, getDistanceMatrixCallBack('Car', table));

		var distanceMatrixBikeOptions = jQuery.extend({}, distanceMatrixCarOptions);
		distanceMatrixBikeOptions.travelMode = google.maps.TravelMode.BICYCLING;
		distanceMatrixService.getDistanceMatrix(distanceMatrixBikeOptions, getDistanceMatrixCallBack('Bike', table));
	}, 1000);
}
else {
	alert('No ESPC map found!');
}
