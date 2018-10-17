// pages/cityList/cityList.js
const cityData = require('./cityData');
const api = require('../../utils/api');
const qqMapSDK = api.createQQMap();

Page({
  indexInfo: [], // 导航节点的信息

  /**
   * 页面的初始数据
   */
  data: {
    cityData, // 城市列表信息
    jumpId: '', // 跳转到的城市索引
    currentId: '', // 当前城市索引
    localCity: '', // 当前用户所处的城市
    hasLocationAuth: false, // 是否授权了位置信息
    historyCitys: [], // 历史记录
  },

  /**
   * DOM 加载后，获取右侧导航的节点信息
   */
  onReady: function () {
    wx.createSelectorQuery()
      .selectAll('.index-item')
      .boundingClientRect((res) => {
        console.log(res);
        this.indexInfo = res.map((item) => {
          return {
            top: item.top, // 这个 top 是节点顶部距离页面顶部的距离
            bottom: item.bottom, // 这个 bottom 是节点底部距离页面顶部的距离
            id: item.id
          }
        });
      })
      .exec();
  },

  /**
   * 每次显示时都获取当前地址
   */
  onShow() {
    this._getLocation();

    const historyCitys = wx.getStorageSync('historyCitys');
    if (historyCitys) {
      this.setData({
        historyCitys
      })
    }
  },

  /**
   * 点击跳转
   * @param {Object} e 事件对象
   */
  touchStart(e) {
    if (e.target.dataset.type !== 'city-index') return;
    const id = e.target.id;
    this.setData({
      jumpId: id,
      currentId: id,
    });
  },

  /**
   * 拖动跳转(和点击跳转不同，拖动产生的对象都是点击时的那个对象，这里使用 touch 对象进行操作)
   * @param {Object} e 事件对象
   */
  touchMove(e) {
    const { clientY } = e.touches[0];
    const letter = this.indexInfo.find((item) => {
      return clientY > item.top && clientY < item.bottom;
    })

    // 如果滑动时处在相同节点内，会重复调用 setData，这是没有必要的，所以我们通过记录一个 currentId 来防止重复调用
    if (letter && letter.id !== this.data.currentId) {
      console.log(letter);
      this.setData({
        jumpId: letter.id,
        currentId: letter.id
      })
    }
  },

  onSelectCity(e) {
    const { city } = e.target.dataset;
    if (!city) return;

    wx.setStorageSync('currentCity', city)

    const { historyCitys } = this.data;
    const citys = [city, ...historyCitys.filter((item) => item !== city)];
    wx.setStorageSync('historyCitys', citys.slice(0, 3));

    wx.navigateBack();
  },

  /**
   * 获取当前城市
   */
  _getLocation() {
    api.getLocation({ type: 'gcj02' })
      .then((res) => {
        return qqMapSDK.reverseGeocoder({
          latitude: res.latitude,
          longitude: res.longitude
        })
      })
      .then((res) => {
        const { city } = res.result.address_component;
        this.setData({
          localCity: city,
          hasLocationAuth: true
        })
      })
      .catch((err) => {
        if (err.errMsg === 'getLocation:fail auth deny') {
          this.setData({
            hasLocationAuth: false
          })
          return;
        }
        console.error(err);
        return;
      })
  }
})