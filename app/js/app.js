'use strict';
var map,
	view,
	startPoint = {lat:37.773972, lng: -122.431297},
	infowindow,
	yelpData,
	googleData = [],
	overlay = document.getElementById('googleOverlay'),
	labels = 'BCDEFGHIJKLMNOPQRSTUVWXYZ',
	labelIndex = 0,
	vicinity,
	cll,
	initialLocation;

/**
 * Add google maps to screen with search box
*/
function initMap(){

	var timeoutMiliSeconds = 4000;

	var timer = window.setTimeout(onLoadError, timeoutMiliSeconds);

	map = new google.maps.Map(document.getElementById('map'),{
		center: startPoint,
		zoom: 12,
		mapTypeControl: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	});

	//Error if map does not load
	function onLoadError(){
		alert("Google is currently unavaliable, please try again later");
	}

	infowindow = new google.maps.InfoWindow;

	localStorage.clear();

	//view.findLocation();//this functionality turned off to meet project requirement for search capabilities
	view.addSearch();

	//Adds legend to different part of screen depending on screen size
	if ( $(window).width() > 600) {
		map.controls[google.maps.ControlPosition.LEFT_TOP].push(overlay);
	}else {
		map.controls[google.maps.ControlPosition.BOTTOM_CENTER].push(overlay);
	}

	//Load data in local storage if any
	if (localStorage.getItem("results") !== null) {
		view.getInfo();
		vicinity = view.listView()[0].vicinity;
		cll = view.listView()[0].position.lat+','+view.listView()[0].position.lng;
		map.setZoom(14);
		map.setCenter(view.listView()[0].position);
		view.showResults();
	}

	//Clear error handling setTimout once all tiles have loaded
	google.maps.event.addListener(map, 'tilesloaded', function () {
		window.clearTimeout(timer);
	});

}

/**
 * The starting position for any directions
 * @param {string} name - The name of the starting place
 * @param {object} position - The latitude and longitude of the starting place
 * @param {string} vicinity - A formatted address for the starting place
*/
var StartPlace = function(name, position, vicinity){
	this.map = map;
	this.name = name;
	this.position = position;
	this.vicinity = vicinity;
	this.marker = new google.maps.Marker({
		map: map,
		title: name,
		icon: 'http://maps.gstatic.com/mapfiles/markers2/marker_greenA.png',
		position: this.position
	});
	this.listName = "A - "+name;
};

/**
 * The place object for the results returned from yelp or google
 * Markers from http://www.googlemapsmarkers.com/
 * @param {string} name - The name of the place
 * @param {object} position - The latitude and longitude of the place
 * @param {number} rating - The rating of the place
 * @param {string} what - The catagory of the place e.g "Art Gallery"
 * @param {url} url - The URL to the yelp page of place (only supplied when info comes from yelp api and not google api)
 */
var Place = function(name, position, rating, what, url){
	var self = this;
	self.map = map;
	self.name = name;
	self.position = position;
	self.rating = rating;
	self.what = what;
	self.url = url;
	self.iconColor = getMarkerColor(this.what);
	self.label = labels[labelIndex++ % labels.length];
	self.marker = new google.maps.Marker({
		map: map,
		title: name,
		position: self.position,
		zoomOnClick: false,
		icon: 'http://www.googlemapsmarkers.com/v1/'+self.label+'/'+self.iconColor
	});
	google.maps.event.addListener(this.marker, 'click', function() {
		//this.setAnimation(google.maps.Animation.BOUNCE);
		//view.changeMarkerBack();
		//this.setIcon('http://www.googlemapsmarkers.com/v1/B/FF0000');
		toggleBounce();
		view.showFullLegend();
		view.getDirections(position, name, this, rating, what, url);
		view.setPlace(self);
	});

	self.listName = self.label+" - "+name;

	function toggleBounce() {
		for (var i = 0; i < view.listView().length; i++){
			if(view.listView()[i].marker.getAnimation() !== null){
				view.listView()[i].marker.setAnimation(null);
			}
		}
		self.marker.setAnimation(google.maps.Animation.BOUNCE);
	}
};

/**
 * View model for website
 * @namespace ViewModel
 */
