import * as VueRouter from "vue-router";
import Home from "@/views/home/home.vue";
import TEST from "@/views/test/test.vue";
import CONFIG from "@/views/config/Config.vue";
import OUTPUT from "@/views/output/output.vue";

// 1. 定义路由组件.
// 也可以从其他文件导入

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
    {
        name: "home",
        path: "/",
        component: Home,
        meta: {
            title: '首页',
            icon: 'House'
        }
    },
    {
        path: "/test",
        component: TEST,
        meta: {
            title: '测试',
            icon: 'Compass'
        }
    },
    {
        path: "/config",
        component: CONFIG,
        meta: {
            title: '配置',
            icon: 'Setting'
        }
    },
    {
        path: "/output",
        component: OUTPUT,
        meta: {
            title: '导出',
            icon: 'Upload'
        }
    },
];

// 3. 创建路由实例并传递 `routes` 配置
// 你可以在这里输入更多的配置，但我们在这里
// 暂时保持简单
const router = VueRouter.createRouter({
    // 4. 内部提供了 history 模式的实现。为了简单起见，我们在这里使用 hash 模式。
    history: VueRouter.createWebHashHistory(),
    routes, // `routes: routes` 的缩写
});

export default router;
