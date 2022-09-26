<template>
        <el-card v-if="reportData">
            <el-col>
                <el-row>
                    <el-col :span="4">{{reportData.title}}</el-col>

                    <el-col :span="12">
                        <!-- S6F11选项 -->
                        <el-select
                        v-model="reportData.eventIdList"
                        filterable
                        @change="eventTypeChange"
                        placeholder="Select S6F11"
                        v-if="isInclude611"
                        style="width: 100%;"
                        multiple
                        >
                            <el-option
                            v-for="item in eventList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            />
                        </el-select>

                        <!-- S2F41选项 -->
                        <el-select
                        v-model="reportData.rcmdList"
                        filterable
                        @change="rcmdTypeChange"
                        placeholder="Select S2F41"
                        v-if="isInclude241"
                        style="width: 100%;"
                        multiple
                        >
                            <el-option
                            v-for="item in rcmdList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            />
                        </el-select>
                    </el-col>
                
                    <el-col :span="4">
                        <el-row>
                            <el-select v-model="reportData.result">
                                <el-option label="NA" value="NA"></el-option>
                                <el-option label="OK手动" value="OK"></el-option>
                                <el-option label="OK自动" value="OK2"></el-option>
                                <el-option label="NG手动" value="NG"></el-option>
                                <el-option label="NG自动" value="NG2"></el-option>
                            </el-select>
                        </el-row>
                    </el-col>
                    <el-col :span="4">
                        <el-button circle v-if="watcherStatus == 'down' || watcherStatus == 'pause'" @click="startWatch">
                            <iconfont icon-name="start" style="font-size: 0.9rem;"></iconfont>
                        </el-button>
                        <el-button circle  v-if="watcherStatus == 'run'" @click="pauseWatch">
                            <iconfont icon-name="pause" style="font-size: 0.9rem;"></iconfont>
                        </el-button>
                        <el-button circle v-if="watcherStatus == 'run' || watcherStatus == 'pause'" type="danger" @click="stopWatch">
                            <iconfont icon-name="stop" style="font-size: 0.9rem;"></iconfont>
                        </el-button>
                    </el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row :align="'middle'">
                    <el-col>
                        <el-row style="font-weight:bold">
                            <el-col :span="6">Comment</el-col>
                            <el-col :span="4">Host</el-col>
                            <el-col :span="4">Equipment</el-col>
                            <el-col :span="6">Comment</el-col>
                            <el-col :span="4">Analyze</el-col>
                        </el-row>
                        <el-row>
                            <el-col :span="20">
                                <template v-for="cmd in reportData.cmdList">
                                    <!-- <hr /> -->
                                    <el-row :span="6" style="font-size: smaller">
                                        <el-col :span="7">{{cmd.direct === 'E2H' ? '' : cmd.comment}}</el-col>
                                        <el-col :span="5">{{cmd.direct === 'E2H' ? '' : (cmd.s?`S${cmd.s}F${cmd.f}->`:'')}}</el-col>
                                        <el-col :span="5">{{cmd.direct === 'E2H' ? (cmd.s?`<-S${cmd.s}F${cmd.f}`:'') : ''}}</el-col>
                                        <el-col :span="5">{{cmd.direct === 'E2H' ? cmd.comment : ''}}</el-col>
                                    </el-row>
                                </template>
                            </el-col>
                            <el-col :span="4">
                                <div v-html="reportData.analyze"></div>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row>
                    <el-input
                    type="textarea"
                    v-model="reportData.reason"
                    :rows="1"
                    >
                    </el-input>
                </el-row>
                <br />
                <el-row>
                    <el-input
                    type="textarea"
                    v-model="reportData.log"
                    :rows="10"
                    >
                    </el-input>
                </el-row>
            </el-col>
        </el-card>
        <br />
</template>

<script setup lang="ts">
import { AnalyzeFunc, checkLog, LogWatcher, parseLog } from '@/utils/log';
import type { ReportItemData, SecsData } from '@/utils/types';
import Iconfont from '@/components/iconfont.vue';
import { EventListData, RcmdListData } from './types';

const props = defineProps<{
    log: ReportItemData,
    secsData: SecsData,
    eventList: EventListData[],
    rcmdList: RcmdListData[]
}>()

const reportData = ref(props.log)
// 日志监视器状态
const watcherStatus = ref<'run'|'pause'|'down'>('down')

const watcher = new LogWatcher();
// 启动监听
const startWatch = ()=>{
    if(watcherStatus.value == 'pause'){
        
        watcherStatus.value = 'run'
        return
    }
    watcherStatus.value = 'run'
    
    reportData.value.log = ''
    // TODO: 路径配置化
    // /HBFP-DES-003-L/20220912/Trace
    watcher.start(`D:/Log/EAP/**/${new Date().getFullYear()}${(new Date().getMonth()+1 + '').padStart(2, '0')}${new Date().getDate()}/Trace/*`, function (newData: string, filename: string){
        // console.log('call callback')
        console.log(...arguments)
        // 暂停不记录
        if(watcherStatus.value == 'pause')return

        // 记录新的日志
        reportData.value.log += newData
        // console.log(parseLog(logStr.value))

    })
}

// 暂停记录
const pauseWatch = ()=>{
    
    watcherStatus.value = 'pause'
}

// 停止监听
const stopWatch = ()=>{
    
    watcherStatus.value = 'down'
    watcher.stop()
}

// 手动变更事件
const eventTypeChange = (value: string[])=>{
    // console.log('eventTypeChange:', value)
    if(reportData.value && props.secsData){
        reportData.value.analyze = ''
        for(let v of value)
        reportData.value.analyze += AnalyzeFunc.getAnalyzeStr611(props.secsData, v)
    }
}
// 手动变更远程指令
const rcmdTypeChange = (value: string[])=>{
    // console.log('eventTypeChange:', value)
    // if(reportData.value && props.secsData){
    //     reportData.value.analyze = ''
    //     for(let v of value)
    //     reportData.value.analyze += AnalyzeFunc.getAnalyzeStr611(props.secsData, v)
    // }
}

// 指令是否包含S6F11
const isInclude611 = computed(()=>{
    if(reportData.value){
        const ret = reportData.value?.cmdList?.filter(e=>e.s == '6' && e.f == '11')
        if(ret){
            return ret.length > 0
        }
    }
    return false
})

// 指令是否包含S2F41
const isInclude241 = computed(()=>{
    if(reportData.value){
        const ret = reportData.value?.cmdList?.filter(e=>e.s == '2' && e.f == '41')
        if(ret){
            return ret.length > 0
        }
    }
    return false
})

watch(
    ()=>reportData.value.log,
    (newValue)=>{
        console.log('日志数据更新')
        if(newValue){

            // TODO: 自动分析
            /**
             * 需要的数据：已收集到的日志，指令列表
             * 1. 解析收集到的日志
             * 2. 根据指令列表检测
             * 
             */
            const logDataObj = parseLog(reportData.value.log)
            console.log(reportData.value, logDataObj)
            const checkResult = checkLog(reportData.value, logDataObj, props.secsData)
            console.log('checkResult:', checkResult)
            reportData.value.result = checkResult.ok ? 'OK2' : 'NG2'
            reportData.value.reason = checkResult.reason || ''
        }
    }
)
watch(
    ()=>props.log,
    (newLog)=>{
        if(newLog){
            reportData.value = newLog
        }
    }
)
</script>

<style scoped>

</style>