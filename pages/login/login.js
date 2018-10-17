// pages/login/login.js
const req = require('../../utils/req');

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 获取用户信息的回调
   * @param {Object} detail 返回的用户信息
   */
  onGetUserInfo({ detail }) {
    if (detail.errMsg === "getUserInfo:ok") {
      req.login(detail) // login 会调用 wx.login 拿到 code，然后连同 iv/encryptedData 一起传到后端，接着后端返回数据，数据存储到 storage 里
        .then(() => {
          // 授权完毕，页面返回
          wx.navigateBack();
        })
        .catch((err) => {
          console.error(err);
        })
    }
  }
})