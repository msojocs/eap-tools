<script setup lang="ts">
import secs from '@/utils/secs'
// import * as Excel from 'exceljs'
import { ref } from 'vue'
const remote = require('@electron/remote') as typeof import('@electron/remote');
// import { remote } from 'electron'
// import * as remote from '@electron/remote'
// const Excel = require('exceljs')

const secsFile = ref(localStorage.getItem('secsFile'))
const selectSecsFile = async ()=>{
 
    const result = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {
                name: 'Excel',
                extensions: ['xlsx']                // 只允许 jpg 和 png 格式的文件
            },
            {
                name: 'All',
                extensions: ['*']                // 只允许 jpg 和 png 格式的文件
            }
        ],
    });
    console.log(result)
    if(!result.canceled){
        secsFile.value = result.filePaths[0]
        localStorage.setItem('secsFile', secsFile.value as string)
    }
}
const parseSecs = async ()=>{
    console.log('parse secs: ', secsFile.value)
    secs.parse(secsFile.value as string)
}
</script>

<template>
    <div>
        <h2>Config Page</h2>
        SECS文件：<span>{{ secsFile }}</span><br />
        <el-button @click="selectSecsFile" type="primary">选择文件</el-button>
        <el-button @click="parseSecs">解析</el-button>
    </div>
    
</template>

<style lang="scss" scoped>
    
</style>