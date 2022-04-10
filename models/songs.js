const mongoose = require('mongoose')
const Schema = mongoose.Schema

const songsSchema = new Schema({
  name: String,
  lyric: String,
  readability_score: Number,
  song_id: String,
  artist: String,
  artist_id: String,
  singers: [{id: String, name: String}],
  series: {id:String, theme:String, name: String} // {id, theme} || {name}
},
  { collection : 'songs' }
)

module.exports = mongoose.model('Songs', songsSchema)