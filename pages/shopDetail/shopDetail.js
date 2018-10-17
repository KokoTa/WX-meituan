// pages/shopDetail/shopDetail.js
const req = require('../../utils/req');
const api = require('../../utils/api');
const qqMapSDK = api.createQQMap();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopDetail: {},
    address: '',
    distance: 0,
    hasLocationAuth: true,
    isFavorite: false,
    shopId: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    // 赋值 shopId
    this.setData({
      shopId: query.id
    })

    // 获取商家详情
    req.getShopDetail({
      id: +query.id
    })
    .then((res) => {
      if (res.code === 200) {
        this.setData({
          shopDetail: res.msg
        })
        // 返回位置信息
        return {
          latitude: res.msg.lat,
          longitude: res.msg.lng
        };
      }
    })
    .then((position) => {
      // 获取地理信息
      this._getLocation(position);
    })
    .catch((err) => {
      console.error(err);
    });
  },

  onShow() { // 每次显示页面时都会调用
    // 由于异步，一开始的 this.data.shopDetail 为空对象
    // 此代码用于当不授权，手动再授权的情况
    if (Object.keys(this.data.shopDetail).length) {
      this._getLocation({
        latitude: this.data.shopDetail.lat,
        longitude: this.data.shopDetail.lng
      });
    }

    // 检查用户信息，判断是否收藏了该商家
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      req.checkFavorite({
        open_id: userInfo.openId,
        article_id: this.data.shopId
      }).then((res) => {
        if (res.msg) {
          this.setData({
            isFavorite: true
          })
        } else {
          this.setData({
            isFavorite: false
          })
        }
      });
    }
  },

  /**
   * 获取地理信息
   * @param {Object} position 商家的经纬度
   */
  _getLocation(position) {
    return Promise.all([
      qqMapSDK.reverseGeocoder({location: {...position}}), // 获取商家具体地址
      api.getLocation({ type: 'gcj02'}), // 获取用户位置信息
      position, // 返回商家坐标
    ])
    .then(([shopInfo, myLocation, shopLocation]) => {
      this.setData({
        address: shopInfo.result.address, // 赋值商家具体地址
        hasLocationAuth: true // 如果没报错，说明已经授权了地理位置功能
      })

      const from = {
        latitude: myLocation.latitude,
        longitude: myLocation.longitude
      };
      const to = { // shopLocation 数据有问题
        latitude: myLocation. latitude - Math.random(),
        longitude: myLocation.longitude - Math.random()
      };

      // 计算距离
      return qqMapSDK.calculateDistance({
        from,
        to: [ to ]
      })
    })
    .then((res) => {
      // 赋值距离
      if (res.status === 0) {
        this.setData({
          distance: res.result.elements[0].distance
        })
      }
    })
    .catch((err) => {
      // 未授权地理位置功能
      if (err.errMsg === 'getLocation:fail auth deny') {
        this.setData({
          hasLocationAuth: false
        })
        return;
      }
      // 距离过长
      if (err.status === 348) {
        this.setData({
          distance: -1
        })
        return;
      }
      console.error(err);
    });
  },

  /**
   * 添加/取消收藏
   */
  tapFavorite() {
    const userInfo = wx.getStorageSync('userInfo');

    // 没有用户信息就跳转到授权
    if (!userInfo) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    if (!this.data.isFavorite) {
      // 添加收藏
      req.addFavorite({
        open_id: userInfo.openId,
        article_id: this.data.shopId
      }).then((res) => {
        if (res.code === 200) {
          this.setData({
            isFavorite: true
          })
        } else {
          this.setData({
            isFavorite: false
          })
        }
      })
    } else {
      // 取消收藏
      req.delFavorite({
        open_id: userInfo.openId,
        article_id: this.data.shopId
      }).then((res) => {
        if (res.code === 200) {
          this.setData({
            isFavorite: false
          })
        } else {
          this.setData({
            isFavorite: true
          })
        }
      })
    }
  }
})