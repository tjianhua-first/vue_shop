import Vue from 'vue'
import { Button, Form, FormItem, Input } from 'element-ui'

// 导入消息提示组件
import { Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// 全局挂载消息提示组件 挂载在原型对象上
Vue.prototype.$message = Message
