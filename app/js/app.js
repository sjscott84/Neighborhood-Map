'use strict';
var map;
var yelpData;
var googleData = [];
var startPoint = {lat:37.773972, lng: -122.431297};
var searchBox;
var places;
var view;
var labels = 'BCDEFGHIJKLMNOPQRSTUVWXYZ';
var labelIndex = 0;
var infowindow;
var directionsDisplay;
var directionsService;
var markers = [];

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

	map.controls[google.maps.ControlPosition.TOP_CENTER].push(
		document.getElementById('start'));
}

//Search google places by type
function findThings (what){

	var service = new google.maps.places.PlacesService(map);

	//Gets google place details for specific ID
	function placeDetailCallback(placeDetail, status){
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			var placeURL = { 
				url: placeDetail.website
			}
			googleData.push(placeURL);
		} else {
			console.log("error");
		}
	}

	//Gets a list of google places for a starting point
	function callback(results, status){
		if (status === google.maps.places.PlacesServiceStatus.OK) {
			for (var i = 0; i < results.length; i++) {
				//var yelp = yelpData.businesses; 
				//console.log(results[i]);
				var place = results[i];
				if(place.rating >= 3){
					
					var thePlace = { 
						name: place.name, 
						position: place.geometry.location, 
						type: place.types[0], 
						rating: place.rating, 
						//url: placeDetail.website
					}
					googleData.push(thePlace);
					//service.getDetails({placeId: place.place_id}, placeDetailCallback);
				}
			}

			if(googleData.length === 0){
				alert("There are no google results that match your search, please try a new starting point")
			}else{
				displayPlaces();
			}
		}
	}

	var seachNearByQuery = {
		location: view.listView()[0].position,
		//radius: '500',
		types: what,
		rankBy: google.maps.places.RankBy.DISTANCE
	}
	service.nearbySearch(seachNearByQuery, callback);
}

//Sort through yelp data and display
function displayPlaces (){
	if(yelpData === undefined || jQuery.isEmptyObject(yelpData)){
		for(var j = 0; j<googleData.length; j++){
			view.addPlace(googleData[j].name, googleData[j].position, googleData[j].rating, googleData[j].type);
		}
	}else{
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
	}
	if(view.listView().length === 1){
		alert("There are no yelp results that match your search, please try a new starting point")
	}

	for(var i = 1; i<view.listView().length; i++){
		if(jQuery.inArray(view.listView()[i].what, view.dataType()) === -1){
			view.dataType.push(view.listView()[i].what);
		}
	}

	view.showOptions(false);
	view.showFilter(true);
}

//Show infowindow box for the current item
function showInfo (where, marker, rating, what, url){
	var contentStringYelp = '<b>'+where+'</b>'+'<br>Category: '+what+'<br>Yelp Rating: '+rating+'<br><a href="'+url+'" target="_blank">Go to Yelp Reviews</a>';
	var contentStringGoogle = '<b>'+where+'</b>'+'<br>Category: '+what+'<br>Google Rating: '+rating+'<br>'
	map = map;
	//infowindow = new google.maps.InfoWindow;

	infowindow.close();

	if(url){
		infowindow = new google.maps.InfoWindow({
			content: contentStringYelp
		});
	}else{
		infowindow = new google.maps.InfoWindow({
			content: contentStringGoogle
		});
	}

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

	//markers.push(this.marker);
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
			label: labels[labelIndex++ % labels.length]
		});
	google.maps.event.addListener(this.marker, 'click', function() {
		this.icon = 'http://maps.gstatic.com/mapfiles/markers2/marker_green'+this.label+'.png'
		showInfo(name, this, rating, what, url);
		getDirections(position);
	});

	this.listName = this.marker.label+" - "+name;

	//markers.push(this.marker);
};

var ViewModel = function(){
	var self = this;
	var vicinity;
	var cll;

	self.showOptions = ko.observable(true);
	self.listView = ko.observableArray([]);
	self.currentPlace = ko.observable();
	self.dataType = ko.observableArray(["All"]);
	self.showFilter = ko.observable(false);
	self.currentFilter = ko.observable();

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
			if (self.listView().length > 0){
				for (var i = 0; i < self.listView().length; i++) {
					self.listView()[i].marker.setMap(null);
					directionsDisplay.setMap(null);
					directionsDisplay.setPanel(null);
					labels[labelIndex=0];
				}
				view.showOptions(true);
				view.showFilter(false);
				//markers = [];
				self.listView([]);
				yelpData = {};
				googleData = [];
				self.dataType(["All"]);
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

				map.fitBounds(bounds);
			});
		});
	};

	//Defines types for the findThings function to search
	self.seePlaces = function (){
		var forSearchYelp;
		var forSearchGoogle = [];
		$('input[name="whatToDo"]:checked').each(function(){
			var input = this.value;
			switch (input) {
				case 'outdoors':
					forSearchGoogle = ['park', 'zoo'];
					forSearchYelp = 'parks,playgrounds,gardens,farms,observatories,beaches,hiking,horsebackriding,skatingrinks,swimmingpools,waterparks';
					break;
				case 'culture':
					forSearchGoogle = ['art_gallery', 'library', 'museum'];
					forSearchYelp = 'galleries,culturalcenter,museums,planetarium,wineries,landmarks,observatories';
					break;
				case 'amusement':
					forSearchGoogle = ['amusement_park', 'bowling_alley', 'museum'];
					forSearchYelp = 'arcades,hauntedhouses,museums,amusementparks,carousels,gokarts,mini_golf';
					break;
				case 'animals':
					forSearchGoogle = ['aquarium', 'zoo'];
					forSearchYelp = 'aquariums,diving,fishing,horsebackriding,snorkeling,zoos,skatingrinks';
					break;
			}
				//forSearch = forSearch.concat(input);
		});
		//search yelp api
		yelpHell(forSearchYelp, vicinity, cll, forSearchGoogle);
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

	//TODO: Filter markers as well
	self.filterView = ko.computed(function(){
		if(self.currentFilter() === "All"){
			for(var i = 0; i<self.listView().length; i++){
				self.listView()[i].marker.setMap(map);
				directionsDisplay.setMap(null);
				directionsDisplay.setPanel(null);
			}
			return self.listView();
		}
		if (!self.currentFilter()) {
			return self.listView();
		} else {
			return ko.utils.arrayFilter(self.listView(), function (prod) {
				directionsDisplay.setMap(null);
				directionsDisplay.setPanel(null);
				for (var i = 1; i < self.listView().length; i++) {
					if(self.listView()[i].what !== self.currentFilter()){
						self.listView()[i].marker.setMap(null);
					}else{
						//(self.listView()[i].what === self.currentFilter())
						self.listView()[i].marker.setMap(map);
					}
				}
				return prod.what == self.currentFilter();
			});
		}
	});

	self.filter = function (genre) {
		self.currentFilter(genre);
	};
}

view = new ViewModel();

ko.applyBindings(view);