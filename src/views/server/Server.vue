<script setup lang="ts">
import { getIPs } from '@/utils/common';
import { FileServer } from '@/utils/server';
import { ref, computed, onUnmounted } from 'vue';
const remote = require('@electron/remote') as typeof import('@electron/remote')

const serverStatus = ref(0)
const serverStatusText = [
    "已关闭", "运行中"
]
// const oldServer = (window as any).server;
const server = new FileServer(localStorage.getItem('shareFolder') || '', localStorage.getItem('uploadFolder') || '', parseInt(localStorage.getItem('serverPort') || '8081'));
// (window as any).server = server;
const serverPort = ref(server.port)
const shareFolder = ref(server.shareDir)
const uploadFolder = ref(server.uploadDir)
const startServer = ()=>{
    server.shareDir = shareFolder.value || ''
    server.uploadDir = uploadFolder.value || ''
    server.port = serverPort.value
    try {
            
        server.start().then(()=>{
            console.log('server started.')
            serverStatus.value = 1;
        }).catch(err=>{
            console.error('failed to start server:', err)
        })
    } catch (error) {
        console.error(error)
    }
}
// Test
// startServer()
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
            localStorage.setItem('shareFolder', res.filePaths[0])
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
            localStorage.setItem('uploadFolder', res.filePaths[0])
            server.uploadDir = uploadFolder.value
        }
        
    })
}
const localIPS = computed(()=>{
    return getIPs()
})
onUnmounted(()=>{
    console.log('onUnmounted')
    stopServer()
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
                <el-button @click="restartServer" :disabled="serverStatus === 0">重启</el-button>
            </div>
        </el-card>
        <br>
    </div>
</template>


<style lang="scss" scoped>
</style>