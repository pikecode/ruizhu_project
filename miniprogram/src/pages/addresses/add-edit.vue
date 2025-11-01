<template>
  <view class="address-form-page">

    <!-- 表单内容 -->
    <view class="form-content">
      <!-- 收货人姓名 -->
      <view class="form-group">
        <label class="form-label">收货人<text class="required">*</text></label>
        <input
          v-model="form.name"
          class="form-input"
          type="text"
          placeholder="请输入收货人姓名"
        />
      </view>

      <!-- 手机号码 -->
      <view class="form-group">
        <label class="form-label">手机号码<text class="required">*</text></label>
        <input
          v-model="form.phone"
          class="form-input"
          type="text"
          placeholder="请输入手机号码"
        />
      </view>

      <!-- 省份、城市、地区 - 使用 picker 组件 -->
      <view class="form-row">
        <!-- 省份选择 -->
        <view class="form-group form-group-third">
          <label class="form-label">省份<text class="required">*</text></label>
          <picker mode="selector" :range="provinces" @change="onProvinceChange">
            <view class="form-select">
              <text class="select-value">{{ form.province || '请选择' }}</text>
              <text class="select-arrow">▼</text>
            </view>
          </picker>
        </view>

        <!-- 城市选择 -->
        <view class="form-group form-group-third">
          <label class="form-label">城市<text class="required">*</text></label>
          <picker v-if="currentCities.length > 0" mode="selector" :range="currentCities" @change="onCityChange">
            <view class="form-select">
              <text class="select-value">{{ form.city || '请选择' }}</text>
              <text class="select-arrow">▼</text>
            </view>
          </picker>
          <view v-else class="form-select disabled">
            <text class="select-value">请先选择省份</text>
            <text class="select-arrow">▼</text>
          </view>
        </view>

        <!-- 地区选择 -->
        <view class="form-group form-group-third">
          <label class="form-label">地区<text class="required">*</text></label>
          <view class="form-select">
            <text class="select-value">{{ form.district || form.city || '同城市' }}</text>
            <text class="select-arrow">▼</text>
          </view>
        </view>
      </view>

      <!-- 详细地址 -->
      <view class="form-group">
        <label class="form-label">详细地址<text class="required">*</text></label>
        <textarea
          v-model="form.detail"
          class="form-textarea"
          placeholder="请输入详细地址"
          :fixed="true"
        ></textarea>
      </view>

    </view>

    <!-- 底部保存按钮 -->
    <view class="form-footer">
      <view class="save-btn" :class="{ disabled: isLoading }" @tap="onSaveAddress">
        <text>{{ isLoading ? '保存中...' : '保存地址' }}</text>
      </view>
    </view>
  </view>
</template>

<script>
import { api } from '../../services/api'

