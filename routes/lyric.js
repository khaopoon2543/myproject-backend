const express = require('express');
const app = express();
const Songs = require('../models/songs');

app.get('/:trackArtist/:trackId', async function(req, res) {
    try {
        const { TokenizeMode, tokenize } = await import("sudachi");
        let trackId = req.params.trackId;
        let trackArtist = req.params.trackArtist;

        const song_list = await Songs.find({ song_id: trackId, artist_id: trackArtist })
        //res.json(song_list)
        song_list.map((song_info) => { 
            const title =  { name:song_info.name, artist:song_info.artist }
            const tokenized_list = JSON.parse((tokenize(song_info.lyric, TokenizeMode.C)))   
            res.status(200).send({ tokenized_list, title });                   
        })
    
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;