<script setup lang="ts">
import { parseLog } from '@/utils/log';
import { genRecipeScriptDataV2 } from './other';


const recipeScript_725 = ref(`2022-06-30 15:59:24.4945[TRACE]Send [S7F25_H] Formatted Process Program Request,TrxId[202206301559244945],SystemBytes[137]
00 01 87 19 00 00 00 00 00 89 
41 08 35 30 32 58 35 39 35 35 
S7F25 H2E Wbit(True) DeviceID(1) Systembytes(137)
<A [8] 502X5955> *PPID 

2022-06-30 15:59:39.6216[TRACE]Receive [S7F26_E] Formatted Process Program Acknowledge,TrxId[202206301559396206],SystemBytes[137]
00 01 07 1A 00 00 00 00 00 89 
01 04 41 08 35 30 32 58 35 39     35 35 41 08 50 72 65 50 61 73 
74 65 41 07 31 2E 30 2E 30 2E     30 01 01 01 02 41 01 30 01 31 
41 04 35 39 35 30 41 01 30 41     01 30 41 01 30 41 01 30 41 01 
30 41 01 30 41 01 30 41 01 31     41 01 30 41 01 30 41 04 35 30 
32 30 41 01 31 41 02 35 30 41     03 35 30 30 41 03 35 30 30 41 
03 35 30 30 41 03 35 30 30 41     03 35 30 30 41 03 35 30 30 41 
03 35 30 30 41 03 35 30 30 41     02 33 38 41 03 35 30 30 41 03 
35 30 30 41 03 35 30 30 41 03     35 30 30 41 02 35 30 41 01 30 
41 01 30 41 04 33 30 30 30 41     01 30 41 01 30 41 02 35 30 41 
04 33 30 30 30 41 01 30 41 01     30 41 01 30 41 03 31 30 30 41 
05 31 38 38 34 30 41 03 33 30     30 41 03 33 30 30 41 01 30 41 
10 20 20 20 20 20 20 20 20 20     20 20 20 20 20 20 20 41 03 31 
30 30 41 01 30 41 01 30 41 01     30 41 01 30 
S7F26 E2H Wbit(False) DeviceID(1) Systembytes(137)
<L [4]
    <A [8] 502X5955> *PPID 
    <A [13] PrePaste->123> *MDLN 
    <A [7] 1.0.0.0> *SOFTREV 
    <L [1]
        <L [2]
            <A [1] 0> *CCODE 
            <L [49]
                <A [4] 5950> *PPARM 
                <F4 [1] 7.7> *PPARM 
                <A [5] 015.1> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 1> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [4] 5020> *PPARM 
                <A [1] 1> *PPARM 
                <A [2] 50> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [2] 38> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [3] 500> *PPARM 
                <A [2] 50> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [4] 3000> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [2] 50> *PPARM 
                <A [4] 3000> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [3] 100> *PPARM 
                <A [5] 18840> *PPARM 
                <A [3] 300> *PPARM 
                <A [3] 300> *PPARM 
                <A [1] 0> *PPARM 
                <A [16]                 > *PPARM 
                <A [3] 100> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
                <A [1] 0> *PPARM 
            >
        >
    >
>`)

const recipeScript_725_output = computed(()=>{
    
    if(!recipeScript_725.value)return ''

    const log = parseLog(recipeScript_725.value)
    const s7f25Log = log.filter(e=>e.s == '7' && e.f == '25')
    if(s7f25Log.length === 0)return ''

    console.log(s7f25Log)
    const s7f23Script = genRecipeScriptDataV2(s7f25Log[0])
    console.log(s7f23Script)
    return s7f23Script
})


</script>

<template>
    <el-container>
        <el-header>
            <h2>????????????</h2>
        </el-header>
        <el-main>
            <el-card>
                <template #header>
                    <div class="card-header">
                        <span>??????????????????</span>
                    </div>
                </template>
                Recipe Body Request(S7F25, S7F26) ?????????
                <el-input type="textarea" v-model="recipeScript_725" :rows="10"></el-input>
                S7F23???????????????
                <el-input type="textarea" v-model="recipeScript_725_output" :rows="10"></el-input>
            </el-card>
        </el-main>
    </el-container>
</template>

<style scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.text {
  font-size: 14px;
}
</style>