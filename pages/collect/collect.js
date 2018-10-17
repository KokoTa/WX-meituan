// pages/collect/collect.js
const req = require('../../utils/req');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopList: []
  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    const openId = wx.getStorageSync('userInfo').openId;
    req.getFavoriteList({
      open_id: openId
    }).then((res) => {
      const shopList = res.msg.articles;
      this.setData({
        shopList
      })
    })
    .catch(err => console.error(err));
  },
})