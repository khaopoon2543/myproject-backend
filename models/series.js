const mongoose = require('mongoose')
const Schema = mongoose.Schema

const seriesSchema = new Schema({
  alphabet: String,
  name: String,
  type: String,
  series_id: String //key
},
  { collection : 'series' }
)

module.exports = mongoose.model('Series', seriesSchema)