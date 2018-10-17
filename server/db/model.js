const mongoose = require('mongoose')
const schema = require('./schema');

const Shop = mongoose.model('Shop', schema.Shop)
const User = mongoose.model('User', schema.User)

module.exports = {
  Shop,
  User
}