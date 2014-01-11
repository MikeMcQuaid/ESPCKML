# Compile with http://johtso.github.io/CoffeeMarklet/
KML_URL = "https://maps.google.com/maps/ms?msa=0&output=kml&msid=217694540754022493585.0004d551e620a2b06ec95"
DESTINATIONS = [
  "Princes Street, Edinburgh",
  "St Paul's and St George's Church, Edinburgh",
  "Royal Infirmary of Edinburgh",
  'Virgin Active - Fountain Park, Edinburgh'
]

rowCount = 0

enhanceMap = (map) ->
  kmlLayer = new google.maps.KmlLayer(
    clickable: false
    map: map
    preserveViewport: true
    suppressInfoWindows: true
    url: KML_URL
  )
  window.map = map

createDistanceMatrixTable = (destinations) ->
  div = $("#matrixDiv")
  div.html ""
  table = $("<table/>").appendTo(div)
  rowCount = 0
  headerRow = $("<tr/>").appendTo(table)
  $("<th/>").appendTo headerRow
  destinations.forEach (destination) ->
    $("<th>" + destination + "</th>").appendTo headerRow

  table

getDistanceMatrixCallBack = (type, table) ->
  (response, status) ->
    return false  unless status is google.maps.DistanceMatrixStatus.OK
    if rowCount is 0
      rowCount++
      tableRow = $("<tr/>").appendTo(table)
      $("<th>" + "Distance" + "</th>").appendTo tableRow
      response.rows[0].elements.forEach (element) ->
        $("<td>" + element.distance.text + "</td>").appendTo tableRow

    rowCount++
    tableRow = $("<tr/>").appendTo(table)
    $("<th>" + type + "</th>").appendTo tableRow
    response.rows[0].elements.forEach (element) ->
      $("<td>" + element.duration.text + "</td>").appendTo tableRow

getBusDirectionsCallBack = (destinations, table) ->
  (response, status) ->
    return false  unless status is google.maps.DirectionsStatus.OK
    busTableRow = $("<tr/>").appendTo(table)
    $("<th>Bus</th>").appendTo busTableRow
    rows = destinations.length
    busDuration = response.routes[0].legs[0].duration.text
    $("<td>" + busDuration + "</td>").appendTo busTableRow
    i = 1

    while i < destinations.length
      $("<td/>").appendTo busTableRow
      i++

if typeof espcGoogleMap is "object"
  # Properties Search Page Map View
  # e.g. http://www.espc.com/properties.aspx?view=map
  enhanceMap espcGoogleMap
else if typeof drawMapDetails is "function"
  # Properties Details Page Map
  # e.g. http://www.espc.com/properties/details.aspx?pid=123456
  $("a[href=#map]").click()
  $("#map, #gmap").height(800).width 800
  $("#map").height 1000
  $("#map").append "<div id=\"matrixDiv\"/>"
  setTimeout (->
    mapId = "gmap"
    mapElement = document.getElementById(mapId)
    attributes = $(mapElement).attr("title").split(", ")
    latitude = parseFloat(attributes[0])
    longitude = parseFloat(attributes[1])
    title = attributes.slice(2).join(", ")
    map = drawMapDetails(mapElement, null, latitude, longitude, title)
    enhanceMap map
    houseLocation = new google.maps.LatLng(latitude, longitude)
    distanceMatrixService = new google.maps.DistanceMatrixService()
    table = createDistanceMatrixTable(DESTINATIONS)
    distanceMatrixCarOptions =
      origins: [houseLocation]
      destinations: DESTINATIONS
      unitSystem: google.maps.UnitSystem.IMPERIAL
      travelMode: google.maps.TravelMode.DRIVING

    distanceMatrixService.getDistanceMatrix distanceMatrixCarOptions, getDistanceMatrixCallBack("Car", table)
    distanceMatrixBikeOptions = jQuery.extend({}, distanceMatrixCarOptions)
    distanceMatrixBikeOptions.travelMode = google.maps.TravelMode.BICYCLING
    distanceMatrixService.getDistanceMatrix distanceMatrixBikeOptions, getDistanceMatrixCallBack("Bike", table)
    directionsService = new google.maps.DirectionsService()
    departureTime = new Date(2013, 3, 15, 7, 30)
    directionsBusOptions =
      origin: houseLocation
      destination: DESTINATIONS[0]
      travelMode: google.maps.TravelMode.TRANSIT
      transitOptions:
        departureTime: departureTime

    directionsService.route directionsBusOptions, getBusDirectionsCallBack(DESTINATIONS, table)
  ), 1000
else
  alert "No ESPC map found!"
