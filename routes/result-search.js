const express = require('express');
const app = express();
const Songs = require('../models/songs');
const Series = require('../models/series');

//from spotify ----------------------------------------------------------------
function spotifyAll(searchArtist,searchTerm) {
    const artist = searchArtist.toLowerCase()
    const search = searchTerm
    return { $and: [ //filter match one (and only)
                    {$or: [ 
                        {artist: artist },
                        {artist_id: artist },
                        {singer: artist }
                    ]},
                    {$or: [ 
                        {name: search },
                        {song_id: search }
                    ]}
                ]
            }
    }
function spotifyAllRegex(searchArtist,searchTerm) {
    const artist = searchArtist.toLowerCase()
    const search = searchTerm
    return { $and: [ 
                    {$or: [ 
                        {artist: { $regex : artist, $options: 'i' } },
                        {artist_id: { $regex : artist, $options: 'i' } },
                        {artist: artist },
                        {artist_id: artist },
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
    const artist = searchArtist.toLowerCase()
    return {  $or: [ //filter match one (and only)
                    {artist: artist },
                    {artist_id: artist },
                    {singers: { $elemMatch: { id: artist } } },
                    {singers: { $elemMatch: { name: artist } } }
                ]
            }
    }
function spotifyArtistsRegex(searchArtist) {
    const artist = searchArtist.toLowerCase()
    return {  $or: [ 
                    {artist: { $regex : artist, $options: 'i' } },
                    {artist_id: { $regex : artist, $options: 'i' } },
                    {artist: artist },
                    {artist_id: artist },
                    {singers: { $elemMatch: { id: artist } } },
                    {singers: { $elemMatch: { id: { $regex : artist, $options: 'i'} } } },
                    {singers: { $elemMatch: { name: artist } } },
                    {singers: { $elemMatch: { name: { $regex : artist, $options: 'i'} } } }
                ]
            }
    }


//(default) from SearchForm ----------------------------------------------------------------
function filterAll(searchTerm) {
    return {
        $or: [ 
            {artist: { $regex : searchTerm, $options: 'i' } },
            {artist_id: { $regex : searchTerm, $options: 'i' }},
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
            {artist: { $regex : searchTerm, $options: 'i' }},
            {artist_id: { $regex : searchTerm, $options: 'i' }},
            {singers: { $elemMatch: { id: searchTerm } } },
            {singers: { $elemMatch: { id: { $regex : searchTerm, $options: 'i'} } } },
            {singers: { $elemMatch: { name: searchTerm } } },
            {singers: { $elemMatch: { name: { $regex : searchTerm, $options: 'i'} } } }
        ]       
    }}
function filterArtistId(searchTerm, subArtists) {
    return {
        $or:[
            {$and: [
                {artist: subArtists},
                {artist_id: searchTerm}
            ]},
            {$and: [
                {singers: { $elemMatch: { name: subArtists } } },
                {singers: { $elemMatch: { id: searchTerm } } }
            ]}
        ]
    }}
function filterLyric(searchTerm) {
    return { lyric: { $regex : searchTerm, $options: 'i' } }    
    }

//find levels ----------------------------------------------------------------  
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
function filterLevels(level) { //songs
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

//find series ----------------------------------------------------------------  
function filterSeries(seriesID) { //series (by series_id in 'series')
    return [
        { $match: {series_id: seriesID }},
        { $project: {
            series_info: { name:"$name", type:"$type" }
        }}
    ]}
function filterSeriesId(searchTerm) { //songs (by series.id||series.name in 'songs')
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
        { $project: 
            {
                name: "$name",
                readability_score: "$readability_score",
                artist: "$artist",
                artist_id: "$artist_id",
                song_id: "$song_id",
                singers: "$singers",
                series: "$series",
                series_info: { name:"$series_info.name", type:"$series_info.type" }
            }
        }
    ]}
function filterSeriesName(searchTerm) { //series (by name in 'series')
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
        { $project: 
            {
                name: "$songs_info.name",
                readability_score: "$songs_info.readability_score",
                artist: "$songs_info.artist",
                artist_id: "$songs_info.artist_id",
                song_id: "$songs_info.song_id",
                singers: "$songs_info.singers",
                series: "$songs_info.series",
                series_info: { name:"$name", type:"$type" }
            }
        }
    ]}

async function findSeries(song_list, res) {
    if (song_list.length > 0) {
        try{
            let count = 0; let songArray = [];
            for (i in song_list) {
                let seriesID = song_list[i].series.id
                if (seriesID) {
                    let seriesInfo = await Series.aggregate( filterSeries(seriesID) )
                    let series_info = seriesInfo.length>0 && seriesInfo[0].series_info
                    song_info = JSON.parse(JSON.stringify(song_list[i])); //T__T やったああ
                    song_info.series_info = series_info 
                    songArray.push(song_info)
                } else { songArray.push(song_list[i]) } 
                count ++; if (count===song_list.length) {
                    res.status(200).send(songArray)
                }
            }
        } catch (err) {
            console.log('Error: ', err.message);
            res.status(200).send(song_list)
        }   
    } else {
        res.status(200).send(song_list)
    }
}

const select = { "lyric": 0 }

app.get('/', async function(req, res) {
    try {
        let searchTerm = req.query.searchTerm;
        let searchArtist = req.query.searchArtist;
        let filter = req.query.filter;
        let level = req.query.level;
        let subArtists = req.query.subArtists;
        
        console.log('Connected'+ searchTerm + searchArtist)
        console.log(filter)

        if (filter==='spotify' && searchTerm && searchArtist) { //spotify
            console.log(filter)
            const song_list = await Songs.find( spotifyAll(searchArtist,searchTerm) ).sort({"name": 1}).select(select)
            if (song_list.length>0) {
                findSeries(song_list, res)
            } else {
                const song_list = await Songs.find( spotifyAllRegex(searchArtist,searchTerm) ).sort({"name": 1}).select(select)
                if (song_list.length>0) {
                    findSeries(song_list, res)
                } else {
                    const song_list = await Songs.find( spotifyArtists(searchArtist) ).sort({"name": 1}).select(select)
                    if (song_list.length>0) {
                        findSeries(song_list, res)
                    } else {
                        const song_list = await Songs.find( spotifyArtistsRegex(searchArtist) ).sort({"name": 1}).select(select)
                        findSeries(song_list, res)
                    }
                }
            }

        } else if (filter==='song' && searchTerm) {
            console.log(filter)
            const song_list = await Songs.find( filterSong(searchTerm) ).sort({"name": 1}).select(select)
            findSeries(song_list, res)
        
        } else if (filter==='artist' && subArtists) {
            console.log(filter, subArtists)
            const song_list = await Songs.find( filterArtistId(searchTerm,subArtists) ).sort({"name": 1}).select(select)
            findSeries(song_list, res)                        
        } else if (filter==='artist' && !subArtists && searchTerm) {
            console.log(filter)
            const song_list = await Songs.find( filterArtist(searchTerm) ).sort({"name": 1}).select(select)
            console.log(song_list)
            findSeries(song_list, res)
        
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
            const song_list = await Songs.find( filterLyric(searchTerm) )
            findSeries(song_list, res)
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