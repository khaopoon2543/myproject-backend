const express = require('express');
const app = express();
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-read-private','user-read-currently-playing']

/* ----------------------------------------------------------------------------------------------------------- */

app.post('/login', async (req,res) => {
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });
  
  const code = req.body.code;
  console.log(code)
  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      console.log(data.body.access_token)
      res.json({
        accessToken : data.body.access_token,
        refreshToken : data.body.refresh_token,
        expiresIn : data.body.expires_in
      })
    })
    .catch(() => {
      res.sendStatus(400)
    })
});

/* ----------------------------------------------------------------------------------------------------------- */
  
module.exports = app;
  