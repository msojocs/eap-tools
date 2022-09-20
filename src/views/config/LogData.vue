<template>
    <template v-for="log in props.data">
        <el-card>
            <el-col>
                <el-row>
                    <el-col :span="4">{{log.title}}</el-col>
                    <el-col :span="12"></el-col>
                
                    <el-col :span="4">
                        <el-row>
                            <el-select>
                                <el-option label="NA" value="NA"></el-option>
                                <el-option label="OK" value="OK"></el-option>
                                <el-option label="OK自动" value="OK2"></el-option>
                                <el-option label="NG" value="NG"></el-option>
                                <el-option label="NG自动" value="NG2"></el-option>
                            </el-select>
                        </el-row>
                    </el-col>
                    <el-col :span="4">
                        &nbsp;&nbsp;&nbsp;
                            <el-button>记录log</el-button>
                            <el-button type="danger">停止</el-button>
                    </el-col>
                </el-row>
                <el-divider></el-divider>
                <el-row :align="'middle'">
                    <el-col>
                        <el-row :span="6" style="font-weight:bold">
                            <el-col :span="6">Comment</el-col>
                            <el-col :span="4">Host</el-col>
                            <el-col :span="4">Equipment</el-col>
                            <el-col :span="10">Comment</el-col>
                        </el-row>
                        <template v-for="cmd in log.cmdList">
                            <hr />
                            <el-row :span="6" v-if="cmd.direct === 'E2H'" style="font-size: smaller">
                                <el-col :span="6"></el-col>
                                <el-col :span="4"></el-col>
                                <el-col :span="4">{{cmd.s?`<-S${cmd.s}F${cmd.f}`:''}}</el-col>
                                <el-col :span="10">{{cmd.comment}}</el-col>
                            </el-row>
                            <el-row :span="6" v-else style="font-size: smaller">
                                <el-col :span="6">{{cmd.comment}}</el-col>
                                <el-col :span="4">{{cmd.s?`S${cmd.s}F${cmd.f}->`:''}}</el-col>
                                <el-col :span="4"></el-col>
                                <el-col :span="10"></el-col>
                            </el-row>
                        </template>
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
</template>

<script setup lang="ts">
const props = defineProps({
    data: Object
})
</script>

<style scoped>

</style>