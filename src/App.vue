<script setup lang="ts">
import { MenuItemClicked } from 'element-plus/es/components/menu';
import { ref } from 'vue'
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setups
const isCollapse = ref(false)
const onMenuSelected = (index: String, indexPath: string[], item: MenuItemClicked)=>{
  console.log(index, item.route)
}
</script>

<template>
  <div class="layout">
    <el-menu
     default-active="2"
      class="el-menu-vertical-demo"
       background-color="#545c64"
       text-color="#fff"
       :collapse="isCollapse"
       router
       >
      <el-menu-item index="1" :route="{path:'/test'}">
        <el-icon>
          <location />
        </el-icon>
        <template #title>
          <span>测试</span>
        </template>
      </el-menu-item>
      <el-menu-item index="2" :route="{path:'/config'}">
        <el-icon>
          <Menu ></Menu>
        </el-icon>
        <template #title>配置</template>
      </el-menu-item>
      <el-menu-item index="3" disabled>
        <el-icon>
          <document />
        </el-icon>
        <template #title>无用</template>
      </el-menu-item>
      <el-menu-item index="4" :route="{path:'/output'}">
        <el-icon>
          <setting />
        </el-icon>
        <template #title>导出报告</template>
      </el-menu-item>
    </el-menu>
    <div class="right-area">
      <div class="navbar">
        <!-- 左边按钮 -->
        <div style="width:50px;display: flex;align-items: center;cursor: pointer;" @click="isCollapse = !isCollapse">
          <el-icon v-if="isCollapse" :size="40"><Expand /></el-icon>
          <el-icon v-else :size="40"><Fold/></el-icon>
        </div>
        <!-- 右边其它 -->
        <div>
        导航栏</div>
      </div>
      <!-- 路由出口 -->
      <!-- 路由匹配到的组件将渲染在这里 -->
      <router-view></router-view>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
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
}
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}
</style>
