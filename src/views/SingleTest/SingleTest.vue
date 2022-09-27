<script setup lang="ts">
import * as secs from '@/utils/secs'
import { analyze } from '@/utils/log'
import * as logHandle from '@/utils/test-report'
import { useStore } from '@/store/store'
// import * as Excel from 'exceljs'
import { ref } from 'vue'
import LogDataItem from './LogDataItem.vue';
import type {ReportItemData, SecsData} from '@/utils/types'
import { EventListData, RcmdListData } from './types'
import { ElMessage } from 'element-plus'

const remote = require('@electron/remote') as typeof import('@electron/remote');
// import { remote } from 'electron'
// import * as remote from '@electron/remote'
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const store = useStore()

const secsFile = ref(localStorage.getItem('secsFile'))
const logFile = ref(localStorage.getItem('logFile'))
const targetTab = ref('联线初始化')
const eventList = ref<EventListData[]>([])
const rcmdList = ref<RcmdListData[]>([])

const reportData = ref<{
    [key: string]: ReportItemData[]
}>({
    '联线初始化': []
})
const secsData = ref<SecsData>({
    eid2rid: {},
    rid2vid: {},
    vidData: {},
    rcmd2cpid: {},
    rcpData: {},
    alarmData: {},
    traceData: {},
})

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

/**
 * 在资源管理器中打开文件
 * 
 */
 const openFolder = ()=>{
    if(logFile.value){
        remote.shell.showItemInFolder(logFile.value)
        
    }else{
        ElMessage({
            type: 'error',
            message: '文件路径异常！'
        })
    }
}

// 选择报告文件
const selectReportFile = async ()=>{
 
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

// 解析报告
const parseReport = async ()=>{
    try{
        console.log('parse secs: ', secsFile.value)
        const wb1 = new Excel.Workbook()
        await wb1.xlsx.readFile(secsFile.value as string)
        // console.log(wb1)
        // console.log('secs data:', await secs.parse(wb1))
        // return
        secsData.value = await secs.parse(wb1)
        // secsData
        eventList.value = []
        // 转为可供选择的EventList
        const eData = secsData.value.eid2rid
        for(let eId in eData){
            eventList.value.push({
                value: eId,
                label: `${eId} ${eData[eId].comment} ${eData[eId].description}`
            })
        }
        rcmdList.value = []
        // 转为可供选择的EventList
        const rcmdData = secsData.value.rcmd2cpid
        for(let rcmdId in rcmdData){
            rcmdList.value.push({
                value: rcmdId,
                label: `${rcmdId} ${rcmdData[rcmdId].command} ${rcmdData[rcmdId].description}`
            })
        }
        
        const wb = new Excel.Workbook()
        await wb.xlsx.readFile(logFile.value as string)
        // console.log('解析报告:', wb)
        const logData = logHandle.parseReport(wb)

        // 分析
        for(let k in logData){
            // console.log('k:', k, reportData.value[k])
            const testList = logData[k]
            for(let item of testList){
                const {eventIdList, analyzeStr, rcmdList} = analyze(item, secsData.value)
                item.eventIdList = eventIdList
                item.rcmdList = rcmdList
                item.analyze = analyzeStr
            }
        }
        reportData.value = logData
    }catch(err: any){
        console.error(err)
        ElMessage.error({
            message: err?.message || '未知错误, 请查看控制台'
        })
    }
    // console.log(reportData.value)
    // window.wb = wb
}

// 导出报告
const exportReport = async ()=>{

    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(logFile.value as string)
    logHandle.exportReport(wb, reportData.value)
    wb.xlsx.writeFile((logFile.value as string).replace('.xlsx', ' - export.xlsx'))
}

</script>

<template>
    <el-container>
        <el-header>
            <h2>Config Page</h2>
            
        </el-header>
        <el-main>
            <el-card>
                <template #header>
                    <span>SECS文件及测试报告</span>
                </template>
                SECS文件：<span>{{ secsFile }}</span><br />
                <!-- <el-input type="file"></el-input> -->
                <el-button @click="selectSecsFile" type="primary">选择SECS文件</el-button>
                <br /><br />
                报告文件：<span>{{ logFile }}</span><br />
                <el-button @click="selectReportFile" type="primary">选择文件</el-button>
                <el-button @click="openFolder">打开所在文件夹</el-button>
                <br /><br />
                <el-button @click="parseReport">解析</el-button>
                <el-button @click="exportReport">导出</el-button>
            </el-card>
            <br />
            <el-card>
                <template #header>
                    <span>测试项目</span>
                </template>
                <el-tabs v-model="targetTab">
                    <template v-for="(data, reportName) in reportData">
                        <el-tab-pane :label="'' + reportName" :name="'' + reportName">
                            <log-data-item v-if="targetTab == reportName" v-for="log in data" :log="log" :event-list="eventList" :rcmd-list="rcmdList" :secs-data="secsData"></log-data-item>
                        </el-tab-pane>
                    </template>
                </el-tabs>
            </el-card>
        </el-main>
        <span class="test" style="height: 100vh;"></span>
        <el-backtop target=".el-main" :visibility-height="500" ></el-backtop>
    </el-container>
    
</template>

<style lang="scss" scoped>
    
</style>