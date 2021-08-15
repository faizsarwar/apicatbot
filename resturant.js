const request = require('request');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

async function get_resturants(latitude,longitude){
const options = {
  method: 'GET',
  url: 'https://resy.p.rapidapi.com/4/find',
  qs: {
    lat: latitude,
    long: longitude,
    day: '2021-02-14',
    party_size: '2',
    offset: '0'
  },
  headers: {
    'x-rapidapi-key': 'be003229f3mshbcc6f7dc35c54d2p19ee35jsn50fe864bda4b',
    'x-rapidapi-host': 'resy.p.rapidapi.com',
    useQueryString: true
  }
};
var venue_name_and_rating=[]
request(options, function (error, response, body) {
	if (error) throw new Error(error);

  data=JSON.parse(body)
  venues_list=data.results.venues
  for(let i=0;i<4;i++){
    venue_name_and_rating.push(venues_list[i].venue.name)
    venue_name_and_rating.push(venues_list[i].venue.rating)
  }
});
  // setTimeout(()=>{ console.log(venue_name_and_rating)},8000)
  await delay(8000)
  console.log(venue_name_and_rating,"restu")
  return venue_name_and_rating
}

module.exports={get_resturants};
