import * as VueRouter from "vue-router";
import CheckList from "@/views/checkList/CheckList.vue";
import TEST from "@/views/test/test.vue";
import CONFIG from "@/views/config/Config.vue";
import OUTPUT from "@/views/output/Output.vue";
import SECS from "@/views/secs/SECS.vue";
import SERVER from "@/views/server/Server.vue";
import CHANGELOG from "@/views/changelog/changelog.vue";
import MDB from "@/views/mdb/mdb.vue";
import DEBUG from "@/views/debug/debug.vue";

// 1. 定义路由组件.
// 也可以从其他文件导入

// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。
const routes = [
    {
        name: "check-list",
        path: "/",
        component: CheckList,
        meta: {
            title: '测试报告',
            icon: 'List'
        }
    },
    {
        path: "/secs",
        component: SECS,
        meta: {
            title: 'SECS处理',
            icon: 'Collection'
        }
    },
    {
        path: "/server",
        component: SERVER,
        meta: {
            title: '文件服务',
            icon: 'Files'
        }
    },
    {
        path: "/debug",
        component: DEBUG,
        meta: {
            title: '调试',
            icon: 'CircleClose'
        }
    },
    {
        path: "/test",
        component: TEST,
        meta: {
            title: '单机测试 (dev)',
            icon: 'Compass'
        }
    },
    {
        path: "/mdb",
        component: MDB,
        meta: {
            title: 'MDB编辑器 (pause)',
            icon: 'Edit'
        }
    },
    {
        path: "/config",
        component: CONFIG,
        meta: {
            title: '配置 (开发中)',
            icon: 'Setting'
        }
    },
    {
        path: "/output",
        component: OUTPUT,
        meta: {
            title: '导出 (开发中)',
            icon: 'Upload'
        }
    },
    {
        path: "/changelog",
        component: CHANGELOG,
        meta: {
            title: '更新日志',
            icon: 'Timer'
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
