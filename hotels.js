var Amadeus = require('amadeus');

var amadeus = new Amadeus({
  clientId: '3xyQmL2am4UnfhaCl8ANuqjassJZo7Vk',
  clientSecret: 'gbtNME6LtQ5Stm09'
});




async function get_hotels(city){
// Get list of Hotels by city code
  let hotel_names=[]
  await amadeus.shopping.hotelOffers.get({
    cityCode: city
  }).then(function (response) {

    for (let i = 0; i < 4; i++) {
      hotelid=response.result.data[i].hotel.hotelId;
    
      hotel_names.push(hotelid)
    }

  }).catch(function (response) {
    console.error(response);
  });
  return hotel_names
}


// Get list of offers for a specific hotel
async function get_details(city){
  let hotel_details=[]
  let hotelids=await get_hotels(city)

  for (let x in hotelids){

  await amadeus.shopping.hotelOffersByHotel.get({
    hotelId: hotelids[x]
    }).then(function (response) {
    // console.log(response.result.data.hotel)
    let name= response.result.data.hotel.name
    let contact=response.result.data.hotel.contact.phone
    // if (response.result.data.hotel.description){
    // description=response.result.data.hotel.description.text
    // }
    // else{
    //   description="Descrition not available"
    // }
    let details=[name,contact]
    hotel_details.push(details)
    }).catch(function (response) {
        console.error(response);
    });
  }
    return hotel_details
}


module.exports={get_details};


