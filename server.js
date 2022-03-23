const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const bodyParser = require('body-parser');

//mongodb connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection;
    db.on('error',(error) => console.error(error))
    db.once('open',() => console.log('Connected to Database'))
app.use(express.json())

app.use(cors());
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Credentials', true); 
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
})

const spotifyRouter = require('./routes/spotify');
const resultsearchRouter = require('./routes/resultsearch');
const lyricRouter = require('./routes/lyrics');
const dictRouter = require('./routes/dict');
const artistsRouter = require('./routes/artists');
const seriesRouter = require('./routes/series');

app.use('/', spotifyRouter);
app.use('/lyric', lyricRouter);
app.use('/result', resultsearchRouter);
app.use('/dict', dictRouter);
app.use('/artists', artistsRouter);
app.use('/series', seriesRouter);

app.listen(5000, () => {
    console.debug('App listening on :5000');
});

module.exports = app;