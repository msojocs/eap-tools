<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'
import {useCustomStore} from '@/store'
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setups
const isCollapse = ref(false)
const router = useRouter()
const route = useRoute()
const store = useCustomStore()
console.log(router.getRoutes(), route)
</script>

<template>
  <el-container class="layout">
    <el-aside width="100" style="background-color:#545c64">
      <!-- <div v-if="!isCollapse" class="drawer-bg"></div> -->
      <el-scrollbar>
        <el-menu
        :default-active="router.currentRoute.value.path"
          class="el-menu-vertical-demo"
          background-color="#545c64"
          text-color="#fff"
          :collapse="isCollapse"
          router
          :collapse-transition="false"
          >
          <el-menu-item v-for="r in router.options.routes" :key="r.path" :index="r.path">
            <el-icon>
              <component :is="r.meta?.icon"></component>
            </el-icon>
            <template #title>
              <span>{{r.meta?.title}}</span>
            </template>
          </el-menu-item>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <el-header class="navbar">
        <!-- 左边按钮 -->
        <div style="width:50px;display: flex;align-items: center;cursor: pointer;" @click="isCollapse = !isCollapse">
          <el-icon v-if="isCollapse" :size="40"><Expand /></el-icon>
          <el-icon v-else :size="40"><Fold/></el-icon>
        </div>
        <!-- 右边其它 -->
        <div>
        导航栏</div>&nbsp;|&nbsp;
        <span>版本：v{{store.state.version}}</span>
      </el-header>
      <!-- 路由出口 -->
      <el-main>
        <!-- 路由匹配到的组件将渲染在这里 -->
        <router-view v-slot="{ Component, route }">
          <keep-alive>
            <component :is="Component" :key="route.path" v-if="route.meta.keepAlive" />
          </keep-alive>
            <component :is="Component" :key="route.path" v-if="!route.meta.keepAlive" />
        </router-view>
      </el-main>
      
    </el-container>
  </el-container>
</template>

<style scoped>
.layout {
  /* display: flex; */
  height: 100vh;
}
.el-menu-vertical-demo{
  height: 100vh;
}
.right-area{
  width: 100%;
}
.navbar{
  background-color: #fffefe;
  width: 100%;
  height: 50px;
  display: flex;
  box-shadow: #eee 0px 4px 5px;
  align-items: center;
  z-index: 5;
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
.router-v{
  padding: 1rem;
}

.drawer-bg {
  background: #000;
  opacity: 0.3;
  width: 100%;
  top: 0;
  height: 100%;
  position: absolute;
  z-index: 999;
}
</style>
