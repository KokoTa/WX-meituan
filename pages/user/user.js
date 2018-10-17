// pages/user/user.js
const api = require('../../utils/api');
const req = require('../../utils/req');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasLogin: false,
    user: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    // 获取小程序已经向用户请求过的权限
    api.getSetting()
      .then((res) => {
        console.log(res)
        // 判断是否授权了用户信息，一开始 authSetting 是个空对象
        // 拒绝了授权，scope.userInfo: false；统一了授权，scope.userInfo: true
        if (res.authSetting['scope.userInfo']) {
          // 如果同意过用户信息授权，则先获取基本信息用于下一步
          return api.getUserInfo();
        } else {
          throw new Error('未授权用户信息');
        }
      })
      .then((info) => {
        // 本地有没有数据缓存
        const userInfo = wx.getStorageSync('userInfo');
        // 没有就重新登录
        return userInfo ? userInfo : req.login(info);
      })
      .then((userInfo) => {
        this.setData({
          hasLogin: true,
          user: userInfo
        });
      })
      .catch((err) => {
        console.error(err);
      });
  },

  onGetUserInfo({ detail }) {
    if (detail.errMsg === 'getUserInfo:ok') {
      req.login(detail)
        .then((res) => {
          this.setData({
            hasLogin: true,
            user: res
          });
        })
        .catch(err => console.error(err))
    }
  }
})