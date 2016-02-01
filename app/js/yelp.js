function getYelp(){

var auth = {
    consumerKey : "eOiRip_OTWAQMok1jVmN0w",
    consumerSecret : "XNTpfWaUXwNH_iHF4DrH923nzts",
    accessToken : "IqSuxajKL9sRic-mc_nzpQBLdxdTNdfA",
    accessTokenSecret : "paG-lPKZ9fQxhJz6ZEh42nBttiA",
    serviceProvider : {
        signatureMethod : "HMAC-SHA1"
    }
};

var terms = 'food';
var near = 'San+Francisco';

var accessor = {
    consumerSecret : auth.consumerSecret,
    tokenSecret : auth.accessTokenSecret
};
parameters = [];
parameters.push(['term', terms]);
parameters.push(['location', near]);
parameters.push(['callback', 'cb']);
parameters.push(['oauth_consumer_key', auth.consumerKey]);
parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
parameters.push(['oauth_token', auth.accessToken]);
parameters.push(['oauth_signature_method', 'HMAC-SHA1']);

var message = {
    'action' : 'http://api.yelp.com/v2/search',
    'method' : 'GET',
    'parameters' : parameters
};

OAuth.setTimestampAndNonce(message);
OAuth.SignatureMethod.sign(message, accessor);

var parameterMap = OAuth.getParameterMap(message.parameters);
console.log(parameterMap);

$.ajax({
    'url' : message.action,
    'data' : parameterMap,
    'cache' : true, 
    'dataType' : 'jsonp',
    'jsonpCallback' : 'cb',
    'success' : function(data, textStats, XMLHttpRequest) {
        console.log(data);
            //if(data) {
                //var hits = data.businesses,
                    //item_str = '<li>%name%</li>';
                //hits.forEach(function(result) { $('#results').append(item_str.replace('%name%', result.name))
                //});
            //}
    },
    'error' : function(error) {                                       $('#error').css('opacity', '1');
    }
});

};

function yelpHell (){

function nonce_generate() {
  return (Math.floor(Math.random() * 1e12).toString());
}

var yelp_url = 'https://api.yelp.com/v2/search?';

  var parameters = {
    term: 'food',
    location: 'chicago',
    oauth_consumer_key: 'eOiRip_OTWAQMok1jVmN0w',
    oauth_token: 'IqSuxajKL9sRic-mc_nzpQBLdxdTNdfA',
    oauth_nonce: nonce_generate(),
    oauth_timestamp: Math.floor(Date.now()/1000),
    oauth_signature_method: 'HMAC-SHA1',
    callback: 'cb'             // This is crucial to include for jsonp implementation in AJAX or else the oauth-signature will be wrong.
  };
  
  var consumer_secret = 'XNTpfWaUXwNH_iHF4DrH923nzts',
      token_secret = 'paG-lPKZ9fQxhJz6ZEh42nBttiA';
      
  var encodedSignature = oauthSignature.generate('GET',yelp_url, parameters, consumer_secret, token_secret);
  parameters.oauth_signature = encodedSignature;

  var settings = {
    url: yelp_url,
    data: parameters,
    cache: true,                // This is crucial to include as well to prevent jQuery from adding on a cache-buster parameter "_=23489489749837", invalidating our oauth-signature
    dataType: 'jsonp',
    jsonpCallback: 'cb',
    success: function(results) {
      // Do stuff with results
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