function getWeather (state, city){
	jQuery(document).ready(function($) {
		$.ajax({
			url : "http://api.wunderground.com/api/ac44691336e9176f/geolookup/conditions/hourly/q/"+state+"/"+city+".json",
			dataType : "jsonp",
			success : function(parsed_json) {
				var currentCondition = parsed_json['current_observation']['weather'];
				var currentIcon = parsed_json['current_observation']['icon_url'];
				var currentTemp = parsed_json['current_observation']['temp_f']
				var forecast = parsed_json['hourly_forecast'];
				var forecastTime = [];
				var forecastCondition = [];
				var forecastIcon = [];
				var forecastTemp = [];

				for (var i = 0; i < 13; i++){
					forecastTime.push(forecast[i]['FCTTIME']['civil']);
					forecastCondition.push(forecast[i]['condition']);
					forecastIcon.push(forecast[i]['icon_url']);
					forecastTemp.push(forecast[i]['temp']['english']);
				}

				view.showWeather(currentCondition, currentTemp, currentIcon, forecastCondition, forecastTime, forecastIcon, forecastTemp);
			}
		});
	});
}