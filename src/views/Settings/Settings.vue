<script setup lang="ts">
import { useCustomStore } from '@/store';
import { selectFolder } from '@/utils/common'

const store = useCustomStore()
const eapLogPath = ref(store.getters['settings/eapLogPath'] || '')

const selectLogFolder = ()=>{
    selectFolder().then(res=>{
        if(!res.canceled){
            eapLogPath.value = res.filePaths[0]
            store.commit('settings/updateEapLogPath', res.filePaths[0])
        }
    })
}
</script>

<template>
    <el-container>
        <el-header>
            <h3>设置页面</h3>
        </el-header>
        <el-main>
            <el-card>
                <el-form>
                    <el-form-item label="EAP日志文件夹">
                        <el-input v-model="eapLogPath">
                            <template #suffix>
                                \**\{{new Date().getFullYear()}}{{(new Date().getMonth()+1 + '').padStart(2, '0')}}{{(new Date().getDate() + '').padStart(2, '0')}}\Trace\*
                            </template>
                            <template #append>
                                <el-button @click="selectLogFolder">
                                    <el-icon>
                                        <Folder></Folder>
                                    </el-icon>
                                </el-button>
                            </template>
                        </el-input>
                    </el-form-item>
                </el-form>
            </el-card>
        </el-main>
    </el-container>
</template>

<style scoped>
.scroller{
    height: 100px;
}
</style>