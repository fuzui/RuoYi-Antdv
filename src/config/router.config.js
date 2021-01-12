// eslint-disable-next-line
import { UserLayout } from '@/layouts'

/**
 * 首页
 */
export const indexRouterMap = [
  {
    path: '/index',
    name: 'index',
    component: 'Index',
    meta: { title: '首页', keepAlive: true, icon: 'dashboard' }
  },
  {
    path: '/account/center',
    name: 'center',
    component: 'AccountCenter',
    meta: { title: '个人中心', keepAlive: true },
    hidden: true
  },
  {
    path: '/account/settings',
    name: 'settings',
    component: 'AccountSettings',
    meta: { title: '个人设置', hideHeader: true },
    redirect: '/account/settings/base',
    hidden: true,
    children: [
      {
        path: '/account/settings/base',
        name: 'BaseSettings',
        component: 'BaseSettings',
        hidden: true,
        meta: { title: '基本设置', hidden: true }
      },
      {
        path: '/account/settings/security',
        name: 'SecuritySettings',
        component: 'SecuritySettings',
        meta: { title: '安全设置', hidden: true, keepAlive: true }
      }
    ]
  },
  {
    path: '/monitor/job/log',
    name: 'JobLog',
    component: 'JobLog',
    meta: { title: '调度日志', keepAlive: true },
    hidden: true
  },
  {
    path: '/system/notice/form',
    name: 'NoticeForm',
    component: 'NoticeForm',
    meta: { title: '公告编辑', keepAlive: true },
    hidden: true
  },
  {
    path: '/gen/edit',
    name: 'GenEdit',
    component: 'GenEdit',
    meta: { title: '修改生成配置', keepAlive: true },
    hidden: true
  }
]
/**
 * 基础路由
 * @type { *[] }
 */
export const constantRouterMap = [
  {
    path: '/user',
    component: UserLayout,
    redirect: '/user/login',
    hidden: true,
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import(/* webpackChunkName: "user" */ '@/views/user/Login')
      }
    ]
  },

  {
    path: '/404',
    component: () => import(/* webpackChunkName: "fail" */ '@/views/exception/404')
  }

]
