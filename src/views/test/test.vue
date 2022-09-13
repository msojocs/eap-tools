<script setup lang="ts">

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
                        <el-col :span="12">
                            <el-row :span="6" style="font-weight:bold">
                                <el-col :span="6">Comment</el-col>
                                <el-col :span="6">Host</el-col>
                                <el-col :span="6">Equipment</el-col>
                                <el-col :span="6">Comment</el-col>
                            </el-row>
                            <el-row :span="6">
                                <el-col :span="6">1</el-col>
                                <el-col :span="6">S1F13-&gt;</el-col>
                                <el-col :span="6"></el-col>
                                <el-col :span="6">4</el-col>
                            </el-row>
                            <el-row :span="6">
                                <el-col :span="6"></el-col>
                                <el-col :span="6"></el-col>
                                <el-col :span="6">&lt;-S1F14</el-col>
                                <el-col :span="6">4</el-col>
                            </el-row>
                            <el-row :span="6">
                                <el-col :span="6">1</el-col>
                                <el-col :span="6">2</el-col>
                                <el-col :span="6">3</el-col>
                                <el-col :span="6">4</el-col>
                            </el-row>
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
                            <el-row>
                                <el-button>记录log</el-button>
                            </el-row>
                            <el-row>
                                <el-button type="danger">停止</el-button>
                            </el-row>
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