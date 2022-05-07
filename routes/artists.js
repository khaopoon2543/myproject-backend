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
function filterArtistsOne(searchTerm) {
    return {
        $or: [ 
            {artist_id: searchTerm},
            {name: searchTerm}
        ]       
    }
}
function filterArtistsId(searchTerm) {
    return {artist_id: searchTerm}
}

app.get('/', async function(req, res) {
    try {
        let alphabet = req.query.alphabet;
        let searchTerm = req.query.searchTerm;
        let spotify = req.query.spotify;
        let subArtists = req.query.subArtists;

        if (alphabet) {
            const artists_list = await Artists.find( filterAlpha(alphabet) )
            return res.status(200).send(artists_list)
        } else if (spotify && searchTerm) {
            const artists_list = await Artists.find( filterArtistsOne(searchTerm) )
            if (artists_list.length>0) {
                return res.status(200).send(artists_list)
            } else {
                const artists_list = await Artists.find( filterArtists(searchTerm) )
                return res.status(200).send(artists_list)
            }
        } else if (subArtists && searchTerm) {
            const artists_list = await Artists.findOne( filterArtistsId(searchTerm) )
            return res.status(200).send(artists_list)
        } else if (searchTerm) {
            const artists_list = await Artists.find( filterArtists(searchTerm) )
            return res.status(200).send(artists_list)
        }
                  
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;