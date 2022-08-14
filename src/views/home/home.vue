<script setup lang="ts">
import * as logHandle from '@/utils/log'
import { getCurrentInstance, ref } from 'vue'
import { ElMessage } from 'element-plus'

// 在你的 setup 方法中
const { appContext } = getCurrentInstance()!
// ElMessage({}, appContext)
const remote = require('@electron/remote') as typeof import('@electron/remote');
const Excel = require('exceljs') as typeof import('exceljs')

const logFile = ref(localStorage.getItem('logFile'))

const newLogFile = ref(logFile.value as string)
let dotPos = newLogFile.value.lastIndexOf('.')
newLogFile.value = newLogFile.value.replace(newLogFile.value.substring(0, dotPos), `${newLogFile.value.substring(0, dotPos)} - new`)
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
const generator = async ()=>{
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(logFile.value as string)
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
</script>

<template>
    <div>
        <h2>业务流程清单生成</h2>
        <div>
            LOG文件：<span>{{ logFile }}</span><br />
            新的LOG文件：<span>{{ newLogFile }}</span><br />
            <el-button @click="selectLogFile" type="primary">选择文件</el-button>
            <el-button @click="generator">生成</el-button>
        </div>

    </div>
    
</template>

<style lang="scss" scoped>
    
</style>