
function yelpHell (what, where, position, getGoogle){

	function nonce_generate() {
		return (Math.floor(Math.random() * 1e12).toString());
	}

	var yelpError = setTimeout(function(){
		alert("Yelp is currently unavailable, results will come from Google")
		view.findThings(getGoogle);
		;}, 5000);

	var yelp_url = 'https://api.yelp.com/v2/search?';
	//var terms = what.join(', ');
	console.log(what);

	var parameters = {
		//term: terms,
		category_filter: what,
		location: where,
		cll: position,
		//limit: 20,
		offset: 20,
		radius_filter: 10000, //1609,
		sort: 2,
		oauth_consumer_key: 'eOiRip_OTWAQMok1jVmN0w',
		oauth_token: 'IqSuxajKL9sRic-mc_nzpQBLdxdTNdfA',//added ! for error testing
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
			view.displayPlaces();
			clearTimeout(yelpError);
		}
		//error: function(jqXHR, textStatus, errorThrown) {
			// Do stuff on fail
			//alert("Yelp is currently unavailable, results will come from Google")
			//findThings(yelpError);
			//console.log(jqXHR);
		//}
	};

	// Send AJAX query via jQuery library.
	$.ajax(settings);

}