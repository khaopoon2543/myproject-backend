const express = require('express');
const app = express();
const Songs = require('../models/songs');

app.get('/:trackArtist/:trackId', async function(req, res) {
    try {
        const { TokenizeMode, tokenize } = await import("sudachi");
        const { toHiragana } =  await import("wanakana");
        let trackId = req.params.trackId;
        let trackArtist = req.params.trackArtist;
        
        const song_list = await Songs.find({ song_id: trackId, artist_id: trackArtist })
        //res.json(song_list)
        const song_info = song_list[0]
        const title =  { name:song_info.name, artist:song_info.artist, readability_score:song_info.readability_score }
        const tokenized_list = JSON.parse((tokenize(song_info.lyric, TokenizeMode.C)))  

        tokenized_list.map((word, index) => { 
            if (word.dictionary_form !== word.surface) {
                //console.log(toHiragana(word.dictionary_form, { passRomaji: true }))
                const kana = toHiragana(word.dictionary_form, { passRomaji: true })
                tokenized_list[index]["dictionary_form"] = kana;
            }  
        })

        res.status(200).send({ tokenized_list, title })                  
        
    
    } catch (err) {
        assert.isNotOk(error,'Promise error');
        done();
        res.status(400).send(err)
    }   
});

module.exports = app;