<template>
    <i :class="'iconfont icon-' + iconName"></i>
</template>

<script setup lang="ts">
import '@/assets/fonts/iconfont.css'
const {iconName} = defineProps({
    iconName: String
})
</script>

<style scoped>

.svg-icon {
    width: 1em;
    height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>