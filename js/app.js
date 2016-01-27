'use strict';
var map;
var startPoint = {lat:37.773972, lng: -122.431297};
var searchBox;
var places;
var listView;
var view;
var markers = [];

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
			var icon = view.icon(markers);

			view.addPlace(name, position, icon);

			if (place.geometry.viewport) {
			// Only geocodes have viewport.
				bounds.union(place.geometry.viewport);
			} else {
				bounds.extend(place.geometry.location);
			}

		map.fitBounds(bounds);
	});
});
}

//Search google places by type
function findThings (what){

	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch({
		location: startPoint,
		radius: '10000',
		types: what
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
					var icon = view.icon(markers);

					view.addPlace(name, position, icon);
					//createMarker(results[i]);)
				}
			}
		}
	}
}

//Holds the google map search results
var Place = function(name, position, icon){
	this.map = map;
	this.name = ko.observable(name);
	this.position = position;
	this.icon = icon;
	markers.push(new google.maps.Marker({
			map: map,
			icon: icon,
			title: name,
			position: this.position
		}));
};

var ViewModel = function(){
	var self = this;

	self.listView = ko.observableArray([]);

	//Add a place to an observable array
	self.addPlace = function (name, position, icon){
		self.listView.push(new Place(name, position, icon));
	};

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

	//Defines the icon to use for each Place
	self.icon = function (array){
		var url;
		var icon;
		var alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'];

		for(var i = 0; i<alpha.length; i++){
			if(array.length === i){
				url = 'http://maps.gstatic.com/mapfiles/markers2/marker'+alpha[i]+'.png';
			}
		}
		icon = {
				url: url,
				origin: new google.maps.Point(0, 0),
				anchor: new google.maps.Point(17, 34),
				};
		return icon;
	}
};

view = new ViewModel();

ko.applyBindings(view);


