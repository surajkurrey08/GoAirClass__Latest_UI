const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./src/assets/data2.json', 'utf8'));
const data = json.data;
const fareId = Object.keys(data.fares)[0]; // get REGULAR
const fareInfo = data.fares[fareId];
const subTravelOptionBenefits = Object.values(fareInfo.subTravelOptionBenefits)[0];

console.log(JSON.stringify(subTravelOptionBenefits, null, 2));
