
<script setup lang="ts">
import * as secsHandle from '@/utils/secs'
import { ComponentInternalInstance, ref, getCurrentInstance } from 'vue';
import { ElMessage } from 'element-plus'
const remote = require('@electron/remote') as typeof import('@electron/remote');
const Excel = require('exceljs') as typeof import('exceljs')
// 在你的 setup 方法中
const { appContext } = getCurrentInstance() as ComponentInternalInstance;

const secsFile = ref(localStorage.getItem('secsFile'))
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
        newSecsFile.value = secsFile.value as string
        let dotPos = newSecsFile.value.lastIndexOf('.')
        newSecsFile.value = newSecsFile.value.replace(newSecsFile.value.substring(0, dotPos), `${newSecsFile.value.substring(0, dotPos)} - new`)
    }
}
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
</script>

<template>
    <div>
        <h2>SECS文件处理</h2>
        <el-card>
            <template #header>
                <span>单机测试准备</span>
            </template>
            <div>
                <ol>
                    <li>整合Event List，Report List，Variables List</li>
                </ol>

                <span style="font-weight: 600;">要处理的测试报告：</span><span>{{ secsFile }}</span><br />
                <span style="font-weight: 600;">生成的测试报告：</span><span>{{ newSecsFile }}</span><br />
                <br />
                <el-button @click="selectLogFile">选择文件</el-button>
                <el-button @click="generatorMergeSECS" type="primary">生成</el-button>
            </div>
        </el-card>
    </div>
</template>

<style scoped>

</style>