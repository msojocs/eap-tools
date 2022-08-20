<script setup lang="ts">
import * as logHandle from '@/utils/log'
import { ComponentInternalInstance, getCurrentInstance, ref } from 'vue'
import { ElMessage } from 'element-plus'
const remote = require('@electron/remote') as typeof import('@electron/remote');
const Excel = require('exceljs') as typeof import('exceljs')
// 在你的 setup 方法中
const { appContext } = getCurrentInstance() as ComponentInternalInstance;

const logFile = ref(localStorage.getItem('logFile'))

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
        newLogFile.value = logFile.value as string
        let dotPos = newLogFile.value.lastIndexOf('.')
        newLogFile.value = newLogFile.value.replace(newLogFile.value.substring(0, dotPos), `${newLogFile.value.substring(0, dotPos)} - new`)
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
    (window as any).wb = wb
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
</script>

<template>
    <div>
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
                <span style="font-weight: 600;">要处理的测试报告：</span><span>{{ logFile }}</span><br />
                <span style="font-weight: 600;">生成的测试报告：</span><span>{{ newLogFile }}</span><br />
                <br />
                <el-button @click="selectLogFile">选择文件</el-button>
                <el-button @click="generatorProcessList" type="primary">生成</el-button>
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
                </ol>
                <span style="font-weight: 600;">要处理的测试报告：</span><span>{{ logFile }}</span><br />
                <span style="font-weight: 600;">生成的测试报告：</span><span>{{ newLogFile }}</span><br />
                <br />
                <el-button @click="selectLogFile">选择文件</el-button>
                <el-button @click="prepareCheckList" type="primary">生成</el-button>
            </div>
            
        </el-card>
    </div>
</template>

<style lang="scss" scoped>
    
</style>