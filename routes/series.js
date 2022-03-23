const express = require('express');
const app = express();
const Series = require('../models/series');

app.get('/', async function(req, res) {
    try {
        const series_list = await Series.find({})
        res.status(200).send(series_list)
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;