var ViewModel = function(){
	var self = this,
		searchBox,
		places,
		directionsDisplay,
		directionsService;

	self.showOptions = ko.observable(true);
	self.showForecast = ko.observable(false);
	self.showLegend = ko.observable(false);
	self.showDirections = ko.observable(false);
	self.weatherTable = ko.observableArray([]);
	self.listView = ko.observableArray([]);
	self.currentPlace = ko.observable();
	self.dataType = ko.observableArray(["All"]);
	self.showFilter = ko.observable(false);
	self.currentFilter = ko.observable();
	self.textFilter = ko.observable("");
	self.showTextFilter = ko.observable(true);
	self.showDropdownFilter = ko.observable(true);
	self.weatherLoad = ko.observable(true);
	self.catagory = ko.observable();
	self.selectedPlace = ko.observable();

	//this functionality turned off to meet project requirement for search capabilities
	/**
	 * Use W3C Geolocation to find users current position
	 * @memberof ViewModel
	 */
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
				self.addStartPlace("Starting Point", initialLocation, vicinity);
			}, function() {
				handleNoGeolocation(browserSupportFlag);
			});
		}
		// If browser doesn't support Geolocation
		else {
			browserSupportFlag = false;
			handleNoGeolocation(browserSupportFlag);
		}
		// Handle erros
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
					} else {
					window.alert('No results found');
					}
				} else {
					window.alert('Geocoder failed due to: ' + status);
				}
			});
		}
	};

	/**
	 * Search box, used to find starting point for place searches if unable to use geolocation
	 * @memberof ViewModel
	 */
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

		directionsDisplay = new google.maps.DirectionsRenderer();
		directionsService = new google.maps.DirectionsService();

		// Listen for the event fired when the user selects a prediction,
		// removes any existing search history and
		// retrieves more details for that place.
		searchBox.addListener('places_changed', function() {
			places = searchBox.getPlaces();
			if (places.length === 0) {
				return;
			}
			//if (self.listView().length > 0){
				for (var i = 0; i < self.listView().length; i++) {
					self.listView()[i].marker.setMap(null);
				}
				directionsDisplay.setMap(null);
				directionsDisplay.setPanel(null);
				labels[labelIndex=0];
				self.showCatagories();
				self.listView([]);
				self.weatherTable([]);
				yelpData = {};
				googleData = [];
				self.dataType(["All"]);
				self.textFilter("");
			//}
			places.forEach(function(place) {
				var name = place.name;
				var position = place.geometry.location;
				var weatherPlace = place.address_components;
				var stateForWeather;
				var cityForWeather;
				vicinity = place.formatted_address;
				cll = place.geometry.location.lat()+','+place.geometry.location.lng();
				initialLocation = new google.maps.LatLng(place.geometry.location.lat(),place.geometry.location.lng());

				//get state or country for weather search
				for(var i = 0; i < weatherPlace.length; i++){
					if(weatherPlace[i].types[0] === "country"){
						if(weatherPlace[i].short_name === "US"){
							for(var j = 0; j < weatherPlace.length; j++){
								if(weatherPlace[j].types[0] === "administrative_area_level_1"){
									stateForWeather = weatherPlace[j].short_name;
								}
							}
						}else{
							stateForWeather = weatherPlace[i].long_name;
						}
					}
				}

				//get city for weather search
				for(var j = 0; j < weatherPlace.length; j++){
					if(weatherPlace[j].types[0] === "locality"){
						cityForWeather = weatherPlace[j].long_name;
					}
				}

				self.addStartPlace(name, position, vicinity);

				if (place.geometry.viewport) {
				// Only geocodes have viewport.
					bounds.union(place.geometry.viewport);
				} else {
					bounds.extend(place.geometry.location);
				}

				map.setCenter(initialLocation);
				map.fitBounds(bounds);
				//map.setZoom(14);
				bounds = new google.maps.LatLngBounds();
				//getWeather(stateForWeather, cityForWeather);
			});
		});
	};

	self.showWeather = function(currentCondition, currentTemp, currentIcon, forcastCondition, forecastTime, forcastIcon, forcastTemp){

		var currentCondition = currentCondition;
		var currentTemp = currentTemp;
		var currentIcon = currentIcon;
		var forecastCondition = forcastCondition;
		var forecastTime = forecastTime;
		var forecastIcon = forcastIcon;
		var forecastTemp = forcastTemp;

		self.showForecast(true);

		self.weatherTable.push({time: "Now", url: currentIcon, condition: currentCondition+" - "+currentTemp+"F"})

		for(var i = 0; i < forecastTime.length; i++){
			self.weatherTable.push({time: forecastTime[i], url: forecastIcon[i], condition: forecastCondition[i]+" - "+forecastTemp[i]+"F"})
		}

		self.weatherLoad(false);
	}

	/**
	 * Defines types for the findThings function to search weather results come from yelp api or google places api
	 * Input is the catagories radio
	 * @memberof ViewModel
	 */
	self.seePlaces = function (){
		if(!self.listView()[0]){
			alert("Please enter a starting location");
		}else{
			var forSearchYelp;
			var forSearchGoogle = [];
				var input = self.catagory();
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
						forSearchYelp = 'museums,arcades,hauntedhouses,amusementparks,carousels,gokarts,mini_golf,skatingrinks';
						break;
					case 'animals':
						forSearchGoogle = ['aquarium', 'zoo'];
						forSearchYelp = 'aquariums,diving,fishing,horsebackriding,snorkeling,zoos';
						break;
				}
				yelpHell(forSearchYelp, vicinity, cll, forSearchGoogle, view);
		}
	};

	/**
	 * Add a start place to an observable array
	 * @param {string} name - The name of the starting place
	 * @param {object} position - The latitude and longitude of the starting place
	 * @param {string} vicinity - A formatted address for the starting place
	 * @memberof ViewModel
	 */
	self.addStartPlace = function (name, position, vicinity){
		self.listView.push(new StartPlace(name, position, vicinity));
	};

	/**
	 * Add a place to an observable array
	 * @param {string} name - The name of the place
	 * @param {object} position - The latitude and longitude of the place
	 * @param {number} rating - The rating of the place
	 * @param {string} what - The catagory of the place e.g "Art Gallery"
	 * @param {url} url - The URL to the yelp page of place (only supplied when info comes from yelp api and not google api)
	 * @memberof ViewModel
	 */
	self.addPlace = function (name, position, rating, what, url){
		self.listView.push(new Place(name, position, rating, what, url));
	};

	/**
	 * Sets the current place to clicked list item
	 * @param {object} clickedPlace - The item from the self.filterView list that was clicked
	 * @memberof ViewModel
	 */
	self.setPlace = function(clickedPlace){
		self.changeMarkerBack();
		if(clickedPlace !== self.listView()[0]){
			self.currentPlace(clickedPlace);
			self.showFullLegend();

			for (var i = 0; i < view.listView().length; i++){
				if(view.listView()[i].marker.getAnimation() !== null){
					view.listView()[i].marker.setAnimation(null);
				}
			}

			self.currentPlace().marker.setAnimation(google.maps.Animation.BOUNCE);

			self.getDirections(self.currentPlace().position, self.currentPlace().name, self.currentPlace().marker,
			self.currentPlace().rating, self.currentPlace().what, self.currentPlace().url);
			//self.currentPlace().marker.setIcon('http://www.googlemapsmarkers.com/v1/B/FF0000');
		}
	};

	/**
	 * Search google places api by type if yelp api fails
	 * @param {array} what - An array of catagories for google to search for
	 * @memberof ViewModel
	 */
	self.findThings = function (what){

		var service = new google.maps.places.PlacesService(map);

		//Gets a list of google places from a starting point
		function callback(results, status){
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				for (var i = 0; i < results.length; i++) {
					var place = results[i];
					if(place.rating >= 3){
						var thePlace = { 
							name: place.name, 
							position: place.geometry.location, 
							type: place.types[0], 
							rating: place.rating, 
						};
						googleData.push(thePlace);
					}
				}
				//Return error message if no results
				if(googleData.length === 0){
					alert("There are no google results that match your search, please try a new starting point");
				}else{
					self.displayPlaces();
				}
			}
		}

		var seachNearByQuery = {
			location: self.listView()[0].position,
			//radius: '500',
			types: what,
			rankBy: google.maps.places.RankBy.DISTANCE
		};
		service.nearbySearch(seachNearByQuery, callback);
	};

	/**
	 * Sort through yelp or google data and display based on various catagories
	 * @memberof ViewModel
	 */
	self.displayPlaces = function (){
		//adds google results to view.listView() if no yelp results
		if(yelpData === undefined || jQuery.isEmptyObject(yelpData)){
			for(var j = 0; j<googleData.length; j++){
				self.addPlace(googleData[j].name, googleData[j].position, googleData[j].rating, googleData[j].type);
			}
		}else{
			//adds yelp info to view.listView() if rating is over 3.5 and is open
			var yelp = yelpData.businesses;
			for(var i = 0; i<yelp.length; i++){
				if(yelp[i].rating >= 3.5){
					try{
						var yelpLoc = new google.maps.LatLng(yelp[i].location.coordinate.latitude,yelp[i].location.coordinate.longitude);
						self.addPlace(yelp[i].name, yelpLoc, yelp[i].rating, yelp[i].categories[0][0], yelp[i].url);
					}catch(e){
						i++;
					}
				}
			}
		}

		//if no yelp results match search catagory return error message else save results to local storage
		if(self.listView().length === 1){
			alert("There are no results that match your search, try a new catagory");
		}else{
			self.showResults();
			localStorage.clear();
			self.saveInfo();
		}

		self.setDataTypeArray(self.listView());
		self.fitBoundsToVisibleMarkers()

	};

	/**
	 * Fit bounds of map to visible markers
	 * @memberof ViewModel
	 */
	self.fitBoundsToVisibleMarkers = function() {

		if(map){

			var bounds = new google.maps.LatLngBounds();

			for (var i=0; i<self.listView().length; i++) {
				if(self.listView()[i].marker.getVisible()) {
					bounds.extend(self.listView()[i].marker.getPosition() );
				}
			}

			map.fitBounds(bounds);
		}
	}

	/**
	 * If marker was changed to a red B on click this function changes it back to its original form
	 * @memberof ViewModel
	 */
	self.changeMarkerBack = function (){
		if(map){
			for (var i = 0; i<view.listView().length; i++){
				if(view.listView()[i].marker.icon === 'http://www.googlemapsmarkers.com/v1/B/FF0000'){
					view.listView()[i].marker.setIcon('http://www.googlemapsmarkers.com/v1/'+view.listView()[i].label+'/'+view.listView()[i].iconColor);
				}
			}
		}
	}

	/**
	 * Remove any directions from screen before change position of markers
	 * @memberof ViewModel
	 */
	self.removeDirections = function (){
		if(infowindow){
			self.changeMarkerBack();
			infowindow.close();
		}
		if(directionsDisplay){
			directionsDisplay.setMap(null);
			directionsDisplay.setPanel(null);
		}
	};

	/**
	 * Filter the list view of places based on the filter
	 * @memberof ViewModel
	 */
	self.filterPlaces = ko.computed(function() {
		//Highlight clicked list item
		self.selectedPlace(self.currentPlace());
		//If both filters at starting point
		if(self.currentFilter() === "All" && !self.textFilter()){
			return self.listView();
		}
		//If Dropdown catagory filter selected
		if(self.currentFilter() != "All"){
			return ko.utils.arrayFilter(self.listView(), function (clickedFilter) {
				return clickedFilter.what == self.currentFilter();
			});
		}
		//If text filter selected
		if(self.textFilter()){
			var filter = self.textFilter().toLowerCase();
			return ko.utils.arrayFilter(self.listView(), function (rec) {
				var result = rec.listName.toLowerCase();
				if(result.indexOf(filter) > -1){
					return result;
				};
			});
		}
	});

	/**
	 * Filter marker placement by catagory
	 * @memberof ViewModel
	 */
	self.filterView = ko.computed(function (){
		if(self.currentFilter() === "All"){
			self.showTextFilter(true);
			self.removeDirections();
			self.fitBoundsToVisibleMarkers();
			for(var i = 0; i<self.listView().length; i++){
				self.listView()[i].marker.setMap(map);
			}
		}else{
			self.removeDirections();
			self.showTextFilter(false);
			self.fitBoundsToVisibleMarkers();
			for (var i = 1; i < self.listView().length; i++) {
				if(self.listView()[i].what !== self.currentFilter()){
					self.listView()[i].marker.setMap(null);
				}else{
					self.listView()[i].marker.setMap(map);
				}
			}
		}
	});

	/**
	 * Filter marker placement by text filter
	 * @memberof ViewModel
	 */
	self.textFilterResults = ko.computed( function () {
		if(!self.textFilter()){
			self.showDropdownFilter(true);
			self.removeDirections();
			self.fitBoundsToVisibleMarkers();
			for(var i = 1; i < self.listView().length; i++){
				self.listView()[i].marker.setMap(map);
			}
		}else{
			self.showDropdownFilter(false);
			self.removeDirections();
			self.fitBoundsToVisibleMarkers();
			var filter = self.textFilter().toLowerCase();

			for(var i = 1; i < self.listView().length; i++){
				if(self.listView()[i].name.toLowerCase().indexOf(filter) > -1){
					self.listView()[i].marker.setMap(map);
				}else{
					self.listView()[i].marker.setMap(null);
				}
			}
		}
		//self.fitBoundsToVisibleMarkers();
	});

	/**
	 * set the current type filter
	 * @param {string} genre - Catagory to filter on
	 * @memberof ViewModel
	 */
	self.filter = function (genre) {
		self.currentFilter(genre);
		self.fitBoundsToVisibleMarkers()
	};

	/**
	 * show directions legend
	 * @memberof ViewModel
	 */
	self.showDetailedDirections = function (){
		self.selectedMarker.setIcon('http://www.googlemapsmarkers.com/v1/B/FF0000');
		self.showLegend(false);
		self.showDirections(true);
	};

	/**
	 * show the places legend
	 * @memberof ViewModel
	 */
	self.showFullLegend = function (){
		self.changeMarkerBack();
		self.showDirections(false);
		self.showLegend(true);
	};

	/**
	 * show catagory options
	 * @memberof ViewModel
	 */
	self.showCatagories = function (){
		self.showOptions(true);
		self.showForecast(true);
		self.showLegend(false);
		self.showFilter(false);
	};

	/**
	 * show results
	 * @memberof ViewModel
	 */
	self.showResults = function (){
		self.showOptions(false);
		self.showForecast(false);
		self.showLegend(true);
		self.showFilter(true);
	};

	/**
	 * Choose a new catagory to search by pressing back button from results
	 * @memberof ViewModel
	 */
	self.showOptionsAgain = function (){
		map.setCenter(initialLocation);
		map.setZoom(14);
		if (self.listView().length > 1){
			for (var i = 1; i < self.listView().length; i++) {
				self.listView()[i].marker.setMap(null);
				directionsDisplay.setMap(null);
				directionsDisplay.setPanel(null);
			}
			while(self.listView().length > 1){
				self.listView().splice(1, 1);
			}
		}
		labels[labelIndex=0];
		yelpData = {};
		googleData = [];
		self.dataType(["All"]);
		console.log(self.listView());
		self.showCatagories();
	};

	/**
	 * Get google walking directions from starting point to current item
	 * @param {object} where - object containing latitude and longitude of place to get directions too
	 * @param {string} name - name of place
	 * @param {object} marker - the google marker of the place to get directions to
	 * @param {number} rating - rating of place to get directions to
	 * @param {string} what - catagory of place to get directions to
	 * @param {string} url - URL to yelp reviews (only provided when results come from yelp not google)
	 * @memberof ViewModel
	 */
	self.getDirections = function (where, name, marker, rating, what, url){
		directionsDisplay.setMap(map);
		directionsDisplay.setOptions( { suppressMarkers: true } );
		directionsDisplay.setPanel(document.getElementById("directionsPanel"));

		var start = self.listView()[0].position;
		var end = where;
		var request = {
			origin:start,
			destination:end,
			travelMode: google.maps.TravelMode.WALKING
		};

		directionsService.route(request, function(result, status) {
			if (status == google.maps.DirectionsStatus.OK) {
				directionsDisplay.setDirections(result);
				var distance = result.routes[0].legs[0].distance.text;
				var duration = result.routes[0].legs[0].duration.text;
				self.showInfo(name, marker, rating, what, url, distance, duration);
			}
		});
	};

	/**
	 * Show infowindow box for the current item
	 * @param {object} where - object containing latitude and longitude of place to get directions too
	 * @param {object} marker - the google marker of the place to get directions to
	 * @param {number} rating - rating of place to get directions to
	 * @param {string} what - catagory of place to get directions to
	 * @param {string} url - URL to yelp reviews (only provided when results come from yelp not google)
	 * @param {string} distance - distance from starting point to current item from google
	 * @param {string} duration - how long it will take to get from starting point to current item from google
	 * @memberof ViewModel
	 */
	self.showInfo = function (where, marker, rating, what, url, distance, duration){

		view.selectedMarker = marker;
		var contentStringYelp = '<b>'+where+'</b>'+'<br>Category: '+what+'<br>Yelp Rating: '+rating
		+'<br><a href="'+url+'" target="_blank">Go to Yelp Reviews</a><br>Walk Time: '+distance+' about '+duration
		+'<br><button type="button" class="btn btn-default center-block" onclick="view.showDetailedDirections()">Show Directions!</button>';
		var contentStringGoogle = '<b>'+where+'</b>'+'<br>Category: '+what+'<br>Google Rating: '+rating+'<br>Walk Time: '+distance
		+' about '+duration+'<br><button type="button" class="btn btn-default center-block" onclick="view.showDetailedDirections()">Show Directions!</button>';

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
	};

	/**
	 * Save the current starting place and place results to local storage
	 * @memberof ViewModel
	 */
	self.saveInfo = function (){
		var infoToSave = [];

		infoToSave.push({name: self.listView()[0].name, position: self.listView()[0].position, vicinity: self.listView()[0].vicinity});

		for(var i = 1; i<self.listView().length; i++){
			infoToSave.push({name: self.listView()[i].name, position: self.listView()[i].position, rating: self.listView()[i].rating,
			what: self.listView()[i].what, url: self.listView()[i].url});
		}

		localStorage.setItem("results", JSON.stringify(infoToSave));
		localStorage.setItem("initialLocation", JSON.stringify(initialLocation));
	};

	/**
	 * Retrieve infomation from local storage
	 * @memberof ViewModel
	 */
	self.getInfo = function (){
		self.listView([]);
		var resultsFromLocalStorage = localStorage.getItem("results");
		var resultsToUse = JSON.parse(resultsFromLocalStorage);
		var initLocation = localStorage.getItem("initialLocation");
		initialLocation = JSON.parse(initLocation);
		labels[labelIndex=0];

		self.addStartPlace(resultsToUse[0].name, resultsToUse[0].position, resultsToUse[0].vicinity);

		for(var i = 1; i<resultsToUse.length; i++){
			self.addPlace(resultsToUse[i].name, resultsToUse[i].position, resultsToUse[i].rating, resultsToUse[i].what, resultsToUse[i].url);
		}

		self.setDataTypeArray(resultsToUse);
	};

	/**
	 * Creates the dataType array to filter results on
	 * @param {array} what - array to get catagory types from
	 * @memberof ViewModel
	 */
	self.setDataTypeArray = function (what){
		for(var i = 1; i<what.length; i++){
			if(jQuery.inArray(what[i].what, self.dataType()) === -1){
				self.dataType.push(what[i].what);
			}
		}
	};

	/**
	 * Moves legend on screen resize to make site responsive
	 * @memberof ViewModel
	 */
	self.changePositionOfLegend = function (){
		var left = google.maps.ControlPosition.LEFT_TOP;
		var bottom = google.maps.ControlPosition.BOTTOM_CENTER;

		if( $(window).width() < 600 && map.controls[left].length === 1){
			map.controls[left].clear();
			map.controls[bottom].push(overlay);
			map.setCenter(initialLocation);
		}else if( $(window).width() > 600 && map.controls[bottom].length === 1){
			map.controls[bottom].clear();
			map.controls[left].push(overlay);
			map.setCenter(initialLocation);
		}

	};

};

view = new ViewModel();

window.addEventListener("resize", view.changePositionOfLegend);

ko.applyBindings(view);