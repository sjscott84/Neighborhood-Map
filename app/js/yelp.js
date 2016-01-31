function getYelp (){

var auth = { 
    consumerKey: "eOiRip_OTWAQMok1jVmN0w", 
    consumerSecret: "XNTpfWaUXwNH_iHF4DrH923nzts",
    accessToken: "fNMk6EljaWsV_EhC2i4xYMv-7F8H6-AX",
    accessTokenSecret: "64tZFy6LdGR_sTdA1iy56FzIVLo",
  };

  var terms = 'food';
  var near = 'San+Francisco';

  var accessor = {
    consumerSecret: auth.consumerSecret,
    tokenSecret: auth.accessTokenSecret
  };

  var parameters = [];
  parameters.push(['term', terms]);
  parameters.push(['location', near]);
  parameters.push(['oauth_consumer_key', auth.consumerKey]);
  parameters.push(['oauth_consumer_secret', auth.consumerSecret]);
  parameters.push(['oauth_token', auth.accessToken]);

  var message = { 
    'action': 'http://api.yelp.com/v2/search',
    'method': 'GET',
    'parameters': parameters 
  };

  OAuth.setTimestampAndNonce(message);  

  OAuth.SignatureMethod.sign(message, accessor);

  var parameterMap = OAuth.getParameterMap(message.parameters);
  parameterMap.oauth_signature = OAuth.percentEncode(parameterMap.oauth_signature);

  var url = OAuth.addToURL(message.action,parameterMap);
  var response = UrlFetchApp.fetch(url).getContentText();
  var responseObject = Utilities.jsonParse(response);
  
  console.log(responseObject);

};

getYelp();