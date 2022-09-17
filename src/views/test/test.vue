<script setup lang="ts">
const cmdList = [
    {
        direct: 'H2E',
        s: 1,
        f: 13,
        comment: '13'
    },
    {
        direct: 'E2H',
        s: 1,
        f: 14,
        comment: '14'
    },
]
</script>

<template>
    <el-container>
        <el-header>
            <el-space wrap>
                <span>测试信息</span>
                <span>连线初始化</span>
            </el-space>
        </el-header>
        <el-main>
            <el-card>
                <el-col>
                    <el-row>连线初始化（Host Trigger）</el-row>
                    <el-divider></el-divider>
                    <el-row :align="'middle'">
                        <el-col :span="16">
                            <el-row :span="6" style="font-weight:bold">
                                <el-col :span="6">Comment</el-col>
                                <el-col :span="6">Host</el-col>
                                <el-col :span="6">Equipment</el-col>
                                <el-col :span="6">Comment</el-col>
                            </el-row>
                            <block v-for="cmd in cmdList">
                                <el-row :span="6" v-if="cmd.direct === 'H2E'">
                                    <el-col :span="6">{{cmd.comment}}</el-col>
                                    <el-col :span="6">S{{cmd.s}}F{{cmd.f}}-&gt;</el-col>
                                    <el-col :span="6"></el-col>
                                    <el-col :span="6"></el-col>
                                </el-row>
                                <el-row :span="6" v-else>
                                    <el-col :span="6"></el-col>
                                    <el-col :span="6"></el-col>
                                    <el-col :span="6">&lt;-S{{cmd.s}}F{{cmd.f}}</el-col>
                                    <el-col :span="6">{{cmd.comment}}</el-col>
                                </el-row>
                            </block>
                        </el-col>
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
                    <el-row>
                        <el-input type="textarea" :disabled="true"></el-input>
                    </el-row>
                </el-col>
            </el-card>
        </el-main>
    </el-container>
</template>

<style lang="scss" scoped>
    
</style>