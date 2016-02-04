'use strict';
var map;
var yelpData;
var googleData = [];
var startPoint = {lat:37.773972, lng: -122.431297};
var searchBox;
var places;
var view;
//var markers = [];
var labels = 'BCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var infowindow;
var directionsDisplay;
var directionsService;

//Add google maps to screen with search box
function initMap(){

	map = new google.maps.Map(document.getElementById('map'),{
		center: startPoint,
		zoom: 12,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	infowindow = new google.maps.InfoWindow;

	view.findLocation();

	view.addSearch();

	map.controls[google.maps.ControlPosition.LEFT_TOP].push(
		document.getElementById('legend'));
}

//Search google places by type
function findThings (what){

	var service = new google.maps.places.PlacesService(map);
		service.nearbySearch({
		location: view.listView()[0].position,
		//radius: '500',
		types: what,
		rankBy: google.maps.places.RankBy.DISTANCE
		}, callback);

	function callback(results, status){
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				//var yelp = yelpData.businesses; 
				//console.log(results[i]);
				var place = results[i];
				if(place.rating >= 3.5){
					var name = place.name;
					var position = place.geometry.location;
					var rating = place.rating;
					googleData.push({name: name, position: position, rating: rating});
							//view.addPlace(name, position);	
				}
			}
		}
	}
	view.showOptions(false);
	displayPlaces();
}

function displayPlaces (){
	var yelp = yelpData.businesses;
	for(var i = 0; i<yelp.length; i++){
		if(yelp[i].rating >= 3.5 && !yelp[i].is_closed){
			try{
				var yelpLoc = new google.maps.LatLng(yelp[i].location.coordinate.latitude,yelp[i].location.coordinate.longitude);
				view.addPlace(yelp[i].name, yelpLoc, yelp[i].rating, yelp[i].categories[0][0], yelp[i].url);
			}catch(e){
				i++;
			}
		}
	}
	for(var j = 0; j<googleData.length; j++){
		view.addPlace(googleData[j].name, googleData[j].position, googleData[j].rating);
	}
}

//Show infowindow box for the current item
function showInfo (where, marker, rating, what, url){
	var contentString = where+'<br>Catagory: '+what+'<br>Yelp Rating: '+rating+'<br><a href="'+url+'" target="_blank">Go to Yelp Reviews</a>';
	map = map;
	//infowindow = new google.maps.InfoWindow;

	infowindow.close();

	infowindow = new google.maps.InfoWindow({
		content: contentString
	});

	infowindow.open(map, marker);
}

//Get google directions from starting point to current item
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


var StartPlace = function(name, position, vicinity){
	this.map = map;
	this.name = name;
	this.position = position;
	this.vicinity = vicinity;
	//this.icon = icon;
	this.marker = new google.maps.Marker({
			map: map,
			title: name,
			icon: 'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png',
			position: this.position,
		});
	this.listName = "A - "+name;
};

var Place = function(name, position, rating, what, url){
	this.map = map;
	this.name = name;
	this.position = position;
	this.rating = rating;
	this.what = what;
	this.url = url;
	this.marker = new google.maps.Marker({
			map: map,
			title: name,
			position: this.position,
			label: labels[labelIndex++ % labels.length],
		});
	google.maps.event.addListener(this.marker, 'click', function() {
		showInfo(name, this, rating, what, url);
		getDirections(position);
	});

	this.listName = this.marker.label+" - "+name;
};

var ViewModel = function(){
	var self = this;
	var vicinity;
	var cll;

	self.showOptions = ko.observable(true);
	self.listView = ko.observableArray([]);
	self.currentPlace = ko.observable();

	//Use W3C Geolocation to find users current position
	self.findLocation = function(){
		var browserSupportFlag =  new Boolean();
		var initialLocation;
		var geocoder = new google.maps.Geocoder;

		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsService = new google.maps.DirectionsService();

		// Try W3C Geolocation (Preferred)
		if(navigator.geolocation) {
			browserSupportFlag = true;
			navigator.geolocation.getCurrentPosition(function(position) {
				cll = position.coords.latitude+','+position.coords.longitude;
				initialLocation = new google.maps.LatLng(position.coords.latitude,position.coords.longitude);
				map.setCenter(initialLocation);
				geocodeLatLng(initialLocation);
				view.addStartPlace("Starting Point", initialLocation, vicinity);
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
			if (errorFlag === true) {
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
						vicinity = results[1].formatted_address;
						//console.log(vicinity);
					} else {
					window.alert('No results found');
					}
					} else {
					window.alert('Geocoder failed due to: ' + status);
					}
			});
		}
	};

	//Search box, used to find starting point for plan if unable to use geolocation
	self.addSearch = function (){
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
				//vicinity = place.vicinity;
				vicinity = place.formatted_address;
				cll = place.geometry.location.lat()+','+place.geometry.location.lng();

				self.addStartPlace(name, position, vicinity);

				if (place.geometry.viewport) {
				// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}

				//map.fitBounds(bounds);
			});
		});
	};

	//Defines types for the findThings function to search
	self.seePlaces = function (){
		var forSearch = [];

		//TODO: Ensure no more then 5 search terms for yelp api
		$('input[name="whatToDo"]:checked').each(function(){
			var input = this.value;
			switch (input) {
				case 'outdoors':
					//input = [''park', 'zoo''];
					input = 'parks,playgrounds,gardens,farms,observatories,beaches,hiking,horsebackriding,skatingrinks,swimmingpools,waterparks';
					break;
				case 'culture':
					//input = ['art_gallery', 'library', 'museum'];
					input = 'galleries,culturalcenter,museums,planetarium,wineries,landmarks';
					break;
				case 'amusement':
					input = 'arcades,hauntedhouses,museums,amusementparks,carousels,gokarts,mini_golf';
					break;
				case 'animals':
					//input = ['aquarium', 'zoo'];
					input = 'aquariums,diving,fishing,horsebackriding,snorkeling,zoos,skatingrinks';
					break;
			}
				forSearch = forSearch.concat(input);
		});
		//search yelp api
		yelpHell(forSearch, vicinity, cll);
		//search google api
		//findThings(forSearch);
	};

	//Add a start place to an observable array
	self.addStartPlace = function (name, position, vicinity){
		self.listView.push(new StartPlace(name, position, vicinity));
	};

	//Add a place to an observable array
	self.addPlace = function (name, position, rating, what, url){
		self.listView.push(new Place(name, position, rating, what, url));
	};

	//Sets the current place to clicked list item
	self.setPlace = function(clickedPlace){
		self.currentPlace(clickedPlace);
		showInfo(self.currentPlace().name, self.currentPlace().marker, self.currentPlace().rating, self.currentPlace().what, self.currentPlace().url);
		//console.log(self.currentPlace.name);
		getDirections(self.currentPlace().position);
	};
};

view = new ViewModel();

ko.applyBindings(view);


