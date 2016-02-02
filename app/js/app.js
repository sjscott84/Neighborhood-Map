'use strict';
var map;
var startPoint = {lat:37.773972, lng: -122.431297};
var searchBox;
var places;
var view;
var markers = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var infowindow;
var directionsDisplay;
var directionsService;
var vicinity;


//Add google maps to screen with search box
function initMap(){

	map = new google.maps.Map(document.getElementById('map'),{
		center: startPoint,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	infowindow = new google.maps.InfoWindow;

	findLocation();

	addSearch();

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(
		document.getElementById('legend'));
}

//Search box, used to find starting point for plan
function addSearch (){
	// Create the search box and link it to the UI element.
	var input = document.getElementById('pac-input');
	searchBox = new google.maps.places.SearchBox(input);
	var bounds = new google.maps.LatLngBounds();
	map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

	//Bias the SearchBox results towards current map's viewport.
	map.addListener('bounds_changed', function() {
		searchBox.setBounds(map.getBounds());
	});

	// Listen for the event fired when the user selects a prediction and retrieve
	// more details for that place.
	searchBox.addListener('places_changed', function() {
		places = searchBox.getPlaces();
			if (places.length === 0) {
				return;
			}
		places.forEach(function(place) {
			var name = place.name;
			var position = place.geometry.location;
			vicinity = place.vicinity;

			view.addPlace(name, position, vicinity);

			if (place.geometry.viewport) {
			// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}

		//map.fitBounds(bounds);
	});
});
}

function findLocation (){
	map = map;
	var browserSupportFlag =  new Boolean();
	var initialLocation;
	var pos;
	var geocoder = new google.maps.Geocoder;

	directionsDisplay = new google.maps.DirectionsRenderer();
	directionsService = new google.maps.DirectionsService();

	// Try W3C Geolocation (Preferred)
	if(navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
			initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
			map.setCenter(initialLocation);
			geocodeLatLng(initialLocation);
			view.addPlace("Starting Point", initialLocation, vicinity);
		}, function() {
			handleNoGeolocation(browserSupportFlag);
		});
	}
	// Browser doesn't support Geolocation
	else {
		browserSupportFlag = false;
		handleNoGeolocation(browserSupportFlag);
	}

	function handleNoGeolocation(errorFlag) {
		if (errorFlag == true) {
			alert("Geolocation service failed, enter your starting location in the search field in the map");
			map.setCenter(startPoint);
		} else {
			alert("Geolocation service failed, enter your starting location in the search field in the map");
			map.setCenter(startPoint);
		}
	}

	function geocodeLatLng(where){
		var latlng = where;
		geocoder.geocode({'location': latlng}, function(results, status){
			if (status === google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					vicinity = results[1].address_components[1].long_name;
					//console.log(vicinity);
				} else {
				window.alert('No results found');
				}
				} else {
				window.alert('Geocoder failed due to: ' + status);
				}
		})
	}
}

//Search google places by type
function findThings (what){

	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: markers[0].position,
		//radius: '500',
		types: what,
		rankBy: google.maps.places.RankBy.DISTANCE
		}, callback);

	function callback(results, status){
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				if(results[i].rating > 4){
					console.log(results[i]);
					var place = results[i];
					var name = place.name;
					//var googleRate = place.rating;
					var position = place.geometry.location;
					//var icon = view.icon(markers);

					view.addPlace(name, position);
					//createMarker(results[i]);)
				}
			}
		}
	}
	view.showOptions(false);
}

function showInfo (where, marker){
	var contentString = where;
	map = map;
	//infowindow = new google.maps.InfoWindow;

	infowindow.close();

	infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	infowindow.open(map, marker);
}

function getDirections (where){
	map = map;

	directionsDisplay.setMap(map);
	directionsDisplay.setOptions( { suppressMarkers: true } );
	directionsDisplay.setPanel(document.getElementById("directionsPanel"));

	var start = view.listView()[0].position;
	var end = where;
	var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode.WALKING
	};

	directionsService.route(request, function(result, status) {
		if (status == google.maps.DirectionsStatus.OK) {
			directionsDisplay.setDirections(result);
		}
	});
}

//Holds the google map search results
var Place = function(name, position, vicinity){
	this.map = map;
	this.name = name;
	this.position = position;
	this.vicinity = vicinity
	//this.icon = icon;
	this.marker = new google.maps.Marker({
			map: map,
			title: name,
			position: this.position,
			label: labels[labelIndex++ % labels.length],
		});

	markers.push(this.marker);
	this.listName = this.marker.label+" - "+name;
};

var ViewModel = function(){
	var self = this;
	self.showOptions = ko.observable(true);
	self.listView = ko.observableArray([]);

	//Add a place to an observable array
	self.addPlace = function (name, position, vicinity){
		self.listView.push(new Place(name, position, vicinity));
	};

	self.currentPlace = ko.observable();

	//Defines types for the findThings function to search
	self.seePlaces = function (){
		var forSearch = [];

		$('input[name="whatToDo"]:checked').each(function(){
			var input = this.value;
			switch (input) {
				case 'outdoors':
					input = ['park', 'zoo'];
					break;
				case 'culture':
					input = ['art_gallery', 'library', 'museum'];
					break;
				case 'amusement':
					input = ['amusement_park', 'bowling_alley', 'museum', 'stadium'];
					break;
				case 'animals':
					input = ['aquarium', 'zoo'];
					break;
			}
				forSearch = forSearch.concat(input);
		});
		//console.log(forSearch);
		findThings(forSearch);
		yelpHell(forSearch, vicinity);
	};

	self.setPlace = function(clickedPlace){
		self.currentPlace(clickedPlace);
		showInfo(self.currentPlace().name, self.currentPlace().marker);
		//console.log(self.currentPlace.name);
		getDirections(self.currentPlace().position);
	}


};

view = new ViewModel();

ko.applyBindings(view);


