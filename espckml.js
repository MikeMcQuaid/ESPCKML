// "Compile" with http://chris.zarate.org/bookmarkleter
var rowCount = 0;

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
	rowCount = 0;

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

		if (rowCount == 0) {
			rowCount++;
			tableRow = $('<tr/>').appendTo(table);
			$('<th>' + 'Distance' + '</th>').appendTo(tableRow);

			response.rows[0].elements.forEach(function(element) {
				$('<td>' + element.distance.text + '</td>').appendTo(tableRow);
			});
		}

		rowCount++;
		tableRow = $('<tr/>').appendTo(table);
		$('<th>' + type + '</th>').appendTo(tableRow);

		response.rows[0].elements.forEach(function(element) {
			$('<td>' + element.duration.text + '</td>').appendTo(tableRow);
		});
	}
}

function getBusDirectionsCallBack(destinations, table) {
	return function(response, status) {
		if (status != google.maps.DirectionsStatus.OK)
			return false;

		busTableRow = $('<tr/>').appendTo(table);
		$('<th>Bus</th>').appendTo(busTableRow);

		rows = destinations.length;
		busDuration = response.routes[0].legs[0].duration.text;
		$('<td>' + busDuration + '</td>').appendTo(busTableRow);
		for (var i = 1; i < destinations.length; i++) {
			$('<td/>').appendTo(busTableRow);
		}
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
			"Princes Street, Edinburgh",
			"St Paul's and St George's Church, Edinburgh",
			"Royal Infirmary of Edinburgh",
			"Tollcross Health Centre, Edinburgh",
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

		var directionsService = new google.maps.DirectionsService();
		var departureTime = new Date(2013, 3, 15, 7, 30);
		var directionsBusOptions = {
			origin: houseLocation,
			destination: destinations[0],
			travelMode: google.maps.TravelMode.TRANSIT,
			transitOptions: {
				departureTime: departureTime,
			}
		};
		directionsService.route(directionsBusOptions, getBusDirectionsCallBack(destinations, table));
	}, 1000);
}
else {
	alert('No ESPC map found!');
}
