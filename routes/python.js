const express = require('express');
const app = express();
const Songs = require('../models/songs'); 

const { spawn } = require('child_process');

app.get("/:trackArtist/:trackId", async (req, res) => {
    try {

    let trackId = req.params.trackId.replace(/-/g," ");
    let trackArtist = req.params.trackArtist.replace(/-/g," ");  

    const song_info = await Songs.findOne({ song_id: trackId, artist_id: trackArtist })
    //console.log(song_info); 
    const title_info =  { "name":song_info["name"], "artist":song_info["artist"], "readability_score":song_info["readability_score"] }

    if ("singer" in song_info) {
        title_info["singer"] = song_info["singer"]
    } if ("series" in song_info) {
        title_info["series"] = song_info["series"]
    }
   
    const lyric = song_info["lyric"]
    const pythonProcess = spawn('python', ['./routes/script.py', lyric]);
 
    const stdout = [] 
    const stderr = []

    //get data from python  
    pythonProcess.stdout.on('data', (data) => {
        stdout.push(data.toString()); //change buffer --> array (string)
    });  
     
    //error
    pythonProcess.stderr.on('data', (data) => {
        stderr.push(data.toString()) 
    });

    //close
    pythonProcess.on('close', (code) => {
        console.log('child process exited with code ', code);

        if (code !== 0) { return reject(stderr.join('')) } //return ERROR

        const json_token_list = JSON.parse(stdout.join(''))
        const dict_data = { "title": title_info, "tokenized_list": json_token_list }
        return res.send(dict_data) 
    });

    } catch (err) {
        res.status(400).send(err)
    }

});


//add function input lyrics by user 
app.get("/", async (req, res) => {
    try {
    const lyric = req.query.lyric;

    const pythonProcess = spawn('python', ['./routes/script.py', lyric]);
 
    const stdout = [] 
    const stderr = []

    //get data from python  
    pythonProcess.stdout.on('data', (data) => {
        stdout.push(data.toString()); //change buffer --> array (string)
    });  
     
    //error
    pythonProcess.stderr.on('data', (data) => {
        stderr.push(data.toString()) 
    });

    //close
    pythonProcess.on('close', (code) => {
        console.log('child process exited with code ', code);

        if (code !== 0) { return reject(stderr.join('')) } //return ERROR

        const json_token_list = JSON.parse(stdout.join(''))
        const dict_data = { "tokenized_list": json_token_list }
        return res.send(dict_data) 
    });

    } catch (err) {
        res.status(400).send(err)
    }

});

module.exports = app;