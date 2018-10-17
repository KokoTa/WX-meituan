// pages/shopList/shopList.js
const req = require('../../utils/req');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    shopList: [],
    page: 0,
    rows: 10,
    isLoading: false, // 防止重复相同的请求
    isLoadingAll: false,
    category_id: 0,

    // 过滤条件
    distance: '',
    sort: 'distance',
    filterType: '',
    order: 'desc',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (query) {
    const id = query.id;
    this.setData({
      categoryId: id
    });

    let { page, rows } = this.data;
    req.getShops({
      category_id: id
    }, {
      page: ++page,
      rows,
    }).then((res) => {
      if (res.code === 200) {
        this.setData({
          shopList: [...res.msg]
        })
      } else {
        console.error(res.msg);
      }
    })
  },

  /**
   * 下拉加载
   */
  onReachBottom() {
    this._loadMore();
  },

  /**
   * 选择 附近/智能排序
   */
  onSelectTap(e) {
    const { type } = e.target.dataset;
    if (type === this.data.filterType) {
      this.setData({
        filterType: ''
      });
    } else {
      this.setData({
        filterType: type
      });
    }
  },

  /**
   * 选择并请求过滤后的结果
   */
  onSelectValue(e) {
    const { type } = e.currentTarget.dataset;
    const { value } = e.target.dataset;

    // 如果选择了距离(传 distance 来限制距离)
    if (type === 'range') {
      this.setData({
        distance: value,
        sort: 'distance',
        page: 0,
        isLoadingAll: false,
        shopList: [],
        filterType: '',
        order: 'asc',
      })
    }
    // 如果选择了排序(排序不需要传 distance)
    if (type === 'sort') {
      this.setData({
        distance: '',
        sort: value,
        page: 0,
        isLoadingAll: false,
        shopList: [],
        filterType: '',
      })
      if (value === 'score') { // 如果是评分就按降序排序
        this.setData({
          order: 'desc'
        })
      } else {
        this.setData({ // 如果是距离按升序排序
          order: 'asc'
        })
      }
    }

    this._loadMore();
  },


  /**
   * 加载
   */
  _loadMore() {
    let { page, rows, shopList, isLoading, isLoadingAll, categoryId } = this.data;
    let { distance, sort, order } = this.data;

    if (isLoading || isLoadingAll) return;

    this.setData({ isLoading: true });

    req.getShops({
      category_id: categoryId,
      distance,
      sort,
      order
    }, {
      page: ++page,
      rows,
    }).then((res) => {
      if (res.code === 200 && res.msg.length !== 0) {
        this.setData({
          shopList: [...shopList, ...res.msg],
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