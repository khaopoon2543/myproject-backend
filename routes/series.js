const express = require('express');
const app = express();
const Series = require('../models/series');

function filterAlpha(alphabet) {
    return { alphabet: { $regex : alphabet, $options: 'i' } }
}
function filterSeries(searchTerm) {
    return {
        $or: [ 
            {series_id: { $regex : searchTerm, $options: 'i' } },
            {name: { $regex : searchTerm, $options: 'i' } }
        ]       
    }
}
function filterSeriesId(searchTerm) {
    return { series_id: searchTerm }
}

app.get('/', async function(req, res) {
    try {
        let alphabet = req.query.alphabet;
        let searchTerm = req.query.searchTerm;
        let subSeries = req.query.subSeries;
        
        if (alphabet) {
            const series_list = await Series.find( filterAlpha(alphabet) )
            return res.status(200).send(series_list)
        } else if (subSeries && searchTerm) {
            const series_list = await Series.findOne( filterSeriesId(searchTerm) )
            return res.status(200).send(series_list)
        } else if (searchTerm) {
            const series_list = await Series.find( filterSeries(searchTerm) )
            return res.status(200).send(series_list)
        }

    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;