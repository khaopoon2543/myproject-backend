const mongoose = require('mongoose')
const Schema = mongoose.Schema

const seriesSchema = new Schema({
  alphabet: String,
  name: String,
  type: String,
  serie_id: String
},
  { collection : 'series' }
)

module.exports = mongoose.model('Series', seriesSchema)