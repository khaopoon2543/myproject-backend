const express = require('express');
const app = express();
const Artists = require('../models/artists');

function filterAlpha(alphabet) {
    return { alphabet: { $regex : alphabet, $options: 'i' } }
}
function filterArtists(searchTerm) {
    return {
        $or: [ 
            {artist_id: { $regex : searchTerm, $options: 'i' }},
            {name: { $regex : searchTerm, $options: 'i' } }
        ]       
    }
}

app.get('/', async function(req, res) {
    try {
        let alphabet = req.query.alphabet;
        let searchTerm = req.query.searchTerm;

        if (alphabet) {
            const artists_list = await Artists.find( filterAlpha(alphabet) )
            res.status(200).send(artists_list)
        } else if (searchTerm) {
            const artists_list = await Artists.find( filterArtists(searchTerm) )
            res.status(200).send(artists_list)
        }
                  
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;