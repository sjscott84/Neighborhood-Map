function getMarker (catagory){
	var icon;
	switch (catagory){
		case 'park':
			icon = 'images/forest2.png';
			break;
		case 'Parks':
			icon = 'images/forest2.png';
			break;
		case 'zoo':
			icon = 'images/zoo.png';
			break;
		case 'Playgrounds':
			icon = 'images/playground.png';
		case 'Gardens':
			icon = 'images/flowers.png';
			break;
		case 'Farms':
			icon = 'images/farm-2.png';
			break;
		case 'Observatories':
			icon = 'images/planetarium-2.png';
			break;
		case 'Beaches':
			icon = 'images/beach.png';
			break;
		case 'Hiking':
			icon = 'images/hiking.png';
			break;
		case 'Horseback Riding':
			icon = 'images/horseriding.png';
			break;
		case 'Skating Rinks':
			icon = 'images/iceskating.png';
			break;
		case 'Swimming Pools':
			icon = 'images/swimming.png';
			break;
		case 'Water Parks':
			icon = 'images/waterpark.png';
			break;
		case 'art_gallery':
			icon = 'images/art-museum-2.png';
			break;
		case 'library':
			icon = 'images/library.png';
			break;
		case 'museum':
			icon = 'images/museum_crafts.png';
			break;
		case 'Art Galleries':
			icon = 'images/art-museum-2.png';
			break;
		case 'Cultural Center':
			icon = 'images/country.png';
			break;
		case 'Museums':
			icon = 'images/museum_crafts.png';
			break;
		case 'Planetarium':
			icon = 'images/planetarium-2.png';
			break;
		case 'Wineries':
			icon = 'images/winebar.png';
			break;
		case 'Landmarks & Historical Buildings':
			icon = 'images/landmark.png';
			break;
		case 'amusement_park':
			icon = 'images/themepark.png';
			break;
		case 'bowling_alley':
			icon = 'images/bowling.png';
			break;
		case 'Arcades':
			icon = 'images/videogames.png';
			break;
		case 'Haunted Houses':
			icon = 'images/ghosttown.png';
			break;
		case 'Amusement Parks':
			icon = 'images/themepark.png';
			break;
		case 'Carousels':
			icon = 'images/carousel.png';
			break;
		case 'Go Karts':
			icon = 'images/go-kart.png';
			break;
		case 'Mini Golf':
			icon = 'images/golfing.png';
			break;
		case 'Skating Rinks':
			icon = 'images/iceskating.png';
			break;
		case 'aquarium':
			icon = 'images/aquarium.png';
			break;
		case 'Aquariums':
			icon = 'images/aquarium.png';
			break;
		case 'Diving':
			icon = 'images/scubadiving.png';
			break;
		case 'Fishing':
			icon = 'images/fishing.png';
			break;
		case 'Snorkeling':
			icon = 'images/snorkeling.png';
			break;
		case 'Zoos':
			icon = 'images/zoo.png'
			break;
		case 'Dog Parks':
			icon = 'images/pets.png'
			break;
		case 'Botanical Gardens':
			icon = 'images/flowers.png';
			break;
		case 'Wine Tasting Room':
			icon = 'images/winebar.png';
			break;
		default:
			icon = 'images/undefined.png';
	}
	return icon;
}