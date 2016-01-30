'use strict';
var map;
var startPoint = {lat:37.773972, lng: -122.431297};
var searchBox;
var places;
var listView;
var view;
var markers = [];
var labels = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var infowindow;


//Add google maps to screen with search box
function initMap(){
	map = new google.maps.Map(document.getElementById('map'),{
		center: startPoint,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

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
			//var icon = view.icon(markers);

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
	infowindow = new google.maps.InfoWindow();
	map = map;
	var contentString = where;
	infowindow.close();
	infowindow.setContent(contentString);
	infowindow.open(map, marker);

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
	var markerCounter = 0;

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
	}
};

view = new ViewModel();

ko.applyBindings(view);


