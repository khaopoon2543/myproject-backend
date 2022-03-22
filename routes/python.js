const express = require('express');
const app = express();
const Songs = require('../models/songs');

const { spawn } = require('child_process');

app.get("/:trackArtist/:trackId", async (req, res, next) => {
    let data1;
    let trackId = req.params.trackId;
    let trackArtist = req.params.trackArtist;

    const song_list = await Songs.find({ song_id: trackId, artist_id: trackArtist })
    const song_info = song_list[0]
    //console.log(song_info);

    //const title =  { name:song_info.name, artist:song_info.artist }
    const lyric = song_info.lyric 

    const python = spawn('python', ['./routes/python.py']);
 
    //send data to python
    python.stdin.write(JSON.stringify(lyric));
    python.stdin.end();
    
    
    //get data from python
    python.stdout.on('data', (data) => {
        data1 = data.toString();
        //myjson = JSON.parse(data1);
        console.log(data1);
    }); 
    //python.stdout.end();
    
    

    //----------------------------------------------------------------
      
    //check err & close
    python.stderr.on('data', (data) => {
        console.error('err: ', data.toString());
    });
    python.on('error', (error) => {
        console.error('error: ', error.message);
    }); 
    python.on('close', (code) => {
        console.log('child process exited with code ', code);
        res.send(data1)
    });

});

module.exports = app;