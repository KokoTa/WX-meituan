const fs = require('fs');
const axios = require('axios');
const queryString = require('querystring');
const Shop = require('../db/model').Shop;
const User = require('../db/model').User;

/**
 * 响应函数
 * @param {Object} res res对象
 * @param {Number} code 状态码
 * @param {Any} data 返回的数据
 */
function resMsg(res, code, data) {
  res.statusCode = code;
  res.end(JSON.stringify({
    code: code,
    msg: data
  }));
  return;
}

/**
 * 商家列表查询
 * @param {Object} res res对象 
 * @param {Object} query 查询对象
 * @param {Object} body 请求体对象
 */
function shopFind(res, query, body) {
  const obj = {};
  let order = { id: 1 };

  if (body.category_id) obj.category_id = +body.category_id
  if (body.distance) obj.distance = { '$lt': +body.distance };
  if (body.sort) {
    order = { [body.sort]: -1 }; // 降序
    if (body.order === 'asc') order[body.sort] = 1; // 升序
  }
  if (!query.page || !query.rows) return resMsg(res, 400, 'bad pageor or rows');

  console.log(obj, order, query)

  Shop.find(obj, (err, data) => {
    if (err) return resMsg(res, 500, err);
    return resMsg(res, 200, data);
  })
  .skip((query.page - 1) * query.rows)
  .limit(+query.rows)
  .sort(order);
}

/**
 * 查询商家详情
 * @param {Object} res res对象
 * @param {Object} body 请求体对象
 */
function shopDetail(res, body) {
  if (!body.id) return resMsg(res, 400, 'bad request body')

  Shop.findOne({ id: body.id }, (err, data) => {
    if (err) return resMsg(res, 500, err);
    return resMsg(res, 200, data);
  })
}

/**
 * 验证并解析请求体
 * @param {Object} req req对象
 * @param {Object} res res对象
 * @param {String} str 请求体数据
 */
function parseBody(req, res, str) {
  if (req.headers['content-type'] !== 'application/x-www-form-urlencoded')
    return util.resMsg(res, 400, 'bad request body type');
  // 解析 body string
  return queryString.parse(str);
}

/**
* 检查是否收藏
* @param {Object} res res对象
* @param {Object} body 请求体对象
*/
function checkFavorite(res, body) {
  if (!body.open_id || !body.article_id) return util.resMsg(res, 400, 'bad request body');

  User.findOne({ open_id: body.open_id, article_id: { $in: +body.article_id } }, (err, data) => {
    if (err) return resMsg(res, 500, err);
    if (data) {
      return resMsg(res, 200, true);
    } else {
      return resMsg(res, 200, false);
    }
  })
}

/**
 * 添加收藏
 * @param {Object} res res对象
 * @param {Object} body 请求体对象
 */
function addFavorite(res, body) {
  if (!body.open_id || !body.article_id) return util.resMsg(res, 400, 'bad request body');

  User.findOne({ open_id: body.open_id }, (err, data) => {
    if (err) return resMsg(res, 500, err);
    if (data) {
      // $addToSet 不会插入重复的数据
      User.updateOne({ open_id: body.open_id, $addToSet: { article_id: +body.article_id } }, (err, data) => {
        if (err) return resMsg(res, 404, err);
        if (data.nModified !== 0) {
          data.fav_id = +body.article_id;
        } else {
          data.fav_id = '该收藏已存在';
        }
        return resMsg(res, 200, data);
      })
    } else {
      return resMsg(res, 404, "can't find user");
    }
  })
}

/**
 * 删除收藏
 * @param {Object} res res对象
 * @param {Object} body 请求体对象
 */
function delFavorite(res, body) {
  if (!body.open_id || !body.article_id) return util.resMsg(res, 400, 'bad request body');

  User.findOne({ open_id: body.open_id }, (err, data) => {
    if (err) return resMsg(res, 500, err);
    if (data) {
      User.updateOne({ open_id: body.open_id, $pull: { article_id: +body.article_id } }, (err, data) => {
        if (err) return resMsg(res, 404, err);
        if (data.nModified !== 0) {
          data.fav_id = body.article_id;
        } else {
          data.fav_id = '该收藏已存在';
        }
        return resMsg(res, 200, data);
      })
    } else {
      return resMsg(res, 404, "can't find user");
    }
  })
}

/**
 * 获取收藏列表
 * @param {Object} res res对象
 * @param {Object} body 请求体对象
 */
function getFavoriteList(res, body) {
  if (!body.open_id) return util.resMsg(res, 400, 'bad request body');

  User.findOne({ open_id: body.open_id })
    .populate('articles') // 关联查询请参见 /db/schema.js
    .exec((err, data) => {
      if (err) return resMsg(res, 404, err);
      return resMsg(res, 200, data);
    });
}

/**
 * 检查并获取 access_token
 */
function getAccessToken(appId, appSecret) {
  return new Promise((resolve) => {
    const data = fs.readFileSync('./assets/access_token.json');
    const token = JSON.parse(data);
    const now = new Date().getTime();

    if (token.expires <= now) { // 过期就重新获取 token（因为用的公司项目，所以他们请求了新token，我这里缓存的token就会无效）
      axios.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appId}&secret=${appSecret}`)
        .then((result) => {
          const data = result.data;
          data.expires = now + data.expires_in * 1000;
          fs.writeFileSync('./assets/access_token.json', JSON.stringify(data)); // 写入缓存
          resolve(data.access_token);
        })
    } else { // 没过期就读取缓存
      resolve(token.access_token);
    }
  })
}

module.exports = {
  resMsg,
  shopFind,
  shopDetail,
  parseBody,
  checkFavorite,
  addFavorite,
  delFavorite,
  getFavoriteList,
  getAccessToken
}