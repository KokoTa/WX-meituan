//index.js
const req = require('../../utils/req');

Page({
  globalData: {
    statusBarHeight: 0, // 状态栏高度
    navTotalHeight: 0, // 实际导航栏高度
  },

  data: {
    guessLike: [],
    page: 1,
    rows: 10,
    isLoading: false, // 防止重复相同的请求
    isLoadingAll: false,
    currentCity: '北京',
  },

  onLoad: function () {
    const { page, rows } = this.data;
    // 请求测试
    req.getShops({}, {
      page,
      rows
    }).then((res) => {
      if (res.code === 200) {
        this.setData({
          guessLike: [...res.msg]
        })
      }
    }).catch((err) => {
      console.error(err);
    });
  },

  onShow() {
    // 检查当前城市
    const currentCity = wx.getStorageSync('currentCity');
    if (currentCity && currentCity !== this.data.currentCity) {
      this.setData({ currentCity });
    }
  },

  /**
   * 视图滚动到底部时触发
   * 也可以用 Page 的 onReachBottom 替代（使用该方法后，点击顶部状态栏会返回顶部，详情见 shopList 逻辑）
   */
  onScrollLower() {

    let { page, rows, guessLike, isLoading, isLoadingAll } = this.data;

    if (isLoading || isLoadingAll) return;

    this.setData({ isLoading: true });

    req.getShops({}, {
      page: ++page,
      rows,
    }).then((res) => {
      if (res.code === 200 && res.msg.length !== 0) {
        this.setData({
          guessLike: [...guessLike, ...res.msg],
          page: page,
          isLoading: false
        })
      } else {
        this.setData({
          isLoading: false,
          isLoadingAll: true
        })
      }
    }).catch((err) => {
      console.error(err);
    });
  }
})
