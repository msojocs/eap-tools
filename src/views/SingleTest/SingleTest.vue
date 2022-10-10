<script setup lang="ts">
import * as secs from '@/utils/secs'
import { analyze } from '@/utils/log'
import * as logHandle from '@/utils/test-report'
import { useCustomStore } from '@/store'
// import * as Excel from 'exceljs'
import { ref } from 'vue'
import LogDataItem from './LogDataItem.vue';
import type {ReportItemData, SecsData} from '@/utils/types'
import { EventListData, RcmdListData } from './types'
import { ElMessage, ElNotification } from 'element-plus'
import { parseXML } from '@/utils/secs'
const fs = require('fs') as typeof import('fs')

const remote = require('@electron/remote') as typeof import('@electron/remote');
// import { remote } from 'electron'
// import * as remote from '@electron/remote'
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const store = useCustomStore()

const secsFile = ref(localStorage.getItem('secsFile'))
const xmlSecsFile = ref(localStorage.getItem('xmlSecsFile'))
const reportFilePath = ref(localStorage.getItem('logFile'))
const targetTab = ref('联线初始化')
const eventList = ref<EventListData[]>([])
const rcmdList = ref<RcmdListData[]>([])

// 报告数据
const reportData = ref<{
    [key: string]: ReportItemData[]
}>({
    '联线初始化': []
})
// SECS数据
const secsData = ref<SecsData>({
    eid2rid: {},
    rid2vid: {},
    vidData: {},
    rcmd2cpid: {},
    rcpData: {},
    alarmData: {},
    traceData: {},
    recipeData: {},
})

/**
 * 在资源管理器中打开文件
 * 
 */
 const openFolder = ()=>{
    if(reportFilePath.value){
        remote.shell.showItemInFolder(reportFilePath.value)
        
    }else{
        ElMessage({
            type: 'error',
            message: '文件路径异常！'
        })
    }
}

// 选择文件
const selectSecsFile = async ()=>{
 
    const result = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {
                name: 'Excel',
                extensions: ['xlsx']
            },
            {
                name: 'All',
                extensions: ['*']
            }
        ],
    });
    console.log(result)
    if(!result.canceled){
        secsFile.value = result.filePaths[0]
        localStorage.setItem('secsFile', secsFile.value as string)
    }
}

// 选择文件
const selectXmlSecsFile = async ()=>{
 
    const result = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {
                name: 'Xml',
                extensions: ['xml']               
            },
            {
                name: 'All',
                extensions: ['*']               
            }
        ],
    });
    console.log(result)
    if(!result.canceled){
        xmlSecsFile.value = result.filePaths[0]
        localStorage.setItem('xmlSecsFile', xmlSecsFile.value as string)
    }
}

// 选择报告文件
const selectReportFile = async ()=>{
 
    const result = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {
                name: 'Excel',
                extensions: ['xlsx']
            },
            {
                name: 'All',
                extensions: ['*']
            }
        ],
    });
    console.log(result)
    if(!result.canceled){
        reportFilePath.value = result.filePaths[0]
        localStorage.setItem('logFile', reportFilePath.value as string)
    }
}

const initData = (secsD: SecsData, reportD: {
    [key: string]: ReportItemData[];
})=>{

    // 转为可供选择的Event List
    eventList.value = []
    const eData = secsD.eid2rid
    for(let eId in eData){
        eventList.value.push({
            value: eId,
            label: `${eId} ${eData[eId].comment} ${eData[eId].description}`
        })
    }

    // 转为可供选择的RCMD List
    rcmdList.value = []
    const rcmdData = secsD.rcmd2cpid
    for(let rcmdId in rcmdData){
        rcmdList.value.push({
            value: rcmdId,
            label: `${rcmdId} ${rcmdData[rcmdId].command} ${rcmdData[rcmdId].description}`
        })
    }

    // 预分析日志中的S6F11的Event ID
    for(let k in reportD){
        const testList = reportD[k]
        for(let item of testList){
            const {eventIdList, analyzeStr, rcmdList} = analyze(item, secsData.value)
            item.eventIdList = eventIdList
            item.rcmdList = rcmdList
            item.analyze = analyzeStr
        }
    }
}

// 解析报告
const parseReport = async ()=>{
    let xmlSecs = null
    let excelSecs = null
    // TODO: 尝试解析excel版本的SECS，成功后补全xml版本的缺失数据
    try{
        const fs = require('node:fs')
        const xmlStr = fs.readFileSync(xmlSecsFile.value).toString()
        xmlSecs = parseXML(xmlStr)
        console.log('xml parse result:', xmlSecs)
        secsData.value = xmlSecs
    }catch(err){
        console.error('SECS Xml解析异常:', err)
        ElMessage.error({
            message: 'XML 解析失败'
        })
    }
    // return

    try{
        console.log('parse secs: ', secsFile.value)
        const wb1 = new Excel.Workbook()
        await wb1.xlsx.readFile(secsFile.value as string)
        
        excelSecs = await secs.parse(wb1)
        // 成功就覆盖xml解析出来的数据
        secsData.value = excelSecs
        console.log('secs data:', excelSecs)

    }catch(err: any){
        console.error('SECS Excel解析异常:', err)
        ElMessage.error(`SECS解析异常，使用XML数据：${err.message || err}`)
    }
    

    try{
        const wb = new Excel.Workbook()
        await wb.xlsx.readFile(reportFilePath.value as string)
        const logData = logHandle.parseReport(wb)

        console.log(logData)
        reportData.value = logData
    }catch(err: any){
        console.error(err)
        ElMessage.error({
            message: `报告解析失败: ${err?.message || '未知错误, 请查看控制台'}`
        })
    }

    // 根据SECS数据与报告数据做初始化
    initData(secsData.value, reportData.value)
    // console.log(reportData.value)
    // window.wb = wb
}

