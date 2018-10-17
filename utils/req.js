const api = require('./api');
const baseUrl = 'http://localhost:3000';

const get = (options = {}) => {
  return api.request({
    ...options,
    method: 'get',
  }).then(res => res.data);
}

const post = (options = {}) => {
  if (!options.headers) options.headers = {};
  return api.request({
    ...options,
    method: 'post',
    header: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }).then(res => res.data);
}

/**
 * 获取商家列表
 * @param {Object} options 选项对象
 * @param {Object} query 查询参数对象
 * @returns Promise
 */
exports.getShops = (options, query = { page: 1, rows: 20 }) => {
  return post({
    data: {
      ...options
    },
    url: `${baseUrl}/article/shoplist?page=${query.page}&rows=${query.rows}`
  });
}

/**
 * 获取商家详情
 * @param {Object} options 选项对象
 */
exports.getShopDetail = (options) => {
  return post({
    data: {
      ...options
    },
    url: `${baseUrl}/article/detail`
  });
}

/**
 * 登录获取用户详情
 * @param {Object} userInfo 用户基本信息
 */
exports.login = (userInfo) => {
  return api.login().then((res) => {
    return get({
      url: 'http://localhost:3000/login',
      header: {
        'X-WX-Code': res.code,
        'X-WX-Encrypted-Data': userInfo.encryptedData,
        'X-WX-IV': userInfo.iv,
      }
    })
  }).then((res) => {
    if (res.code === 200) {
      wx.setStorageSync('userInfo', res.msg);
      return res.msg;
    } else {
      throw res;
    }
  });
}

/**
 * 检查是否已收藏
 * @param {Object} options open_id 和 article_id
 */
exports.checkFavorite = (options) => {
  return post({
    url: `${baseUrl}/checkFavorite`,
    data: {
      ...options
    }
  }).then(res => res);
}

/**
 * 添加收藏
 * @param {Object} options open_id 和 article_id
 */
exports.addFavorite = (options) => {
  return post({
    url: `${baseUrl}/addFavorite`,
    data: {
      ...options
    }
  }).then(res => res);
}

/**
 * 取消收藏
 * @param {Object} options open_id 和 article_id
 */
exports.delFavorite = (options) => {
  return post({
    url: `${baseUrl}/delFavorite`,
    data: {
      ...options
    }
  }).then(res => res);
}

/**
 * 获取收藏列表
 * @param {Object} options open_id
 */
exports.getFavoriteList = (options) => {
  return post({
    url: `${baseUrl}/getFavoriteList`,
    data: {
      ...options
    }
  }).then(res => res);
}