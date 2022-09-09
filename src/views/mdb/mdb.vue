<script setup lang="ts">
import { Connection } from 'odbc';
import {ComponentInternalInstance, ref, getCurrentInstance} from 'vue';
import * as OBDC from '@/utils/odbc'
import { ElMessage } from 'element-plus';
import EDITDATA from './components/edit.vue'
const remote = require('@electron/remote') as typeof import('@electron/remote');
const { appContext } = getCurrentInstance() as ComponentInternalInstance;

// D:\\Work\\EAP&MES\\SL01-EAP-20220811\\SL01-EAP\\Config\\Data\\data.mdb
const dbPath = ref(localStorage.getItem('dbPath') || '')
const dbTables = ref([] as any[])
const curTableName = ref('')
const curTableData = ref([] as any[])
const curTableColumns = ref([] as any[])
const currentTableData = ref([])
const currentTablePage = ref(1)
const currentTableTotal = ref(1)
const currentTablePageSize = ref(10)
const isEdit = ref(true)
const editData = ref({})

const selectDatabase = async()=>{
    
    const result = await remote.dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            {
                name: 'Access Database',
                extensions: ['mdb']
            },
            {
                name: 'All',
                extensions: ['*']
            }
        ],
    });
    console.log(result)
    if(!result.canceled){
        dbPath.value = result.filePaths[0]
        localStorage.setItem('dbPath', dbPath.value as string)
    }
}
const openDatabase = async function() {
    console.log('openDatabase')
    const connection = await OBDC.openDatabase(dbPath.value);
    console.log(connection)
    const userTable = await OBDC.getTables() as any
    dbTables.value = userTable.data
    console.log(userTable)
}

const selectTable = async function(tableName: any){
    console.log('selectTable:', tableName)
    const tableData = await OBDC.getAllTableData({
        tableName,
        pageSize: currentTablePageSize.value
    }) as any
    console.log('tableData:', tableData)
    currentTablePage.value = 1
    currentTableTotal.value = tableData.data.totalCount
    currentTableData.value = tableData.data.result
    const data = []
    let end = currentTablePage.value * currentTablePageSize.value
    if(end > currentTableTotal.value)
        end = currentTableTotal.value
    for (let i = 0; i < end; i++) {
        data.push(tableData.data.result[i])
    }
    curTableData.value = data

    // 列信息
    const columns = []
    if(tableData.data.result.length > 0){
        for(let col of tableData.data.result.columns){
            columns.push(col.name)
        }
    }
    curTableColumns.value = columns
}
const updateCurrentPage = (page: number)=>{
    currentTablePage.value = page
    console.log('updateCurrentPage:', page)
    const start = (page - 1) * currentTablePageSize.value
    let end = page * currentTablePageSize.value
    if(end > currentTableTotal.value)
    end = currentTableTotal.value
    const data = [] as any[]
    for (let i = start; i < end; i++) {
        data.push(currentTableData.value[i])
    }
    curTableData.value = data
}

const updatePageSize = (size: number)=>{
    console.log('updatePageSize:', size)
    currentTablePageSize.value = size
}

const handleEdit = (index: number, row: any)=>{
    console.log('handleEdit:', index, row)
    const data = {} as any
    for(let key in row){
        data[key] = row[key]
    }
    editData.value = data
    isEdit.value = true
    ElMessage({
        type: 'warning',
        message: '开发中'
    }, appContext)
}
const handleDelete = (index: number, row: any)=>{
    console.log('handleDelete:', index, row)
    ElMessage({
        type: 'warning',
        message: '开发中'
    }, appContext)
}
const editConfirm = (data: any)=>{
    console.log('editConfirm:', data)

}
</script>

<template>
    <div>
        <h2>MDB 编辑</h2>
        MDB文件：<el-input v-model="dbPath"></el-input>
        <el-button @click="selectDatabase">选择数据库</el-button>
        <el-button @click="openDatabase">打开</el-button>
        <br>
        <el-tabs
            v-model="curTableName"
            type="card"
            class="demo-tabs"
            @tab-change="selectTable"
        >
            <el-tab-pane v-for="table in dbTables" :key="table.TABLE_NAME" :label="table.TABLE_NAME" :name="table.TABLE_NAME">
            </el-tab-pane>
        </el-tabs>
        <el-card style="width:80vw">
            <el-table :data="curTableData" style="width: 100%">
                <el-table-column v-for="colName in curTableColumns" :key="colName" :label="colName" width="180">
                    <template #default="scope">
                        <div style="display: flex; align-items: center">
                            <span style="margin-left: 10px">{{ scope.row[colName] }}</span>
                        </div>
                    </template>
                </el-table-column>
                <el-table-column fixed="right" label="操作" :width="150">
                    <template #default="scope">
                        <el-button size="small" @click="handleEdit(scope.$index, scope.row)"
                        >Edit</el-button
                        >
                        <el-button
                        size="small"
                        type="danger"
                        @click="handleDelete(scope.$index, scope.row)"
                        >Delete</el-button
                        >
                    </template>
                </el-table-column>
            </el-table>
            <el-pagination
                small
                background
                layout="prev, pager, next"
                class="mt-4"
                :total="currentTableTotal"
                :page-size="currentTablePageSize"
                @update:page-size="updatePageSize"
                :current-page="currentTablePage"
                @update:current-page="updateCurrentPage"
            />
        </el-card>

        <!-- 编辑 -->
        <el-dialog v-model="isEdit" title="编辑Dialog">
            <EDITDATA :data="editData" :column="curTableColumns" @save="editConfirm"></EDITDATA>
        </el-dialog>
    </div>
</template>

<style scoped>

</style>