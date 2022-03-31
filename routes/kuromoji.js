const express = require('express');
const app = express();
const kuromoji = require('kuromoji')
const Songs = require('../models/songs');

app.get('/:trackArtist/:trackId', async function(req, res) {
    try {
        console.log("kuromoji")
        const builder =  await kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' })
        let trackId = req.params.trackId.replace(/-/g, ' ');
        let trackArtist = req.params.trackArtist.replace(/-/g, ' ');

        const song_list = await Songs.find({ song_id: trackId, artist_id: trackArtist })
        //res.json(song_list)

        const song_info = song_list[0]
        const title =  { name:song_info.name, artist:song_info.artist }
        builder.build(function(err, tokenizer) {
            if(err){throw err}
            const tokenized = tokenizer.tokenize(song_info.lyric)
            const tokenized_list = JSON.parse(JSON.stringify(tokenized))
            res.status(200).send({ tokenized_list, title });  
        })             

    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;