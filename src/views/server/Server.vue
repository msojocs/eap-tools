<script setup lang="ts">
import { useCustomStore } from '@/store';
import { getIPs } from '@/utils/common';
import { FileServer } from '@/utils/server';
import { ref, computed, onUnmounted } from 'vue';
const remote = require('@electron/remote') as typeof import('@electron/remote')
const { shell } = require('electron') as typeof import('electron');

const store = useCustomStore()
const serverStatus = ref(0)
const serverStatusText = [
    "已关闭", "运行中"
]
// const oldServer = (window as any).server;
const server = new FileServer(store.getters['server/sharePath'] || '', store.getters['server/uploadPath'] || '', store.getters['server/port']);
// (window as any).server = server;
console.log(server)
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

const changePort = (port: string)=>{
    store.commit('server/updatePort', port)
}
const selectShareFolder = ()=>{
    remote.dialog.showOpenDialog({
        properties: ['openDirectory', 'createDirectory']
    }).then(res=>{
        if(!res.canceled){
            shareFolder.value = res.filePaths[0]
            store.commit('server/updateSharePath', res.filePaths[0])
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
            store.commit('server/updateUploadPath', res.filePaths[0])
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
                <el-input v-model="shareFolder" :readonly="true">
                    <template #prepend>
                        共享路径：
                    </template>
                    <template #append>
                        <el-button @click="selectShareFolder">选择</el-button>
                    </template>
                </el-input>
                <br/>
                <br/>
                <el-input v-model="uploadFolder" :readonly="true">
                    <template #prepend>
                        上传路径：
                    </template>
                    <template #append>
                        <el-button @click="selectUploadFolder">选择</el-button>
                    </template>
                </el-input>
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
                端口：<el-input v-model="serverPort" type="number" style="width:100px" :disabled="serverStatus === 1" @change="changePort"></el-input>
                <br>
                <br>
                <span>点击链接可以在浏览器打开：</span>
                <br>
                <span
                    style="cursor: pointer;"
                    title="点击在浏览打开"
                    v-for="ip in localIPS"
                    :key="ip.name"
                    @click="shell.openExternal(`http://${ip.ip}:${server.port}`)"
                    >{{ip.name}}: http://{{ip.ip}}:{{server.port}}
                    <br>
                </span>
                <span>本地: http://127.0.0.1:{{server.port}}<br></span>
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