<template>
        <el-card v-if="log">
            <el-col>
                <el-row>
                    <el-col :span="4">{{log.title}}</el-col>

                    <el-col :span="12">
                        <el-select
                        v-model="log.eventId"
                        filterable
                        @change="eventTypeChange"
                        placeholder="Select"
                        v-if="isInclude611"
                        >
                            <el-option
                            v-for="item in eventList"
                            :key="item.value"
                            :label="item.label"
                            :value="item.value"
                            />
                        </el-select>
                    </el-col>
                
                    <el-col :span="4">
                        <el-row>
                            <el-select v-model="log.result">
                                <el-option label="NA" value="NA"></el-option>
                                <el-option label="OK手动" value="OK"></el-option>
                                <el-option label="OK自动" value="OK2"></el-option>
                                <el-option label="NG手动" value="NG"></el-option>
                                <el-option label="NG自动" value="NG2"></el-option>
                            </el-select>
                        </el-row>
                    </el-col>
                    <el-col :span="4">
                        &nbsp;&nbsp;&nbsp;
                            <el-button :disabled="true">记录log</el-button>
                            <el-button type="danger" :disabled="true">停止</el-button>
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
                                <template v-for="cmd in log.cmdList">
                                    <hr />
                                    <el-row :span="6" style="font-size: smaller">
                                        <el-col :span="7">{{cmd.direct === 'E2H' ? '' : cmd.comment}}</el-col>
                                        <el-col :span="5">{{cmd.direct === 'E2H' ? '' : (cmd.s?`S${cmd.s}F${cmd.f}->`:'')}}</el-col>
                                        <el-col :span="5">{{cmd.direct === 'E2H' ? (cmd.s?`<-S${cmd.s}F${cmd.f}`:'') : ''}}</el-col>
                                        <el-col :span="5">{{cmd.direct === 'E2H' ? cmd.comment : ''}}</el-col>
                                    </el-row>
                                </template>
                            </el-col>
                            <el-col :span="4">
                                <div v-html="log.analyze"></div>
                            </el-col>
                        </el-row>
                    </el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row>
                    <el-input
                    type="textarea"
                    :disabled="true"
                    :value="log.log"
                    >
                    </el-input>
                </el-row>
            </el-col>
        </el-card>
        <br />
</template>

<script setup lang="ts">
import { AnalyzeFunc } from '@/utils/log';

const props = defineProps({
    log: Object,
    secsData: Object,
    eventList: Array<any>
})

const log = ref(props.log)

const eventTypeChange = (value: string)=>{
    console.log('eventTypeChange:', value)
    if(log.value && props.secsData){
        log.value.analyze = AnalyzeFunc.getAnalyzeStr611(props.secsData, value)
    }
}

const isInclude611 = computed(()=>{
    if(log.value){
        const ret = log.value?.cmdList?.filter((e: { s: string; f: string; })=>e.s == '6' && e.f == '11')
        if(ret){
            return ret.length > 0
        }
    }
    return false
})

watch(
    ()=>props.log,
    (newLog)=>{
        if(newLog){
            log.value = newLog
        }
    }
)
</script>

<style scoped>

</style>