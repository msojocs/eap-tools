<script setup lang="ts">
import * as secs from '@/utils/secs'
import * as logHandle from '@/utils/test-report'
import {useStore} from '@/store/store'
// import * as Excel from 'exceljs'
import { ref } from 'vue'
import LogData from './LogData.vue';

const remote = require('@electron/remote') as typeof import('@electron/remote');
// import { remote } from 'electron'
// import * as remote from '@electron/remote'
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const store = useStore()

const secsFile = ref(localStorage.getItem('secsFile'))
const logFile = ref(localStorage.getItem('logFile'))
const resultData = ref('')

const reportData = ref<{
    [key: string]: any
}>({})

// 选择文件
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

// 解析SECS
const parseSecs = async ()=>{
    console.log('parse secs: ', secsFile.value)
    const secsData = await secs.parse(secsFile.value as string)
    const fs = require('fs') as typeof import('fs')
    try {
        console.log('result:', secsData);
        resultData.value = JSON.stringify(secsData, null, 4)
        fs.mkdirSync(store.state.dataLoc, {
            recursive: true
        })
    } catch (error) {
        
    }
    console.log(`${store.state.dataLoc}/secs.json`)
    fs.writeFileSync(`${store.state.dataLoc}/secs.json`, JSON.stringify(secs))
}

// 解析报告
const parseReport = async ()=>{
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(logFile.value as string)
    console.log('解析报告:', wb)
    reportData.value = logHandle.parseLogData(wb)
    console.log(reportData.value)
    // window.wb = wb
}

</script>

<template>
    <el-container>
        <el-header>
            <h2>Config Page</h2>
        </el-header>
        <el-main>
            <el-card>
                SECS文件：<span>{{ secsFile }}</span><br />
                <el-button @click="selectSecsFile" type="primary">选择文件</el-button>
                <el-button @click="parseSecs">解析</el-button>
            </el-card>
            <br />
            <el-card>
                LOG文件：<span>{{ logFile }}</span><br />
                <el-button @click="selectLogFile" type="primary">选择文件</el-button>
                <el-button @click="parseReport">解析</el-button>
            </el-card>
            <br />
            <el-tabs>
                <template v-for="(data, reportName) in reportData">
                    <el-tab-pane :label="'' + reportName">
                        <log-data :data="data"></log-data>
                    </el-tab-pane>
                </template>
            </el-tabs>
        </el-main>
    </el-container>
    
</template>

<style lang="scss" scoped>
    
</style>