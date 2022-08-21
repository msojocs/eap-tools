<script setup lang="ts">
import { getIPs } from '@/utils/common';
import { FileServer } from '@/utils/server';
import { ref, computed } from 'vue';
const remote = require('@electron/remote') as typeof import('@electron/remote')

const serverStatus = ref(0)
const serverStatusText = [
    "已关闭", "运行中"
]
const serverPort = ref(8081)
const shareFolder = ref(sessionStorage.getItem('shareFolder'))
const uploadFolder = ref(sessionStorage.getItem('uploadFolder'))
const server = new FileServer(shareFolder.value || '', uploadFolder.value || '', serverPort.value);
const startServer = ()=>{
    server.shareDir = shareFolder.value || ''
    server.uploadDir = uploadFolder.value || ''
    server.port = serverPort.value
    server.start().then(()=>{
        console.log('server started.')
        serverStatus.value = 1;
    }).catch(err=>{
        console.error('failed to start server:', err)
    })
}
// Test
startServer()
const stopServer = ()=>{
    server.stop().then(r=>{
        serverStatus.value = 0;
    })
}
const restartServer = ()=>{
    server.restart()
}

const selectShareFolder = ()=>{
    remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    }).then(res=>{
        if(!res.canceled){
            shareFolder.value = res.filePaths[0]
            sessionStorage.setItem('shareFolder', res.filePaths[0])
            server.shareDir = shareFolder.value
        }
        
    })
}
const selectUploadFolder = ()=>{
    remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    }).then(res=>{
        if(!res.canceled){
            uploadFolder.value = res.filePaths[0]
            sessionStorage.setItem('uploadFolder', res.filePaths[0])
            server.uploadDir = uploadFolder.value
        }
        
    })
}
const localIPS = computed(()=>{
    return getIPs()
})
</script>

<template>
    <div>
        <h2>文件传输服务</h2>
        <el-card>
            <template #header>
                路径配置
            </template>
            <div>
                共享路径：{{shareFolder}}
                <el-button @click="selectShareFolder">选择</el-button>
                <br>
                上传路径：{{uploadFolder}}
                <el-button @click="selectUploadFolder">选择</el-button>
            </div>
        </el-card>
        <br>
        <el-card>
            <template #header>
                服务器操作
            </template>
            <div>
                服务器状态：<span>{{serverStatusText[serverStatus]}}</span>
                <br>
                端口：<el-input v-model="serverPort" type="number" style="width:100px" :disabled="serverStatus === 1"></el-input>
                <br>
                <span v-for="ip in localIPS" :key="ip.name">{{ip.name}}: http://{{ip.ip}}:{{server.port}}<br></span>
                <br>
                <el-button @click="startServer" type="primary" :disabled="serverStatus === 1">启动</el-button>
                <el-button @click="stopServer" type="danger" :disabled="serverStatus === 0">停止</el-button>
                <el-button @click="restartServer">重启</el-button>
            </div>
        </el-card>
        <br>
    </div>
</template>


<style lang="scss" scoped>
</style>