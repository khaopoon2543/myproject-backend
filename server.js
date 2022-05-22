const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

//mongodb connection
const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection;
    db.on('error',(error) => console.error(error))
    db.once('open',() => console.log('Connected to Database'))
app.use(express.json())

app.use(cookieParser());
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
const resultSearchRouter = require('./routes/result-search');
const dictRouter = require('./routes/dict');
const artistsRouter = require('./routes/artists');
const seriesRouter = require('./routes/series');
const lyricRouter = require('./routes/python');

app.use('/api/', spotifyRouter);
app.use('/api/result', resultSearchRouter);
app.use('/api/dict', dictRouter);
app.use('/api/artists', artistsRouter);
app.use('/api/series', seriesRouter);
app.use('/api/lyric', lyricRouter);

//app.get('/', (req, res) => {
    //res.send('APP IS RUNNING')
//});

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(`${__dirname}/./build`));
    app.get('*', (req, res) => {
     res.sendFile(`${__dirname}/./build/index.html`);
    })
}

const PORT = process.env.PORT || 5000;
app.listen(PORT , () => {
    console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;