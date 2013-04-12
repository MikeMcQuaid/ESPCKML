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

function showDistanceMatrixTable(response, status) {
	if (status != google.maps.DistanceMatrixStatus.OK)
		return false;

	div = $('#matrixDiv');
	div.html('');

	table = $('<table/>').appendTo(div);

	headerRow = $('<tr/>').appendTo(table);
	for (var i = 0; i < response.destinationAddresses.length; i++) {
		$('<th>' + response.destinationAddresses[i] + '</th>').appendTo(headerRow);
	}

	for (var i = 0; i < response.rows.length; i++) {
		tableRow = $('<tr/>').appendTo(table);
		for (var j = 0; j < response.rows[i].elements.length; j++) {
			var distance = response.rows[i].elements[j].distance.text;
			var duration = response.rows[i].elements[j].duration.text;
			$('<td>' + distance + '<br>' + duration + '</td>').appendTo(tableRow);
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
		distanceMatrixService.getDistanceMatrix({
			origins: [houseLocation],
			destinations: [
				"St Paul's and St George's Church, Edinburgh",
				"Princes Street, Edinburgh",
				"Royal Infirmary of Edinburgh",
				"Tollcross Health Centre, Edinburgh"
			],
			travelMode: google.maps.TravelMode.BICYCLING,
			unitSystem: google.maps.UnitSystem.IMPERIAL,
		}, showDistanceMatrixTable);
	}, 1000);
}
else {
	alert('No ESPC map found!');
}
