
<script setup lang="ts">
import * as secsHandle from '@/utils/secs'
import { ComponentInternalInstance, ref, getCurrentInstance } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import { changeWorkSheetPosition, copyWorksheet } from '@/utils/excel';
const remote = require('@electron/remote') as typeof import('@electron/remote');
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')
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
    
    const eventWorkSheet = wb.getWorksheet('Event List')
    if (!eventWorkSheet) throw new Error("Event List工作表获取失败！");
    const resultWorkSheet = wb.addWorksheet('ERV Merge List(整合表)');
    // 复制表
    copyWorksheet(eventWorkSheet, resultWorkSheet);
    // 移动表
    changeWorkSheetPosition(wb, (resultWorkSheet as any).orderNo, (eventWorkSheet as any).orderNo);
    
    // 写入读取，补全缺失的参数
    await wb.xlsx.writeFile(newSecsFile.value)
    await wb.xlsx.readFile(newSecsFile.value as string);

    try {
        secsHandle.testPrepareV2(wb)
        await wb.xlsx.writeFile(newSecsFile.value)
        ElMessage({
            type: 'success',
            message: '操作完成'
        }, appContext)
    } catch (error: any) {
        console.error(error)
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
            
        const ret = secsHandle.fixDataForXML(wb)
        await wb.xlsx.writeFile(newSecsFile.value)
        if(ret){
            console.warn(ret)
            ElMessageBox({
                type: 'warning',
                dangerouslyUseHTMLString: true,
                message: ret,
                customStyle: {
                    maxWidth: '60vw'
                }
            }, appContext)
        }else
        ElMessage({
            type: 'success',
            message: '操作完成'
        }, appContext)
    } catch (error: any) {
        console.log(error)
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
                <el-button @click="selectLogFile" type="primary">选择文件</el-button>
                <el-button @click="openFolder" :disabled="!secsFile">打开所在文件夹</el-button>
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
                <el-button @click="generatorMergeSECS" type="primary" :disabled="!secsFile">处理生成</el-button>
            </div>
        </el-card>
        <br>
        <el-card>
            <template #header>
                <span>转XML预处理 (待完善)</span>
            </template>
            <div>
                <ol>
                    <li>项目类型矫正</li>
                    <li>列补全</li>
                </ol>
                <br />
                <el-button @click="fixDataForXML" type="primary" :disabled="!secsFile">处理生成</el-button>
            </div>
        </el-card>
    </div>
</template>

<style scoped>

</style>