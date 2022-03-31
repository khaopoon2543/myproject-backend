const express = require('express');
const app = express();
const Songs = require('../models/songs');
const Series = require('../models/series');

//from spotify
function spotifyAll(searchArtist,searchTerm) {
    const artist = searchArtist
    const search = searchTerm
    return { $and: [ //filter match one
                    {$or: [ 
                        {artist: { $regex : artist, $options: 'i' } },
                        {artist_id: { $regex : artist, $options: 'i' } },
                        {singer: { $regex : artist, $options: 'i' } },
                        {artist: artist },
                        {artist_id: artist },
                        {singer: artist }
                    ]},
                    {$or: [ 
                        {name: { $regex : search, $options: 'i' } },
                        {song_id: { $regex : search, $options: 'i' } },
                        {name: search },
                        {song_id: search }
                    ]}
                ]
            }
    }
function spotifyArtists(searchArtist) {
    const artist = searchArtist
    return {  $or: [ 
                    {artist: { $regex : artist, $options: 'i' } },
                    {artist_id: { $regex : artist, $options: 'i' } },
                    {singer: { $regex : artist, $options: 'i' } },
                    {artist: artist },
                    {artist_id: artist },
                    {singer: artist }
                ]
            }
    }


//(default) from SearchForm
function filterAll(searchTerm) {
    return {
        $or: [ 
            {artist: { $regex : searchTerm, $options: 'i' } },
            {artist_id: { $regex : searchTerm, $options: 'i' }},
            {singer: { $regex : searchTerm, $options: 'i' }},
            {name: { $regex : searchTerm, $options: 'i' } },
            {song_id: { $regex : searchTerm, $options: 'i' }}
        ]       
    }}
function filterSong(searchTerm) {
    return {
        $or: [ 
            {name: { $regex : searchTerm, $options: 'i' }},
            {song_id: { $regex : searchTerm, $options: 'i' }},
            {name: searchTerm },
            {song_id: searchTerm }
        ]       
    }}
function filterArtist(searchTerm) {
    return {
        $or: [ 
            {artist: searchTerm },
            {artist_id: searchTerm },
            {singer: searchTerm },
            {artist: { $regex : searchTerm, $options: 'i' }},
            {artist_id: { $regex : searchTerm, $options: 'i' }},
            {singer: { $regex : searchTerm, $options: 'i'}}
        ]       
    }}
function filterArtistId(searchTerm) {
    return {
        $or: [ 
            {artist: searchTerm },
            {artist_id: searchTerm },
            {singer: searchTerm }
        ]       
    }}
function filterLyric(searchTerm) {
    return [{ 
        $match:
            { lyric: { $regex : searchTerm, $options: 'i' } }    
        }]
    }
function filterSeriesId(searchTerm) { //Collection 'songs' (by series.id||series.name in 'songs')
    return [
        { $unwind: "$series" },
        { $match: 
            {$or: [
                {"series.id": { $regex : searchTerm, $options: 'i' }},
                {"series.id": searchTerm },
                {"series.name": { $regex : searchTerm, $options: 'i' }}
            ]}
        },
        { $lookup: 
            {
                from: "series",
                localField: "series.id",
                foreignField: "series_id",
                as: "series_info"
            }
        }, { $unwind: "$series_info" },
        { $project: {
                        name: "$name",
                        readability_score: "$readability_score",
                        artist: "$artist",
                        artist_id: "$artist_id",
                        song_id: "$song_id",
                        singer: "$singer",
                        series: "$series",
                        series_info: { name:"$series_info.name", type:"$series_info.type" }
                    }
        }
    ]}
function filterSeriesName(searchTerm) { //Collection 'series' (by name in 'series')
    return [
        { $match: 
            {$or: [
                {name: { $regex : searchTerm, $options: 'i' }},
                {name: searchTerm }
            ]}
        },
        { $lookup: {
                        from: "songs",
                        localField: "series_id",
                        foreignField: "series.id",
                        as: "songs_info"
                    }
        }, { $unwind: '$songs_info' },
        { $project: {
                        name: "$songs_info.name",
                        readability_score: "$songs_info.readability_score",
                        artist: "$songs_info.artist",
                        artist_id: "$songs_info.artist_id",
                        song_id: "$songs_info.song_id",
                        singer: "$songs_info.singer",
                        series: "$songs_info.series",
                        series_info: { name:"$name", type:"$type" }
                    }
        }
    ]}
    
function checkLevel(level) {
    if (level==="very-difficult") {
        return {min:0.5, max:1.49}
    } else if (level==='difficult') {
        return {min:1.5, max:2.49}
    } else if (level==='slightly-difficult') {
        return {min:2.5, max:3.49}
    } else if (level==='so-so') {
        return {min:3.5, max:4.49}
    } else if (level==='easy') {
        return {min:4.5, max:5.49}
    }
    return {min:5.5, max:6.49}
  }
function filterLevels(level) { 
    min_score = checkLevel(level).min
    max_score = checkLevel(level).max
    return [
        { $set: 
            { readability_score: { $toDouble: '$readability_score' }}
        },
        { $match: 
            {readability_score: { $gt: min_score, $lt: max_score }}
        }
    ]}

app.get('/', async function(req, res) {
    try {
        let searchTerm = req.query.searchTerm;
        let searchArtist = req.query.searchArtist;
        let filter = req.query.filter;
        let level = req.query.level;
        let subArtists = req.query.subArtists;
        
        console.log('Connected'+ searchTerm)
        console.log(filter)

        if (filter==='spotify' && searchTerm && searchArtist) { //spotify
            console.log(filter)
            const song_list = await Songs.find( spotifyAll(searchArtist,searchTerm) )
            if (song_list.length==0) {
                const song_list = await Songs.find( spotifyArtists(searchArtist) )
                res.status(200).send(song_list)
            } else {
                res.status(200).send(song_list)
            }

        } else if (filter==='song' && searchTerm) {
            console.log(filter)
            const song_list = await Songs.find( filterSong(searchTerm) )
            res.status(200).send(song_list)
        
        } else if (filter==='artist' && subArtists) {
            console.log(filter, subArtists)
            const song_list = await Songs.find( filterArtistId(searchTerm) )
            res.status(200).send(song_list)
        } else if (filter==='artist' && !subArtists && searchTerm) {
            console.log(filter)
            const song_list = await Songs.find( filterArtist(searchTerm) )
            res.status(200).send(song_list)
        
        } else if (filter==='series' && searchTerm) {
            console.log(filter)
            const song_list = await Songs.aggregate( filterSeriesId(searchTerm) )
            if (song_list.length==0) {
                const song_list = await Series.aggregate( filterSeriesName(searchTerm) )
                res.status(200).send(song_list)
            } else {
                res.status(200).send(song_list)
            }
        
        } else if (filter==='lyric' && searchTerm) {
            console.log(filter)
            const song_list = await Songs.aggregate( filterLyric(searchTerm) )
            res.status(200).send(song_list)
        } else if (filter==='show' && level) {
            console.log(level)
            const song_list = await Songs.aggregate( filterLevels(level) )
            res.status(200).send(song_list)
        } else {
            console.log(filter)
            const song_list = await Songs.find( filterAll(searchTerm) )
            res.status(200).send(song_list)
        }
        
    } catch (err) {
        res.status(400).send(err)
    }   
});

module.exports = app;