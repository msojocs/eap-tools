import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import ElementPlus, { ElMessage } from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";
import { store, key } from './store'

// 如果您正在使用CDN引入，请删除下面一行。
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

const app = createApp(App);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
app.use(store, key)
app.use(router).use(ElementPlus).mount("#app");

process.setUncaughtExceptionCaptureCallback(err=>{
    console.error('setUncaughtExceptionCaptureCallback--->', err)
});
process.on('uncaughtException', (err)=>{
    console.error('uncaughtException->', err)
    ElMessage({
        type: 'error',
        message: err.message || '未知错误'
    }, app._context)
})