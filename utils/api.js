const QQMapWX = require('../libs/qqmap-wx-jssdk.min');

let bindAPI = (apiName, bindObj = wx) => {
  // 覆写成 Promise 的形式
  return (option = {}) => new Promise((resolve, reject) => {
    bindObj[apiName]({ // 执行
      ...option,
      success: resolve,
      fail: reject
    })
  })
};

// 接口的命名空间
let apiSpace = {
  // 网络
  net: [
    'request',
    'uploadFile',
    'downloadFile',
    'connectSocket',
    'onSocketOpen',
    'onSocketError',
    'sendSocketMessage',
    'onSocketMessage',
    'closeSocket',
    'onSocketClose'
  ],
  // 数据缓存
  dataCache: [
    'setStorage',
    'getStorage',
    'getStorageInfo',
    'removeStorage',
    'clearStorage',
  ],
  // location
  location: [
    'getLocation',
    'chooseLocation',
    'openLocation',
  ],
  // 设备
  device: [
    // 网络状态
    'getNetworkType',
  ],
  // 界面
  userface: [
    // 交互反馈
    'showToast',
    'showLoading',
    'hideToast',
    'hideLoading',
    'showModal',
    'showActionSheet',
    // 设置导航条

    // 导航
    'navigateTo',
    'redirectTo',
    'reLaunch',
    'switchTab',
    'navigateBack',
  ],
  // 开发接口
  openAPI: [
    'login',
    'checkSession',
    // 授权
    'authorize',
    'getUserInfo',
    // 支付
    'requestPayment',
    // 设置
    'getSetting',
    'openSetting',
  ]
}

let rawNameArr = []; // api 名字集合

for (let k in apiSpace) {
  rawNameArr = [...rawNameArr, ...apiSpace[k]]
}

const apis = rawNameArr.reduce((accu, elt) => {
  if (Object.prototype.toString.call(elt) === '[object String]') {
    accu[elt] = bindAPI(elt)
  } else {
    accu[elt.name] = bindAPI(elt.name, elt.thisArg)
  }
  return accu;
}, {});

apis.createQQMap =()=>{
  let instance = new QQMapWX({key: "DMTBZ-X7IWQ-J6P5Q-GR2QD-XFMD3-6NBSV"});
  // 返回一个方法对象
  return [
    'search',
    'getSuggestion',
    'reverseGeocoder',
    'geocoder',
    'getCityList',
    'getDistrictByCityId',
    'calculateDistance'
  ].reduce((accu, name)=>{
    accu[name] = bindAPI(name, instance);
    return accu;
  },{});
};

module.exports = apis;