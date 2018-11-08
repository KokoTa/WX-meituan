// pages/test/test.js
const api = require('../../utils/api');

Page({
  data: {
    formId: '',
    phoneNumber: '',
    imageList: [
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540376020962&di=65f3770c62845d34e05d6f392bea45a9&imgtype=0&src=http%3A%2F%2Fg.hiphotos.baidu.com%2Fzhidao%2Fpic%2Fitem%2Fa6efce1b9d16fdfa718b5c4eb68f8c5495ee7baf.jpg',
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540376060684&di=5a985991f32f59cd79885be2d79fabb9&imgtype=0&src=http%3A%2F%2Fpic4.zhimg.com%2Fv2-9782450de915ff176c2de12d653af1f3_1200x500.jpg',
      'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1540376145417&di=8cda84e4cb7f80ffbc63b8b8f1aaaddd&imgtype=0&src=http%3A%2F%2Fspider.nosdn.127.net%2Fb28da20608052976b03bdaeb04ea5c11.jpeg'
    ],
    showMask: false,
    focus: false,
    code: [],
    currentCode: -1,
    imageData: '',
    uploadStatus: '',
  },

  onLoad() {
    // 设置分享
    api.showShareMenu({
      title: '分享',
      withShareTicket: true
    })
    // 消息提示
    // api.showToast({
    //   title: '欢迎进入',
    //   duration: 1000,
    //   mask: true,
    // })
  },

  /**
   * 监听点击转发按钮
   */
  onShareAppMessage() {
    console.log(1);
    return {
      title: '美团应用',
      path: '/pages/test/test',
      imageUrl: 'https://tu.duotoo.com/uploads/tu/201708/9999/rn72e062de9e.png',
    }
  },

  /**
   * 发送模板消息
   * @param {Object} e 事件对象
   */
  sendTemplate(e) {
    // 拿到 formId
    const { formId } = e.detail;
    this.setData({ formId });
    // 获取接口调用凭证 access_token
    const appID = 'wx1b13619a00914149';
    const appSecret = '5f15037cac0924dd84ccca5181d84a8c';
    let access_token = '';
    api.request({
      url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appID}&secret=${appSecret}`
    })
    .then((res) => {
      access_token = res.data.access_token;
    })
    .then(() => {
      // 发送模板
      const openId = 'oJd8u5fZ6LVKXPhKE-6IB26FmQzk';
      const templateId = 'ZaFH-vMrzajcL5JZzCkq-wMyPqzJi88OmQ4J_mbQuKc';
      const page = 'pages/index/index';
      return wx.request({
        url: `https://api.weixin.qq.com/cgi-bin/message/wxopen/template/send?access_token=${access_token}`,
        method: 'POST',
        data: {
          "touser": openId,
          "template_id": templateId,
          "page": page,
          "form_id": formId,
          "data": {
              "keyword1": {
                  "value": "339208499"
              },
              "keyword2": {
                  "value": "100"
              },
              "keyword3": {
                  "value": "2018年10月24日 14:18"
              } ,
              "keyword4": {
                  "value": "手办1号"
              } ,
              "keyword5": {
                  "value": "192470192471904"
              } ,
              "keyword6": {
                  "value": "2018年10月24日 14:20"
              }
          },
          "emphasis_keyword": "keyword1.DATA"
        }
      })
    })
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
  },

  /**
   * 获取用户手机号
   */
  getPhoneNumber({ detail }) {
    console.log(detail)
    if (detail.errMsg === "getPhoneNumber:ok") {
      api.login().then((res) => {
        return api.request({
          url: 'http://localhost:3000/login',
          header: {
            'X-WX-Code': res.code,
            'X-WX-Encrypted-Data': detail.encryptedData,
            'X-WX-IV': detail.iv,
          }
        })
      })
      .then((res) => {
        this.setData({ phoneNumber: res.data.msg.phoneNumber});
      })
      .catch((err) => {
        console.error(err)
      })
    }
  },

  /**
   * 下载图片
   */
  downLoadImage() {
    api.downloadFile({
      url: this.data.imageList[0]
    })
    .then((res) => {
      console.log(res);
      return api.saveImageToPhotosAlbum({
        filePath: res.tempFilePath
      })
    })
    .then((res) => {
      console.log(res);
    })
    .catch((err) => {
      console.error(err);
    })
  },

  /**
   * 打开验证码遮罩层
   */
  openMask() {
    this.setData({ openMask: true, focus: true });
  },
  /**
   * 隐藏验证码遮罩层
   */
  hiddenMask(e) {
    if (e.target.dataset.type === 'mask') {
      this.setData({ openMask: false, focus: false });
    } else {
      this.setData({ openMask: true, focus: true });
    }
  },
  /**
   * 输入验证码
   */
  inputCode(e) {
    const { value } = e.detail;
    const arr = value.split('');
    this.setData({ code: arr, currentCode: arr.length });
  },

  /**
   * 获取小程序二维码
   */
  getWxCode() {
    api.request({
      url: 'http://localhost:3000/getWxCode',
      responseType: 'arraybuffer' // 接受类型为 arraybuffer
    })
    .then((res) => {
      const base64 = wx.arrayBufferToBase64(res.data); // 将 arraybuffer 转为 base64
      this.setData({ imageData: 'data:image/jpg;base64,' + base64 });
    });
  },

  /**
   * 上传文件
   */
  uploadFile() {
    const that = this;

    wx.chooseImage({
      success (res) {
        that.setData({ uploadStatus: 'Uploading...'});
        const tempFilePaths = res.tempFilePaths;
        wx.uploadFile({ // 一次只能上传一个文件
          url: 'http://localhost:3000/uploadFile',
          filePath: tempFilePaths[0],
          name: 'SurpriseMotherFucker',
          formData: {
            'user': 'test'
          },
          success (res){
            console.log(res)
            that.setData({ uploadStatus: 'Success!'});
          }
        })
      }
    })
  }
})