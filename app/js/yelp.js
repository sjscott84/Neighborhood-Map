/**
 * Call to Yelp API to get search results
 * @param {string} what - a string of catagories for Yelp tp search for
 * @param {string} where - the name of the location yelp uses as a searh point
 * @param {string} position - the latitude and longitude for yelp to search
 * @param {array} getGoogle - catagories for the Google Places API to search for if Yelp fails
 * @param {object} viewModel - the viewModel from app.js
 */
function yelpHell (what, where, position, getGoogle, viewModel){
	var radiusInMeters = 5000,
		setTimeoutTime = 5000;

	//Generate random number for each call to Yelp API
	function nonce_generate() {
		return (Math.floor(Math.random() * 1e12).toString());
	}

	//function to handle error when call to yelp api fails
	var yelpError = setTimeout(function(){
		alert("Yelp is currently unavailable, results will come from Google");
		viewModel.findThings(getGoogle);
		yelpData = {};
		return;
	}, setTimeoutTime);

	var yelp_url = 'https://api.yelp.com/v2/search?';

	var parameters = {
		//term: terms,
		category_filter: what,
		location: where,
		cll: position,
		limit: 20,
		offset: 20,
		radius_filter: radiusInMeters,
		sort: 2,
		oauth_consumer_key: 'eOiRip_OTWAQMok1jVmN0w',
		oauth_token: 'IqSuxajKL9sRic-mc_nzpQBLdxdTNdfA',
		oauth_nonce: nonce_generate(),
		oauth_timestamp: Math.floor(Date.now()/1000),
		oauth_signature_method: 'HMAC-SHA1',
		callback: 'cb'
	};

	var consumer_secret = 'XNTpfWaUXwNH_iHF4DrH923nzts',
	token_secret = 'paG-lPKZ9fQxhJz6ZEh42nBttiA';

	var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, consumer_secret, token_secret);
	parameters.oauth_signature = encodedSignature;

	var settings = {
		url: yelp_url,
		data: parameters,
		cache: true,
		dataType: 'jsonp',
		jsonpCallback: 'cb',
		success: function(results) {
			yelpData = Object.assign({}, results);
			console.log("SUCCCESS! %o", results);
			viewModel.displayPlaces();
			clearTimeout(yelpError);
		}
		//error: on error the yelpError function is called
	};

	// Send AJAX query via jQuery library.
	$.ajax(settings);
}