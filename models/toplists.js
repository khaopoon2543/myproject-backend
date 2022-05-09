const mongoose = require('mongoose')
const Schema = mongoose.Schema

const topListsSchema = new Schema({
    series: [{ series_id: String, name: String }],
    artists: [{ artist_id: String, name: String }]
},
  { collection : 'toplists' }
)

module.exports = mongoose.model('TopLists', topListsSchema)