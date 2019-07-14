console.log('keys.js is loaded.');

var spotify = {
    id: process.env.Spotify_Client_ID,
    secret: process.env.Spotify_Client_Secret,
  }
    
  module.exports = {
    spotify: spotify,
  };
  