export default {
  data() {
    return {
      mode: 'add', // 'add' or 'edit'
      isLoading: false,
      form: {
        id: null,
        name: '',
        phone: '',
        province: '',
        city: '',
        district: '',
        detail: ''
      },
      provinces: [
        '北京市', '天津市', '河北省', '山西省', '内蒙古自治区',
        '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省',
        '浙江省', '安徽省', '福建省', '江西省', '山东省',
        '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区',
        '海南省', '重庆市', '四川省', '贵州省', '云南省',
        '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区',
        '新疆维吾尔自治区'
      ],
      cities: {
        '北京市': ['朝阳区', '东城区', '西城区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '昌平区'],
        '天津市': ['河东区', '河西区', '南开区', '河北区', '红桥区', '东丽区', '西青区', '津南区', '北辰区', '武清区'],
        '河北省': ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '邢台市', '保定市', '张家口市', '承德市', '沧州市', '衡水市'],
        '山西省': ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市'],
        '内蒙古自治区': ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市'],
        '辽宁省': ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市'],
        '吉林省': ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
        '黑龙江省': ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市'],
        '上海市': ['浦东新区', '黄浦区', '静安区', '虹口区', '杨浦区', '长宁区', '普陀区', '闵行区', '宝山区', '嘉定区'],
        '江苏省': ['南京市', '苏州市', '无锡市', '南通市', '常州市', '镇江市', '泰州市', '盐城市', '淮安市', '徐州市'],
        '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市'],
        '安徽省': ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '阜阳市'],
        '福建省': ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
        '江西省': ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市'],
        '山东省': ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市'],
        '河南省': ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市'],
        '湖北省': ['武汉市', '黄石市', '十堰市', '荆州市', '宜昌市', '襄阳市', '鄂州市', '孝感市', '黄冈市', '咸宁市'],
        '湖南省': ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '益阳市', '郴州市', '永州市'],
        '广东省': ['广州市', '深圳市', '珠海市', '汕头市', '佛山市', '江门市', '湛江市', '茂名市', '肇庆市', '清远市'],
        '广西壮族自治区': ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市'],
        '海南省': ['海口市', '三亚市', '三沙市', '儋州市', '琼海市', '文昌市', '万宁市', '五指山市', '东方市', '定安县'],
        '重庆市': ['渝中区', '江北区', '沙坪坝区', '九龙坡区', '南岸区', '北碚区', '渝北区', '巴南区', '长寿区', '江津区'],
        '四川省': ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市'],
        '贵州省': ['贵阳市', '六盘水市', '遵义市', '安顺市', '铜仁市', '毕节市', '黔西南布依族苗族自治州', '黔东南苗族侗族自治州'],
        '云南省': ['昆明市', '曲靖市', '玉溪市', '昭通市', '丽江市', '普洱市', '临沧市', '楚雄彝族自治州', '红河哈尼族彝族自治州'],
        '西藏自治区': ['拉萨市', '日喀则市', '山南市', '林芝市', '昌都市', '阿里地区', '那曲市'],
        '陕西省': ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
        '甘肃省': ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市'],
        '青海省': ['西宁市', '海东市', '海北藏族自治州', '黄南藏族自治州', '海南藏族自治州', '果洛藏族自治州', '玉树藏族自治州'],
        '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
        '新疆维吾尔自治区': ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市', '昌吉回族自治州', '博尔塔拉蒙古自治州', '巴音郭楞蒙古自治州']
      },
      currentCities: []
    }
  },
  onLoad(options) {
    console.log('地址添加编辑页面加载')
    if (options.mode) {
      this.mode = options.mode
    }
    // 如果是编辑模式，加载现有地址数据
    if (options.mode === 'edit' && options.id) {
      this.loadAddressData(parseInt(options.id))
    }
  },
  methods: {
    /**
     * 从服务器加载地址数据
     */
    async loadAddressData(id) {
      try {
        const response = await api.get(`/addresses/${id}`)

        if (response) {
          // 字段映射：后端返回 receiverName/receiverPhone/addressDetail，前端期望 name/phone/detail
          this.form = {
            id: response.id,
            name: response.receiverName || response.name,
            phone: response.receiverPhone || response.phone,
            province: response.province,
            city: response.city,
            district: response.district,
            detail: response.addressDetail || response.detail
          }

          // 加载地址后，初始化当前城市列表
          if (this.form.province && this.cities[this.form.province]) {
            this.currentCities = this.cities[this.form.province]
          } else {
            this.currentCities = []
          }

          console.log('加载的地址:', this.form, '当前城市:', this.currentCities, 'isDefault:', this.form.isDefault)
        } else {
          console.warn('加载地址失败')
        }
      } catch (e) {
        console.error('Failed to load address:', e)
        uni.showToast({
          title: '加载地址失败',
          icon: 'none'
        })
      }
    },
    /**
     * 省份选择变化
     */
    onProvinceChange(e) {
      const selectedIndex = e.detail.value
      this.form.province = this.provinces[selectedIndex]
      this.form.city = ''
      this.form.district = ''

      // 更新当前城市列表
      this.currentCities = this.cities[this.form.province] || []

      console.log('选中省份:', this.form.province, '可用城市:', this.currentCities)
    },

    /**
     * 城市选择变化
     */
    onCityChange(e) {
      const selectedIndex = e.detail.value
      this.form.city = this.currentCities[selectedIndex]
      // 地区默认使用城市值
      this.form.district = this.form.city

      console.log('选中城市:', this.form.city)
    },
    /**
     * 保存地址到服务器
     */
    async onSaveAddress() {
      // 验证必填字段
      if (!this.form.name) {
        uni.showToast({
          title: '请输入收货人姓名',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.phone) {
        uni.showToast({
          title: '请输入手机号码',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.province) {
        uni.showToast({
          title: '请选择省份',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.city) {
        uni.showToast({
          title: '请选择城市',
          icon: 'none',
          duration: 1000
        })
        return
      }
      if (!this.form.detail) {
        uni.showToast({
          title: '请输入详细地址',
          icon: 'none',
          duration: 1000
        })
        return
      }

      this.isLoading = true

      try {
        const token = uni.getStorageSync('accessToken')
        if (!token) {
          uni.showToast({
            title: '请先登录',
            icon: 'none'
          })
          return
        }

        // 字段映射：前端 name/phone/detail → 后端 receiverName/receiverPhone/addressDetail
        const addressData = {
          receiverName: this.form.name,
          receiverPhone: this.form.phone,
          province: this.form.province,
          city: this.form.city,
          district: this.form.district,
          addressDetail: this.form.detail
        }

        try {
          if (this.mode === 'add') {
            // 创建新地址
            await api.post('/addresses', addressData)
          } else {
            // 编辑现有地址
            await api.put(`/addresses/${this.form.id}`, addressData)
          }

          // 保存地址成功提示
          uni.showToast({
            title: '地址保存成功',
            icon: 'success',
            duration: 1500
          })

          // 延迟返回上一页
          setTimeout(() => {
            uni.navigateBack()
          }, 1500)
        } catch (error) {
          console.error('Failed to save address:', error)
          uni.showToast({
            title: '保存失败，请重试',
            icon: 'none'
          })
        }
      } catch (e) {
        console.error('Failed to validate address:', e)
        uni.showToast({
          title: '保存失败，请检查网络',
          icon: 'none'
        })
      } finally {
        this.isLoading = false
      }
    }
  }
}
</script>

<style lang="scss">
.address-form-page {
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  padding-bottom: 120rpx;
}

/* 表单内容 */
.form-content {
  flex: 1;
  padding: 40rpx;
  overflow-y: auto;
}

/* 表单组 */
.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 40rpx;

  &.form-group-half {
    width: calc(50% - 8rpx);
  }

  &.form-group-third {
    width: calc(33.333% - 10rpx);
  }

  .form-label {
    display: block;
    font-size: 26rpx;
    color: #333333;
    margin-bottom: 12rpx;
    font-weight: 500;

    .required {
      color: #ff0000;
      margin-left: 4rpx;
    }
  }

  .form-input,
  .form-select,
  .form-textarea {
    width: 100%;
    padding: 16rpx 0;
    font-size: 28rpx;
    color: #000000;
    border: none;
    border-bottom: 1px solid #d0d0d0;
    background: transparent;
    transition: all 0.2s ease;

    &:focus {
      border-bottom-color: #000000;
    }

    &::placeholder {
      color: #cccccc;
    }
  }

  .form-select {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 16rpx 0;

    .select-value {
      display: block;
      font-size: 28rpx;
      color: #000000;
      flex: 1;
    }

    .select-arrow {
      display: block;
      font-size: 16rpx;
      color: #cccccc;
      margin-left: 12rpx;
    }
  }

  .form-textarea {
    min-height: 120rpx;
    resize: vertical;
    font-family: inherit;
  }
}

/* 表单行 */
.form-row {
  display: flex;
  gap: 16rpx;
  margin-bottom: 40rpx;
}

/* 复选框组 */
.form-checkbox-group {
  padding: 24rpx 0;
  margin-top: 24rpx;

  .checkbox-item {
    display: flex;
    align-items: center;
    gap: 12rpx;
    cursor: pointer;
    padding: 8rpx 0;

    .checkbox {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32rpx;
      height: 32rpx;
      border: 2px solid #d0d0d0;
      border-radius: 4rpx;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &.checked {
        background: #000000;
        border-color: #000000;

        .checkbox-icon {
          display: block;
          color: #ffffff;
          font-size: 20rpx;
          font-weight: 600;
        }
      }

      .checkbox-icon {
        display: none;
      }
    }

    .checkbox-label {
      display: block;
      font-size: 28rpx;
      color: #333333;
    }
  }
}

/* 表单底部 */
.form-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: #ffffff;
  border-top: 1px solid #f0f0f0;
  padding: 24rpx 40rpx;
  padding-bottom: max(24rpx, env(safe-area-inset-bottom));

  .save-btn {
    width: 100%;
    padding: 20rpx 0;
    background: #000000;
    color: #ffffff;
    border-radius: 8rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28rpx;
    font-weight: 500;
    transition: all 0.2s ease;
    cursor: pointer;

    &:active {
      background: #333333;
      transform: scale(0.98);
    }

    &.disabled {
      background: #d0d0d0;
      cursor: not-allowed;
      opacity: 0.6;

      &:active {
        transform: none;
      }
    }

    text {
      display: block;
    }
  }
}
</style>
