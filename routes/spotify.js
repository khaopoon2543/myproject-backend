const express = require('express');
const app = express();
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-read-private','user-read-currently-playing']


const spotifyApi = new SpotifyWebApi({
  frontendUri: process.env.FRONTEND_URL,
  redirectUri: process.env.REDIRECT_URL,
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

/* ----------------------------------------------------------------------------------------------------------- */

app.get('/login', (req,res) => {
  const html = spotifyApi.createAuthorizeURL(scopes)
  res.send(html+"&show_dialog=true"); 
  //res.redirect(html+"&show_dialog=true") //Authorization Spotify
})

app.get('/callback', async (req,res) => {
  const { code } = req.query;
  console.log(code)
  try {
    const data = await spotifyApi.authorizationCodeGrant(code)
    const { access_token, refresh_token } = data.body;
    spotifyApi.setAccessToken(access_token);
    spotifyApi.setRefreshToken(refresh_token);
    
    res.redirect('http://localhost:3000/home'); //
  } catch(err) {
    res.redirect('/#/error/invalid token');
  }
});

/* ----------------------------------------------------------------------------------------------------------- */

app.get('/home', async (req,res) => {
    try {
      const result = await spotifyApi.getMe()
      const me = result.body
      const image = result.body.images[0].url
      //console.log(me)
      res.status(200).send({me, image})

    } catch (err) {
      res.status(400).send(err)
    }
});
  
app.get('/playing', async (req,res) => {
  try {
    const result = await spotifyApi.getMyCurrentPlayingTrack()
    const name = result.body.item.name
    const artists = result.body.item.artists[0].name
    const image = result.body.item.album.images[0].url
    const url = result.body.item.external_urls.spotify
      
    res.status(200).send({image, name, artists, url})

  } catch (err) {
    res.status(400).send(err)
  }
});

app.get('/playlist', async (req,res) => {
  try {
    const result = await spotifyApi.getPlaylist('37i9dQZEVXbKXQ4mDTEBXq')
    const playlist_name = result.body.name
    const track_item = result.body.tracks.items

    const all_tracks = [];
    track_item.forEach(function(track, index, arr) {
      var track = {};
      track["name"] = result.body.tracks.items[index].track.name;
      track["artist"] = result.body.tracks.items[index].track.artists[0].name;
      track["image"] = result.body.tracks.items[index].track.album.images[0].url;
      track["url"] = result.body.tracks.items[index].track.external_urls.spotify;
      all_tracks.push(track);
    })

    res.status(200).send({playlist_name, all_tracks})

  } catch (err) {
    res.status(400).send(err)
  }
});
  
module.exports = app;
  