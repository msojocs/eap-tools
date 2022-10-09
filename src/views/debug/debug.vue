<template>
    <div>
        <h2>debug page</h2>
        <el-button @click="startWatch" type="primary" >start</el-button>
        <el-button @click="stopWatch" type="danger" >stop</el-button>
        <br />
        <br>
        <el-card>
            <template #header>
                <h3>log monitor</h3>
            </template>
            <pre>{{logStr}}</pre>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { LogWatcher, parseLog } from '@/utils/log'
import { ref } from 'vue';

const watcher = new LogWatcher();

const logStr = ref('')

const startWatch = ()=>{
    logStr.value = ''
    // /HBFP-DES-003-L/20220912/Trace
    watcher.start(`D:/Log/EAP/**/${new Date().getFullYear()}${(new Date().getMonth()+1 + '').padStart(2, '0')}${(new Date().getDate() + '').padStart(2, '0')}/Trace/*`, function (newData: string, filename: string){
        // console.log('call callback')
        console.log(...arguments)
        logStr.value += newData
        console.log(parseLog(logStr.value))
    })
}
const stopWatch = ()=>{
    watcher.stop()
}
</script>

<style scoped>

</style>