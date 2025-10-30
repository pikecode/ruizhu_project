<script>
export default {
  onLaunch: function() {
    console.log('App Launch')
  },
  onShow: function() {
    console.log('App Show')
  },
  onHide: function() {
    console.log('App Hide')
  }
}
</script>

<style lang="scss">
@import '@/uni.scss';

page {
  background-color: #ffffff;
}

// 全局按钮 - 移除transitions以提高性能
button {
  // 移除heavy transitions
}

// 全局view点击反馈 - 移除
view[onclick],
view[data-tap-index],
[data-clickable="true"] {
  // 移除transitions以提高性能
}

// 文本输入框 - 移除transitions
input {
  // 移除transitions以提高性能
}
</style>
