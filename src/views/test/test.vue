<script setup lang="ts">
import * as secs from '@/utils/secs'
const fs = require('fs') as typeof import('fs')
const Excel = require('exceljs-enhance') as typeof import('exceljs-enhance')

const path = ref(localStorage.getItem('test-path') || '')
const start1 = async()=>{
    /*
    1. 读取日志
    2. 获取远程控制日志
    3. 获取start与select是否NA
    4. 取日志，
    5. 根据日志到SECS里面找指令
    6. 拼接字符串
    7. 写入文件
    */
    const dir = fs.readdirSync(path.value)
    // console.log(dir)
    for(let file of dir){
        const wb = new Excel.Workbook()
        await wb.xlsx.readFile(`${path.value}\\${file}`)
        
        const secsData = await secs.parse(wb)
        // console.log(secsData)
        const { rcmd2cpid, rcpData } = secsData
        console.log(rcmd2cpid, rcpData)
        
    }
}
const start2 = async()=>{
    /*
    1. 读取日志
    2. 获取远程控制日志
    3. 获取start与select是否NA
    4. 取日志，
    5. 根据日志到SECS里面找指令
    6. 拼接字符串
    7. 写入文件
    */
    const dir = fs.readdirSync(path.value)
    // console.log(dir)
    for(let file of dir){
        const wb = new Excel.Workbook()
        await wb.xlsx.readFile(`${path.value}\\${file}`)
        
        const secsData = await secs.parse(wb)
        // console.log(secsData)
        const { rcmd2cpid, rcpData } = secsData
        console.log(rcmd2cpid, rcpData)
    }
}

watch(
    ()=>path.value,
    (value)=>{
        if(value){
            localStorage.setItem('test-path', value)
        }
    }
)
</script>

<template>
    <el-container>
        <el-main>
            <el-input v-model="path"></el-input>
            <el-button @click="start1">start</el-button>
            <el-button @click="start2">start</el-button>
        </el-main>
    </el-container>
</template>

<style lang="scss" scoped>
    
</style>