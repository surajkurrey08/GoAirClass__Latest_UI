const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./src/assets/data2.json', 'utf8'));
const data = json.data;
const fareId = Object.keys(data.fares)[0]; // get REGULAR
const fareInfo = data.fares[fareId];
const subTravelOptionBenefits = Object.values(fareInfo.subTravelOptionBenefits)[0];
const flightBenefits = subTravelOptionBenefits.flightBenefits || {};

const baggageList = [];
const baggageAllowancesMap = data.baggageAllowances || {};

Object.values(flightBenefits).forEach(segBenefit => {
    const allowances = segBenefit.baggageAllowances || [];
    allowances.forEach(allowance => {
        const bId = allowance.baggageAllowanceId;
        const bDetails = baggageAllowancesMap[bId];
        console.log('bId:', bId);
        console.log('bDetails exists?', !!bDetails, 'type:', Array.isArray(bDetails) ? 'array' : typeof bDetails);
        if (bDetails) {
            bDetails.forEach(b => {
                const bagType = b.type === 'BAGGAGE_CABIN' || b.type === 'Cabin' ? 'Cabin' : 'Check-in';
                const spec = b.allowedBaggages?.[0] || {};
                const weight = spec.quantity !== undefined ? spec.quantity + ' ' + (spec.unit || 'KG') : 'Policy Info';
                baggageList.push({ type: bagType, weight });
            });
        }
    });
});
console.log('BAGGAGE LIST:', baggageList);
