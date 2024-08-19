import { createMemoryHistory, createRouter } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/MyMusic.vue'),
    redirect: '/mymusic',
  },
  {
    path: '/mymusic',
    name: 'MyMusic',
    component: () => import('@/views/MyMusic.vue'),
  },
  {
    path: '/mydata',
    name: 'mydata',
    component: () => import('@/views/MyData.vue'),
  },
  {
    path: '/formatconvert',
    name: 'formatconvert',
    component: () => import('@/views/FormatConvert.vue'),
  },
  {
    path: '/mysettings',
    name: 'MySettings',
    component: () => import('@/views/MySettings.vue'),
  },
]

const router = createRouter({
  history: createMemoryHistory(),           // 路由历史记录保存在内存，通常在非浏览器环境
  routes,
})

export default router