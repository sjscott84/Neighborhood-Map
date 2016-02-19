# Neighborhood Map Project

This Udacity project was to build a neighborhood map using google maps and various third party apis.

This particular project is to find fun and interesting thigs to do within walking distance of a set point, which the user enters into the search box.

The results come from either the Yelp API or the Google Place API if Yelp is unavalibale for some reason, and are filtered by the following criteria:

	* Yelp API results must have a rating of at least 3.5 out of 5
	* Google Places API results must have a rating of at least 3 out of 5
	* Results from the Yelp API must be open now
	* Google Places API is ranked by distance from starting location
	* Yelp API has a radius filter to limit results to walking distance but is ranked by rating

From the results, with one click the user can find out the rating of attraction, the walking time and distance, the route and the catagory. From there they can click "Show Directions" to see the step by step walking directions to attraction.

Once results have been retrieved they are automatically saved to local storage and displayed on reload.  However, a new search can easily be done by entering a new starting location or catagory.

This can be used for anywhere in the world, however, it works best in major cities as it is designed to find things within walking distance and will only provide walking directions.

## Install

No installation needed simply go to ...

## Known Issues

The data returned from the Yelp API can be inconsistant.  I found a few times there were places that I would expect to be returned based on my search criteria but were not being returned.  Apparantly the Yelp website and Yelp API use different algorithms so it can be difficult to get exact search results when using the Yelp API.

Also, as I use filters to only show highly rated attractions, if Yelp fails and results come from the Google Places API, there may not be very many results as anything not reviewed on google gets excluded.


## Technical

Technical details for this site can be found at...
