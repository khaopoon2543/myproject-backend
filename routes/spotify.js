const express = require('express');
const app = express();

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
  