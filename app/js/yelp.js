
function yelpHell (what, where, position){

	function nonce_generate() {
		return (Math.floor(Math.random() * 1e12).toString());
	}

	var yelp_url = 'https://api.yelp.com/v2/search?';
	var terms = what.join(', ');
	console.log(terms);

	var parameters = {
		term: terms,
		location: where,
		cll: position,
		radius_filter: 1609,
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
		},
		error: function(error) {
		// Do stuff on fail
		console.log(error);
		}
	};

	// Send AJAX query via jQuery library.
	$.ajax(settings);
}