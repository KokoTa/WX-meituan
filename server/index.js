const axios = require('axios');
const http = require('http');
const url = require('url');
const queryString = require('querystring');
const util = require('./util/util');
const WXBizDataCrypt = require('./libs/WXBizDataCrypt');

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/test', { useNewUrlParser: true });
const db = mongoose.connection;
db.on('error', () => console.error('connect fail'));
db.on('open', () => console.log('connect success'));

// 方便起见，全部写到了一起
const server = http.createServer((req, res) => {

  // 返回的都是 json 数据，并且允许跨域
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // 解析 url
  const reqUrl = url.parse(req.url);

  /**
   * 获取商家列表
   * /article/shoplist POST
   * query:
   *  page 第几页
   *  rows 一页多少条数据
   * body:
   *  category_id: 商铺分类 id
   *    40 美食
   *    45 KTV
   *    48 足疗按摩
   *    41 酒店
   *    49 丽人美发
   *  order: desc(降序)/asc(升序) 默认：desc
   *  distance: 过滤显示多少米范围的商品, 如: 500
   *  sort: 按照 distance(距离)/ score(评分) 排序
   */
  if (reqUrl.pathname === '/article/shoplist' && req.method === 'POST')  {

    // query json
    const query = queryString.parse(reqUrl.query);
    if (Object.keys(query).length === 0) util.resMsg(res, 400, 'bad request query');

    // body string
    let str = '';
    req.on('data', (data) => str += data);
    req.on('end',  () => {
      // 验证并解析请求体
      const json = util.parseBody(req, res, str);
      // 查询商家
      util.shopFind(res, query, json);
    });
  }

  /**
   * 商家详情
   * /article/detail POST
   * body:
   *  id 商家id
   */
  if (reqUrl.pathname === '/article/detail' && req.method === 'POST') {
    let str = '';
    req.on('data', (data) => str += data);
    req.on('end',  () => {
      // 验证并解析请求体
      const json = util.parseBody(req, res, str);
      // 查询商家
      util.shopDetail(res, json);
    });
  }

  /**
   * 登录并解析用户数据/解析用户手机号
   * /login GET
   * header:
   *  'X-WX-Code': code,
   *  'X-WX-Encrypted-Data': userInfo.encryptedData,
   *  'X-WX-IV': userInfo.iv,
   */
  if (reqUrl.pathname === '/login'  && req.method === 'GET') {
    const appId = ''; // 隐私常量
    const appSecret = ''; // 隐私常量
    let sessionKey = '';
    let openId = '';
    const code = req.headers['x-wx-code'];
    const iv = req.headers['x-wx-iv'];
    const encryptedData = req.headers['x-wx-encrypted-data'];

    axios.get(`https://api.weixin.qq.com/sns/jscode2session?appid=${appId}&secret=${appSecret}&js_code=${code}&grant_type=authorization_code`)
      .then((res) => {
        if (!res.data.errcode) {
          sessionKey = res.data.session_key;
          openId = res.data.openid;
        } else {
          util.resMsg(res, 500, res.data.errcode);
        }
      }).then(() => {
        const pc = new WXBizDataCrypt(appId, sessionKey);
        const data = pc.decryptData(encryptedData , iv);
        util.resMsg(res, 200, data);
      }).catch(() => {
        util.resMsg(res, 500, '解析失败，请重试');
      })
  }

  /**
   * 检查收藏
   * /checkFavorite POST
   * body:
   *  open_id: 用户 openid, 登录后获得
   *  article_id: 商家 id
   */
  if (reqUrl.pathname === '/checkFavorite' && req.method === 'POST') {
    let str = '';
    req.on('data', (data) => str += data);
    req.on('end',  () => {
      // 验证并解析请求体
      const json = util.parseBody(req, res, str);
      // 查询商家
      util.checkFavorite(res, json);
    });
  }

  /**
  * 添加收藏
  * /addFavorite POST
  * body:
  *  open_id: 用户 openid, 登录后获得
  *  article_id: 商家 id
  */
  if (reqUrl.pathname === '/addFavorite' && req.method === 'POST') {
    let str = '';
    req.on('data', (data) => str += data);
    req.on('end',  () => {
      // 验证并解析请求体
      const json = util.parseBody(req, res, str);
      // 查询商家
      util.addFavorite(res, json);
    });
  }

  /**
  * 取消收藏
  * /delFavorite POST
  * body:
  *  open_id: 用户 openid, 登录后获得
  *  article_id: 商家 id
  */
  if (reqUrl.pathname === '/delFavorite' && req.method === 'POST') {
    let str = '';
    req.on('data', (data) => str += data);
    req.on('end',  () => {
      // 验证并解析请求体
      const json = util.parseBody(req, res, str);
      // 查询商家
      util.delFavorite(res, json);
    });
  }

  /**
  * 获取收藏列表
  * /getFavoriteList POST
  * body:
  *  open_id: 用户 openid, 登录后获得
  */
  if (reqUrl.pathname === '/getFavoriteList' && req.method === 'POST') {
    let str = '';
    req.on('data', (data) => str += data);
    req.on('end',  () => {
      // 验证并解析请求体
      const json = util.parseBody(req, res, str);
      // 查询商家
      util.getFavoriteList(res, json);
    });
  }
});

server.listen(3000, () => console.log('db ok'));