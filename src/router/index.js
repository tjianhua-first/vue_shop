import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'
import List from '../components/goods/List.vue'
import Add from '../components/goods/Add.vue'
Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  { 
    path: '/home', 
    component: Home,
    redirect: '/welcome', 
    children: [
      { path: '/welcome', component: Welcome },
      { path:'/users', component: Users },
      { path: '/rights', component: Rights },
      { path: '/roles', component: Roles },
      { path: '/categories', component: Cate },
      { path: '/params', component: Params },
      { path: '/goods', component: List },
      { path: '/goods/add', component: Add }
    ]
  }
  
]

const router = new VueRouter({
  routes
})

// 挂载路由导航守卫
// to要访问的路径
// from 由哪个路径 跳转来的
// next 放行函数  next()放行  next('/login) 强制跳转
router.beforeEach((to,from,next) => {
  // 登录页面直接放行
  if(to.path === '/login') return next();
  // 其他页面验证token
  const tokenStr = window.sessionStorage.getItem('token')
  if(!tokenStr) return next('/login')
  next();
})

export default router
