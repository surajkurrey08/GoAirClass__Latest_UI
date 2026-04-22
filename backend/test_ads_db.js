const mongoose = require('mongoose');
const Advertisement = require('./models/Advertisement');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
    const ads = await Advertisement.find({ status: 'Active', position: 'SearchTop' }).lean();
    console.log('Total active SearchTop ads:', ads.length);
    ads.forEach(ad => {
        console.log(ad.title + ' | Subtitle: ' + ad.subTitle + ' | Offer: ' + ad.offerText);
    });
    process.exit(0);
});
