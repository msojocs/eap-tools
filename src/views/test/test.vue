<script setup lang="ts">
import { parseLog } from '@/utils/log';
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

const doParseLog = ()=>{
    const str = `

2022-09-12 14:45:23.8407[TRACE]RECV-S2F35 Wbit=[True] Systembytes=[7].
Header=00 01 82 23 00 00 00 00 00 07  
 01 02 A9 02 00 01 01 00  
     <L,2 
        <U2,1 , '1'>,
        <L,0 
        >
    >`

    const result = parseLog(str)
    console.log(result)
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
            <br>
            <el-button @click="doParseLog">日志解析</el-button>
        </el-main>
    </el-container>
</template>

<style lang="scss" scoped>
    
</style>