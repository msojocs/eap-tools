<script setup lang="ts">

</script>

<template>
    <div>
        <el-timeline>
            <el-timeline-item timestamp="2022/10/16" placement="top">
                <el-card>
                    <h4>版本：v1.4.2</h4>
                    <ul>
                        <li>新增：测试报告中类型参数的自动识别</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/10/09" placement="top">
                <el-card>
                    <h4>版本：v1.3.8</h4>
                    <ul>
                        <li>新增：文件服务器打包下载文件夹</li>
                        <li>新增：配方脚本生成</li>
                        <li>修复：SECS整合，标题索引时调用toLocaleLowerCase失败的问题</li>
                        <li>优化：文件服务器相关路径数据存储，浏览器打开</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/10/09" placement="top">
                <el-card>
                    <h4>版本：v1.3.7</h4>
                    <ul>
                        <li>新增：单机测试日志路径可配置化</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/27" placement="top">
                <el-card>
                    <h4>版本：v1.3.6</h4>
                    <ul>
                        <li>SECS整合：兼容多个Report ID</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/27" placement="top">
                <el-card>
                    <h4>版本：v1.3.3</h4>
                    <ul>
                        <li>报告：新增 S1F3, S7F25, S10F3, S9F9</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/24" placement="top">
                <el-card>
                    <h4>版本：v1.3.0</h4>
                    <ul>
                        <li>报告：部分自动化核验</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/24" placement="top">
                <el-card>
                    <h4>版本：v1.2.0</h4>
                    <ul>
                        <li>报告：整合日志监听</li>
                        <li>报告：导出测试报告</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/23" placement="top">
                <el-card>
                    <h4>版本：v1.1.3</h4>
                    <ul>
                        <li>报告：S6F11事件分析强化</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/22" placement="top">
                <el-card>
                    <h4>版本：v1.1.0</h4>
                    <ul>
                        <li>报告：测试报告解析</li>
                    </ul>
                    <h4>版本：v1.1.1</h4>
                    <ul>
                        <li>报告：强化日志解析</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/17" placement="top">
                <el-card>
                    <h4>版本：v1.0.14</h4>
                    <ul>
                        <li>SECS文件处理：优化转XML预处理的列补全</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/11" placement="top">
                <el-card>
                    <h4>版本：v1.0.13</h4>
                    <ul>
                        <li>测试报告：修复处理后时间变成一串数字的问题</li>
                        <li>测试报告：新增子项目跳转至业务流程清单</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/09/10" placement="top">
                <el-card>
                    <h4>版本：v1.0.10</h4>
                    <ul>
                        <li>SECS文件处理：SECS ID 整合单独作为一个工作表</li>
                        <li>SECS文件处理：修复SECS ID 整合后标题丢失的问题</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/08/24" placement="top">
                <el-card>
                    <h4></h4>
                    <ul>
                        <li>新增MDB查看功能</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/08/23" placement="top">
                <el-card>
                    <h4></h4>
                    <ul>
                        <li>强化转XML预处理</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/08/23" placement="top">
                <el-card>
                    <h4></h4>
                    <ul>
                        <li>修正上传文件中文乱码的问题</li>
                    </ul>
                </el-card>
            </el-timeline-item>
            <el-timeline-item timestamp="2022/08/22" placement="top">
                <el-card>
                    <h4></h4>
                    <ul>
                        <li>修正清空log背景黑色的问题</li>
                    </ul>
                </el-card>
            </el-timeline-item>
        </el-timeline>
    </div>
</template>

<style scoped>

</style>