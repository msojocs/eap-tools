<script setup lang="ts">
import * as secs from '@/utils/secs'
import * as logHandle from '@/utils/log'
import * as storeConfig from '@/store/store'
// import * as Excel from 'exceljs'
import { ref } from 'vue'
const remote = require('@electron/remote') as typeof import('@electron/remote');
// import { remote } from 'electron'
// import * as remote from '@electron/remote'
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const secsFile = ref(localStorage.getItem('secsFile'))
const logFile = ref(localStorage.getItem('logFile'))

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
const selectLogFile = async ()=>{
 
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
        logFile.value = result.filePaths[0]
        localStorage.setItem('logFile', logFile.value as string)
    }
}
const parseSecs = async ()=>{
    console.log('parse secs: ', secsFile.value)
    const secsData = await secs.parse(secsFile.value as string)
    const fs = require('fs') as typeof import('fs')
    try {
        fs.mkdirSync(storeConfig.dataLoc, {
            recursive: true
        })
    } catch (error) {
        
    }
    console.log(`${storeConfig.dataLoc}/secs.json`)
    fs.writeFileSync(`${storeConfig.dataLoc}/secs.json`, JSON.stringify(secs))
}
const parseLog = async ()=>{
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(logFile.value as string)
    console.log(wb)
    logHandle.parseLogData(wb)
    // window.wb = wb
}
</script>

<template>
    <div>
        <h2>Config Page</h2>
        <div>
            SECS文件：<span>{{ secsFile }}</span><br />
            <el-button @click="selectSecsFile" type="primary">选择文件</el-button>
            <el-button @click="parseSecs">解析</el-button>
        </div>
        <div>
            LOG文件：<span>{{ logFile }}</span><br />
            <el-button @click="selectLogFile" type="primary">选择文件</el-button>
            <el-button @click="parseLog">解析</el-button>
        </div>

    </div>
    
</template>

<style lang="scss" scoped>
    
</style>