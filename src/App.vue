<script setup lang="ts">
import InputTable from "./components/InputTable.vue";
import OutputTable from "./components/OutputTable.vue";
import { layoutConst } from "./const";
import { useInputStore } from "./pinia/inputStore";

const store = useInputStore();
const submit = (text: string) => {
  store.setInputText(text);
  store.setIsSubmitted(true);
};
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <div class="header">{{ layoutConst.HeaderTitle }}</div>
      </el-header>
      <el-container>
        <el-main>
          <el-row class="container">
            <el-col :span="10" :offset="1">
              <input-table @submit="submit"></input-table>
            </el-col>
            <el-col :span="10" :offset="2">
              <output-table></output-table>
            </el-col>
          </el-row>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<style scoped lang="less">
.header {
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  padding: 20px;
}
</style>
