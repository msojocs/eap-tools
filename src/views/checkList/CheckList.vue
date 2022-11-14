<script setup lang="ts">
import * as logHandle from '@/utils/test-report'
import { ComponentInternalInstance, getCurrentInstance, ref } from 'vue'
import { ElMessage, ElNotification } from 'element-plus'
import { parseReportTypeData } from '@/utils/test-report';
import { getFilesByDir } from '@/utils/common';
const remote = require('@electron/remote') as typeof import('@electron/remote');
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')
// 在你的 setup 方法中
const { appContext } = getCurrentInstance() as ComponentInternalInstance;

const logFile = ref(sessionStorage.getItem('logFile'))

const newLogFile = ref(logFile.value as string)
if(logFile.value){
    let dotPos = logFile.value.lastIndexOf('.')
    newLogFile.value = logFile.value.replace(logFile.value.substring(0, dotPos), `${logFile.value.substring(0, dotPos)} - new`)
}
const selectLogFile = async ()=>{
 
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
        logFile.value = result.filePaths[0]
        sessionStorage.setItem('logFile', logFile.value as string)
        newLogFile.value = logFile.value as string
        let dotPos = newLogFile.value.lastIndexOf('.')
        newLogFile.value = newLogFile.value.replace(newLogFile.value.substring(0, dotPos), `${newLogFile.value.substring(0, dotPos)} - new`)
    }
}
const openFolder = ()=>{
    if(logFile.value){
        remote.shell.showItemInFolder(logFile.value)
        
    }else{
        ElMessage({
            type: 'error',
            message: '文件路径异常！'
        }, appContext)
    }
}
const generatorProcessList = async ()=>{
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(logFile.value as string);
    (window as any).wb = wb
    console.log(wb)
    try {
            
        logHandle.genProcedureList(wb)
        await wb.xlsx.writeFile(newLogFile.value)
        ElMessage({
            type: 'success',
            message: '操作完成'
        }, appContext)
    } catch (error: any) {
        appContext.config.globalProperties.$message.error(error?.message ?? 'error')
    }
}
const prepareCheckList = async ()=>{
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(logFile.value as string);
    console.log(wb)
    try {
            
        logHandle.testPrepare(wb)
        await wb.xlsx.writeFile(newLogFile.value)
        ElMessage({
            type: 'success',
            message: '操作完成'
        }, appContext)
    } catch (error: any) {
        appContext.config.globalProperties.$message.error(error?.message ?? 'error')
    }
}

const handleTypeDataByDir = ref(false)
const getCheckListTypeData = async ()=>{
    const filename = logFile.value as string
    if(handleTypeDataByDir.value){
        const path = require('path') as typeof import('path')
        const dir = path.dirname(filename)
        console.log('dir:', dir)
        const fileList = getFilesByDir(dir).filter(e=>!e.includes('new'))
        console.log('fileList:', fileList)
        for(let file of fileList){
            await genCheckListTypeData(file)
        }
    }else{
        await genCheckListTypeData(filename)
    }
}
const genCheckListTypeData = async (filename: string)=>{
    
    const wb = new Excel.Workbook()
    
    try {
        await wb.xlsx.readFile(filename);
        let isReport = false;
        for(let ws of wb.worksheets){
            if(ws.name.includes('初始化')){
                isReport = true;
                break
            }
        }
        if(!isReport)return

        const reportData = logHandle.parseReport(wb)
        console.log('reportData:', reportData)
        /**
         * ALID_TYPE
         * CEID_TYPE
         * DATAID_TYPE
         * DSPER_LEN
         * REPGSZ_TYPE
         * RPTID_TYPE
         * SVID_TYPE
         * TOTSMP_TYPE
         * TRID_TYPE
         * VID_TYPE
         * CCODE_TYPE
         * 
         */
        const typeData = parseReportTypeData(reportData)
        console.log('typeData:', typeData)
        const ws = wb.addWorksheet('数据类型标识（自动）')
        ws.getCell(1, 1).value = '项目'
        ws.getCell(1, 2).value = '值'
        const keys = Object.keys(typeData)
        const map: any = {
            alarmIdType: 'ALID TYPE',
            eventIdType: 'CEID_TYPE',
            dataIdType: 'DATAID_TYPE',
            traceIdType: 'TRID_TYPE',
            dsperLen: 'DSPER_LEN',
            traceTotalType: 'TOTSMP_TYPE',
            traceSizeType: 'REPGSZ_TYPE',
            svIdType: 'SVID_TYPE',
            reportIdType: 'RPTID_TYPE',
            variableIdType: 'VID_TYPE',
            cCodeType: 'CCODE_TYPE',
        }
        for (let i = 0; i < keys.length; i++) {
            const element = keys[i];
            if(!map[element]){
                console.warn('未识别的项目：', element)
                continue
            }
            ws.getCell(i + 2, 1).value = map[element]
            ws.getCell(i + 2, 2).value = (typeData as any)[element]
        }
        await wb.xlsx.writeFile(filename.replace('.xlsx', ' - new.xlsx'))
        ElNotification.success({
            message: '操作完成'
        })
    } catch (error: any) {
        console.error(filename, error)
        appContext.config.globalProperties.$message.error(error?.message ?? 'error')
    }
}
</script>

<template>
    <div>
        <el-card class="box-card">
            <template #header>
            <div class="card-header">
                <span>要处理的测试报告</span>
            </div>
            </template>
            <div>
                <span style="font-weight: 600;">要处理的测试报告：</span><span>{{ logFile }}</span><br />
                <span style="font-weight: 600;">生成的测试报告：</span><span>{{ newLogFile }}</span><br />
                <br />
                <el-button @click="selectLogFile">选择文件</el-button>
                <el-button @click="openFolder" :disabled="!logFile">打开所在文件夹</el-button>
            </div>
            
        </el-card>
        <br />
        <el-card class="box-card">
            <template #header>
            <div class="card-header">
                <span>业务流程清单生成</span>
            </div>
            </template>
            <div>
                <ol>
                    <li>自动生成“业务流程清单”表</li>
                    <li>自动链接业务流程、说明、测试结果到对应位置</li>
                </ol>
                <br />
                <el-button @click="generatorProcessList" type="primary" :disabled="!logFile">处理生成</el-button>
            </div>
            
        </el-card>
        <br />
        <el-card class="box-card">
            <template #header>
            <div class="card-header">
                <span>获取EAP配置信息（dev）</span>
                <span>
                    处理同目录所有文件及子文件的文件<el-switch v-model="handleTypeDataByDir"></el-switch>
                </span>
            </div>
            </template>
            <div>
                <ol>
                    <li>EID TYPE</li>
                    <li>DESPER LEN</li>
                    <li>....</li>
                </ol>
                <br />
                <el-button @click="getCheckListTypeData" type="primary" :disabled="!logFile">处理生成</el-button>
            </div>
        </el-card>
        <br />
        <el-card class="box-card">
            <template #header>
            <div class="card-header">
                <span>单机测试报告准备</span>
            </div>
            </template>
            <div>
                <ol>
                    <li>清空非NA项目的Result和Log</li>
                    <li>注意：“测试信息” 需要手动处理</li>
                </ol>
                <br />
                <el-button @click="prepareCheckList" type="primary" :disabled="!logFile">处理生成</el-button>
            </div>
        </el-card>
    </div>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>