// 导出报告
const exportReport = async ()=>{

    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(reportFilePath.value as string)
    logHandle.exportReport(wb, reportData.value)
    wb.xlsx.writeFile((reportFilePath.value as string).replace('.xlsx', ' - export.xlsx'))
}
// 保存记录
const storeReportData = ()=>{
    const storePath = store.state.dataLoc + '/SingleTest'

    // 创建目录
    try{
        fs.mkdirSync(storePath, {
            recursive: true
        })
    }catch{

    }
    // 写入报告
    try {
            
        fs.writeFileSync(`${storePath}/config.json`, JSON.stringify(reportData.value))
        fs.writeFileSync(`${storePath}/secs.json`, JSON.stringify(secsData.value))
        ElNotification.success({
            message: '存储成功！'
        })
    } catch (error: any) {
        ElNotification.error({
            message: '写入失败！' + (error?.message?? '')
        })
    }

}
// 加载记录
const loadReportData = ()=>{
    try{

        const storePath = store.state.dataLoc + '/SingleTest'
        const configFile = `${storePath}/config.json`
        if(!fs.existsSync(configFile)){
            ElNotification.warning({
                message: '报告配置文件不存在！'
            })
            return 
        }
        const configBuf = fs.readFileSync(configFile)
        const configData = JSON.parse(configBuf.toString())
        reportData.value = configData

        const secsFile = `${storePath}/secs.json`
        if(!fs.existsSync(secsFile)){
            ElNotification.warning({
                message: 'SECS配置文件不存在！'
            })
            return 
        }
        const secsBuf = fs.readFileSync(secsFile)
        const _secsData = JSON.parse(secsBuf.toString())
        secsData.value = _secsData

        initData(_secsData, configData)

        ElNotification.success({
            message: '读取成功！'
        })
    }catch(err: any){
        ElNotification.error({
            message: '读取配置失败！' + (err?.message?? '')
        })
    }
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
                    <div class="card-header">
                        <el-row style="width: 100%;">
                            <el-col :span="8">
                                <span>SECS文件及测试报告</span>
                            </el-col>
                            <el-col :span="12"></el-col>
                            <el-col :span="4">
                                <el-button @click="loadReportData">加载</el-button>
                                <el-button @click="storeReportData" type="primary">存储</el-button>
                            </el-col>
                        </el-row>
                    </div>
                </template>
                
                <el-input type="text" v-model="secsFile" :readonly="true">
                    <template #prepend>
                        SECS文件：
                    </template>
                    <template #append>
                        <el-button @click="selectSecsFile" type="primary">选择SECS文件</el-button>
                    </template>
                </el-input>
                <br /><br />

                <el-input type="text" v-model="xmlSecsFile" :readonly="true">
                    <template #prepend>
                        Library文件：
                    </template>
                    <template #append>
                        <el-button @click="selectXmlSecsFile" type="primary">选择Library SECS文件</el-button>
                    </template>
                </el-input>
                <br /><br />

                <el-input type="text" v-model="reportFilePath" :readonly="true">
                    <template #prepend>
                        测试报告文件：
                    </template>
                    <template #append>
                        <el-button @click="selectReportFile" type="primary">选择文件</el-button>
                    </template>
                </el-input>
                <br>
                <br>

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
                            <log-data-item
                            v-if="targetTab == reportName"
                            v-for="log in data"
                            :log="log"
                            :event-list="eventList"
                            :rcmd-list="rcmdList"
                            :secs-data="secsData"
                            ></log-data-item>
                        </el-tab-pane>
                    </template>
                </el-tabs>
                    <!-- <DynamicScroller
                        :items="reportData[targetTab]"
                        :min-item-size="2"
                        class="scroller"
                        keyField="title"
                    >
                        <template v-slot="{ item, index, active }">
                            <DynamicScrollerItem
                                :item="item"
                                :active="active"
                                :size-dependencies="[
                                    item.title
                                ]"
                                :data-index="index"
                            >
                                <log-data-item
                                :log="item"
                                :event-list="eventList"
                                :rcmd-list="rcmdList"
                                :secs-data="secsData"
                                ></log-data-item>
                            </DynamicScrollerItem>
                        </template>
                    </DynamicScroller> -->
            </el-card>
        </el-main>
        <span class="test" style="height: 100vh;"></span>
        <el-backtop target=".el-main" :visibility-height="500" ></el-backtop>
    </el-container>
    
</template>

<style scoped>
.scroller{
    height: 100vh;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>