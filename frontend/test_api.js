fetch('http://localhost:5000/api/flights/airports/search?name=nyc')
  .then(res => res.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(err => console.error(err.message));
