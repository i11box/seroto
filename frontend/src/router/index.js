import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
]

const router = createRouter({
  history: createMemoryHistory(),           // 路由历史记录保存在内存，通常在非浏览器环境
  routes,
})

export default router