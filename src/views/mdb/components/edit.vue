<script setup lang="ts">
import {defineProps} from 'vue'
const props = defineProps<{
    data: any,
    column: Array<string>,
}>()
const originalData = {} as any
for(let col of props.column){
    originalData[col] = props.data[col]
}
const emit = defineEmits(['save', 'cancel']);

const doSave = ()=>{
    const updateData = [] as any[]
    for(let col of props.column){
        if(originalData[col] !== props.data[col]){
            // 发生变更
            updateData.push(col, props.data[col])
        }
    }
    emit('save', {
        result: props.data,
        update: updateData,
        originalData
    })
}
</script>

<template>
    <div>
        编辑界面
        <br>
        <el-form :inline="true" :model="data" class="demo-form-inline">
            <el-form-item v-for="col in column" :key="col" :label="col">
                <el-input v-model="data[col]" :placeholder="col" />
            </el-form-item>
        </el-form>
        <br>
        <el-button @click="doSave">保存</el-button>
    </div>
</template>

<style scoped>

</style>