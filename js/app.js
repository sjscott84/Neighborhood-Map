'use strict'

var map;

var spots = [
	{name: "Place 1",
	latlng: {lat: 37.7847191, lng: -122.414172}
	},
	{name: "Place 2",
	latlng: {lat: 37.7812488, lng: -122.411304}
	}
];

function initMap(){
	map = new google.maps.Map(document.getElementById('map'),{
		center: {lat:37.773972, lng: -122.431297},
		zoom: 12
	});

	for(var i=0; i<spots.length; i++){
		var marker = new google.maps.Marker({
			position: spots[i].latlng,
			map: map,
			title: spots[i].name
		});
	}
}
