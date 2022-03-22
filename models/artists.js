const mongoose = require('mongoose')
const Schema = mongoose.Schema

const artistsSchema = new Schema({
  alphabet: String,
  name: String,
  artist_id: String
},
  { collection : 'artists' }
)

module.exports = mongoose.model('Artists', artistsSchema)