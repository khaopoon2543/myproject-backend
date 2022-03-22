const mongoose = require('mongoose')
const Schema = mongoose.Schema

const jtdicSchema = Schema({
  Kanji: String,
  Yomikata: String,
  English: String,
  Thai: String,
  Type: [String]
  //populate: [{ type: Schema.Types.ObjectId, ref: 'collection' }]
},
  { collection : 'jtdics' }
)

module.exports = mongoose.model('JTdic', jtdicSchema)