const mongoose = require('mongoose')

const Shop = new mongoose.Schema({
  id: Number,
  name: String,
  title: String,
  distance: Number,
  category_id: Number,
  description: String,
})

const User = new mongoose.Schema({
  open_id: String,
  article_id: Array,
}, { toJSON: { virtuals: true } })

// 通过虚拟外键进行关联
// https://stackoverflow.com/questions/19287142/populate-a-mongoose-model-with-a-field-that-isnt-an-id
// 将 User 的 article_id 与 Shop 的 id 进行关联，关联得到的结果存放到 User 的 articles 中
User.virtual('articles', {
  ref: 'Shop',
  localField: 'article_id',
  foreignField: 'id'
});

module.exports = {
  Shop,
  User
}