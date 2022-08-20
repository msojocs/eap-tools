
<script setup lang="ts">
import * as secsHandle from '@/utils/secs'
import { ComponentInternalInstance, ref, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus'
const remote = require('@electron/remote') as typeof import('@electron/remote');
const Excel = require('exceljs') as typeof import('exceljs')
// 在你的 setup 方法中
const { appContext } = getCurrentInstance() as ComponentInternalInstance;

const secsFile = ref(sessionStorage.getItem('secsFile'))
const newSecsFile = ref("")

if(secsFile.value){
    let dotPos = secsFile.value.lastIndexOf('.')
    newSecsFile.value = secsFile.value.replace(secsFile.value.substring(0, dotPos), `${secsFile.value.substring(0, dotPos)} - new`)
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
        secsFile.value = result.filePaths[0]
        sessionStorage.setItem('secsFile', secsFile.value as string)
        newSecsFile.value = secsFile.value as string
        let dotPos = newSecsFile.value.lastIndexOf('.')
        newSecsFile.value = newSecsFile.value.replace(newSecsFile.value.substring(0, dotPos), `${newSecsFile.value.substring(0, dotPos)} - new`)
    }
}

/**
 * 在资源管理器中打开文件
 * 
 */
const openFolder = ()=>{
    if(secsFile.value){
        remote.shell.showItemInFolder(secsFile.value)
        
    }else{
        ElMessage({
            type: 'error',
            message: '文件路径异常！'
        }, appContext)
    }
}

/**
 * id绑定关系整合
 */
const generatorMergeSECS = async ()=>{
    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(secsFile.value as string);
    (window as any).wb = wb
    console.log(wb)
    try {
            
        secsHandle.testPrepare(wb)
        await wb.xlsx.writeFile(newSecsFile.value)
        ElMessage({
            type: 'success',
            message: '操作完成'
        }, appContext)
    } catch (error: any) {
        appContext.config.globalProperties.$message.error(error?.message ?? 'error')
    }
}

/**
 * 转XML预处理
 * 类型矫正等
 * 
 */
const fixDataForXML = async ()=>{

    const wb = new Excel.Workbook()
    await wb.xlsx.readFile(secsFile.value as string);
    (window as any).wb = wb
    console.log(wb)
    try {
            
        secsHandle.fixDataForXML(wb)
        await wb.xlsx.writeFile(newSecsFile.value)
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
        <h2>SECS文件处理</h2>
        <el-card>
            <template #header>
                <span>要处理的SECS文件</span>
            </template>
            <div>
                <span style="font-weight: 600;">要处理的SECS文件：</span><span>{{ secsFile }}</span><br />
                <span style="font-weight: 600;">生成的SECS文件：</span><span>{{ newSecsFile }}</span><br />
                <br />
                <el-button @click="selectLogFile">选择文件</el-button>
                <el-button @click="openFolder" :disabled="!secsFile">打开所在文件夹</el-button>
            </div>
        </el-card>
        <br>
        <el-card>
            <template #header>
                <span>转XML预处理（开发中。。。）</span>
            </template>
            <div>
                <ol>
                    <li>项目类型矫正</li>
                </ol>
                <br />
                <el-button @click="fixDataForXML" type="primary">处理生成</el-button>
            </div>
        </el-card>
        <br>
        <el-card>
            <template #header>
                <span>单机测试准备</span>
            </template>
            <div>
                <ol>
                    <li>整合Event List，Report List，Variables List</li>
                </ol>
                <br />
                <el-button @click="generatorMergeSECS" type="primary">处理生成</el-button>
            </div>
        </el-card>
    </div>
</template>

<style scoped>

</style>