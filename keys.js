//console.log('keys.js is loaded.');

var spotify = {
    id: process.env.Spotify_Client_ID,
    secret: process.env.Spotify_Client_Secret,
  }

  var omdb = process.env.OMDB_KEY;

  var bandsintown = process.env.BAND_IN_TOWN_KEY;
    
  module.exports = {
    spotify: spotify,
    omdb: omdb,
    bandsintown: bandsintown,
  };
  