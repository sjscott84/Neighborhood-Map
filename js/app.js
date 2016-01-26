'use strict'
var map;
var searchBox;
var places;
var listView;
var view;

function initMap(){
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat:37.773972, lng: -122.431297},
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	addSearch();

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(
		document.getElementById('legend'));
}

function addSearch (){
	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	searchBox = new google.maps.places.SearchBox(input);
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	//Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		places = searchBox.getPlaces();
			if (places.length == 0) {
				return;
			}
		addMarkers();
	});
}

function addMarkers(){

	var markers = [];

// For each place, get the icon, name and location.
	var bounds = new google.maps.LatLngBounds();

	places.forEach(function(place) {
		var name = place.name;
		var lat = place.geometry.location.lat;
		var lng = place.geometry.location.lng;
		//var lng = place.geometry.location.lng;
		var icon = {
			url: 'http://maps.gstatic.com/mapfiles/markers2/markerA.png',
			//size: new google.maps.Size(71, 71),
			origin: new google.maps.Point(0, 0),
			anchor: new google.maps.Point(17, 34),
			//scaledSize: new google.maps.Size(25, 25)
		};

		view.addPlace(name, lat, lng);

      // Create a marker for each place.
      //markers.push(new google.maps.Marker({
        //map: map,
        //icon: icon,
        //title: place.name,
        //position: place.geometry.location
      //}));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);

};

var Place = function(name, lat, lng){
	this.map = map;
	this.name = ko.observable(name);
	this.position = new google.maps.LatLng(lat,lng);
	//this.latlng = ko.observable(position);
	var marker = new google.maps.Marker({
			position: this.position,
			map: map,
			title: name
		});
	marker.setMap(map);
};

var ViewModel = function(){
		var self = this;

		self.listView = ko.observableArray([]);

		self.addPlace = function (name, lat, lng){
			self.listView.push(new Place(name, lat, lng));
		};

		//self.listView.push(new Place(name, lat, lng));
};

view = new ViewModel();

ko.applyBindings(view);