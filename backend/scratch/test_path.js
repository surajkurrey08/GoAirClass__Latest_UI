const path = require('path');
const url = '/uploads/videos/file.mp4';
const dirname = 'C:\\Users\\ADMIN\\Documents\\goairclass_update\\backend\\controllers';
const joined = path.join(dirname, '..', url);
console.log('Joined:', joined);
