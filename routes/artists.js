const express = require('express');
const app = express();
const Artists = require('../models/artists');

app.get('/', async function(req, res) {
    try {
        const artists_list = await Artists.find({})
        res.status(200).send(artists_list)
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;