'use strict'
var map;

var spots = [
	{
		name: "Place 2",
		latlng: {lat: 37.7847191, lng: -122.414172}
	},
	{
		name: "Place 4",
		latlng: {lat: 37.7812488, lng: -122.411304}
	},
	{
		name: "Place 6",
		latlng: {lat: 37.7812490, lng: -122.411310}
	}
];

var Place = function(data){
	this.name = ko.observable(data.name);
	this.latlng = ko.observable(data.latlng);
}

var ViewModel = function(){
	var self = this;

	this.listView = ko.observableArray([]);

	spots.forEach(function(viewItem){
		self.listView.push(new Place(viewItem));
	})
}

ko.applyBindings(new ViewModel());

function initMap(){
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat:37.773972, lng: -122.431297},
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	var searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	//Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	var markers = [];
	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		var places = searchBox.getPlaces();
			if (places.length == 0) {
				return;
			}

		// Clear out the old markers.
		markers.forEach(function(marker) {
			marker.setMap(null);
		});

	markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      var icon = {
        url: 'http://maps.gstatic.com/mapfiles/markers2/markerA.png',
        //size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        //scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: icon,
        title: place.name,
        position: place.geometry.location
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });

map.controls[google.maps.ControlPosition.LEFT_TOP].push(
  document.getElementById('legend'));

	for(var i=0; i<spots.length; i++){
		var marker = new google.maps.Marker({
			position: spots[i].latlng,
			map: map,
			title: spots[i].name
		});
	}
}
