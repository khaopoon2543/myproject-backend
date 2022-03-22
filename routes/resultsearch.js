const express = require('express');
const app = express();
const Songs = require('../models/songs');

app.get('/', async function(req, res) {
    try {
        const song_list = await Songs.find({})
        res.status(200).send(song_list)
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;