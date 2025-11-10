<script>
import { authService } from '@/services/auth'

export default {
  onLaunch: async function() {
    console.log('App Launch')

    // ✅ 全局初始化：确保 sessionKey 在应用启动时就存储到数据库
    // 这样无论用户从哪个页面进入，都能正常使用手机号授权功能
    // 解决了用户在不同页面点击"加入购物车"时出现"会话已过期"的问题
    try {
      await authService.wechatLogin()
      console.log('✅ [App] Global sessionKey initialized successfully')
    } catch (error) {
      console.warn('⚠️ [App] wechatLogin failed on app launch:', error)
      // 不阻塞应用启动，用户进入后再次尝试
    }
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
