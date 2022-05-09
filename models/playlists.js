const mongoose = require('mongoose')
const Schema = mongoose.Schema

const playlistsSchema = new Schema({
  code: String,
  name: String,
  description: String,
  url: String,
  tracks: [{name: String, artists: String, image:String, url:String}]
},
  { collection : 'playlists' }
)

module.exports = mongoose.model('Playlists', playlistsSchema)