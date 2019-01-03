// pages/Nav/Nav.js
const App = getApp()

/**
 * ! 自定义导航栏思路：
 * 状态栏高度 + 自定义的导航栏高度 = 实际导航栏高度
 * 因为导航栏是 fixed 得，所以页面需要相应地向下移动以显示整个页面
 * 自定义导航栏不支持全局设置，所以会发现只有 test 页有导航栏
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件加载后
   */
  attached() {
    // 拿到历史纪录
    const routers = getCurrentPages()
    console.log(routers.length)
    // 是否显示后退按钮
    if (routers.length > 1) {
      this.setData({ showBack: true })
    } else {
      this.setData({ showBack: false })
    }

    // 计算实际导航栏高度
    App.globalData.navTotalHeight = this.data.statusBarHeight + this.data.navHeight;
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 微信 API 获取得高度单位为 px
    // 获取状态栏高度
    statusBarHeight: App.globalData.statusBarHeight || 20,
    // 导航栏高度自定义为 45
    navHeight: 45,
    showBack: false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    handleBack() {
      wx.navigateBack({ delta: -1 });
    },
    handleHome() {
      wx.navigateTo({ url: '/pages/index/index' })
    }
  }
})
