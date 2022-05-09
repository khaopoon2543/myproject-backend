const express = require('express');
const app = express();
require('dotenv').config();
const SpotifyWebApi = require('spotify-web-api-node');
scopes = ['user-read-private','user-read-currently-playing']

/* ----------------------------------------------------------------------------------------------------------- */

app.post('/refresh', async (req,res) => {
  console.log('hi')
  const refreshToken = req.body.refreshToken
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    refreshToken,
  });

  spotifyApi.refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken : data.body.access_token,
        expiresIn : data.body.expires_in
      })
    })
    .catch(() => {
      res.sendStatus(400)
    })
});

app.post('/login', async (req,res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URL,
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });
  
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


const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URL,
});

app.post('/login2', async (req,res) => {
  const code = req.body.code;
  console.log(code)
  spotifyApi.authorizationCodeGrant(code)
    .then(data => {
      const { access_token, refresh_token } = data.body;
      //console.log(access_token, refresh_token)
      spotifyApi.setAccessToken(access_token);
      spotifyApi.setRefreshToken(refresh_token);
      return res.status(200).send('ACCESS!')
    })
    .catch(() => {
      res.sendStatus(400)
    })
});

function collectedTrack(trackList, res) {
  let trackArray = []
  for (let i = 0; i < trackList.length; i++) { 
      let trackInfo = {}
      trackInfo.img = trackList[i].album.images[0].url
      trackInfo.artist = trackList[i].artists[0].name
      trackInfo.name = trackList[i].name
      trackInfo.url = trackList[i].external_urls.spotify
      trackArray.push(trackInfo)
  }
  return  res.status(200).send(trackArray)
}
app.get('/search', async (req,res) => {
    try {
      let trackArtist = req.query.trackArtist;
      let trackName = req.query.trackName;
      let trackArtistId = req.query.trackArtistId;
      console.log(trackArtist, trackName, trackArtistId)

      const result = await spotifyApi.searchTracks('track:'+ trackName + ' artist:' + trackArtistId ,{ limit: 5 }) //query artist EN
      const trackList = result.body.tracks.items
      if (trackList.length > 0) {
        collectedTrack(trackList, res)
      } else {
        const result = await spotifyApi.searchTracks('track:'+ trackName + ' artist:' + trackArtist ,{ limit: 5 }) //query artist JP
        const trackList = result.body.tracks.items
        if (trackList.length > 0) {
          collectedTrack(trackList, res)
        } else {
          const result = await spotifyApi.searchTracks(trackName ,{ limit: 5 }) //query only track name
          const trackList = result.body.tracks.items
          collectedTrack(trackList, res)
        }
      }
    } catch (err) {
      console.log(err)
    }
});

//SAVE FILE PREPARE TO COLLECT IN DATABASE!
//app.post('/save', async (req,res) => {
  //const json = await req.body.json;
  //const fs = require('fs')
  //if (json) {
    //fs.writeFileSync('./playlist2.json', JSON.stringify(json))
    //res.status(200).send('ADD ALREADY')
  //} 
//});

const Playlists = require('../models/playlists');
app.get('/playlists', async (req,res) => {
  try {
    let code = req.query.code;
    console.log(code)

    if (code) {
        const playlist_info = await Playlists.findOne( {code: code} )
        return res.status(200).send(playlist_info)
    }         
  } catch (err) {
      res.status(400).send(err)
  } 
});

/* --------- ไม่เกี่ยวกับ Spotify แต่รีบมากจ้า  ----------- */

const TopLists = require('../models/toplists');
app.get('/toplists', async (req,res) => {
  try {
    const all_list = await TopLists.find()
    return res.status(200).send(all_list)
    
  } catch (err) {
      res.status(400).send(err)
  } 
});


/* ----------------------------------------------------------------------------------------------------------- */
  
module.exports = app;
  