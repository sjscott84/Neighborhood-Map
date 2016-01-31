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


//Add google maps to screen with search box
function initMap(){
	var initialLocation;
	var browserSupportFlag =  new Boolean();

	map = new google.maps.Map(document.getElementById('map'),{
		center: startPoint,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	infowindow = new google.maps.InfoWindow;
	directionsDisplay = new google.maps.DirectionsRenderer();
	directionsService = new google.maps.DirectionsService();

	addSearch();

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(
		document.getElementById('legend'));

	// Try W3C Geolocation (Preferred)
	if(navigator.geolocation) {
		browserSupportFlag = true;
		navigator.geolocation.getCurrentPosition(function(position) {
		initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
		map.setCenter(initialLocation);
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
			alert("Geolocation service failed.");
			map.setCenter(startPoint);
		} else {
			alert("Your browser doesn't support geolocation.");
			map.setCenter(startPoint);
		}
	}
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

			view.addPlace(name, position);

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
				//if(results[i].rating > 4){
					console.log(results[i]);
					var place = results[i];
					var name = place.name;
					//var googleRate = place.rating;
					var position = place.geometry.location;
					//var icon = view.icon(markers);

					view.addPlace(name, position);
					//createMarker(results[i]);)
				//}
			}
		}
	}
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
var Place = function(name, position){
	this.map = map;
	this.name = name;
	this.position = position;
	//this.icon = icon;
	this.marker = new google.maps.Marker({
			map: map,
			title: name,
			position: this.position,
			label: labels[labelIndex++ % labels.length],
		});

	markers.push(this.marker);
};

var ViewModel = function(){
	var self = this;

	self.listView = ko.observableArray([]);

	//Add a place to an observable array
	self.addPlace = function (name, position){
		self.listView.push(new Place(name, position));
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
		console.log(forSearch);
		findThings(forSearch);
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


