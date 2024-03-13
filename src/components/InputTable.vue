<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits(["submit"]);
const textarea = ref("");
const submit = () => {
  emit("submit", textarea.value);
};
const clear = () => {
  textarea.value = "";
};
</script>

<template>
  <div class="input-box">
    <el-input
      v-model="textarea"
      class="input-controller"
      type="textarea"
      placeholder="Please input"
      clearable
    />
    <el-row class="button-box">
      <el-col :span="6" :offset="6">
        <el-button size="large" @click="submit" type="primary">提交</el-button>
      </el-col>
      <el-col :span="6">
        <el-button size="large" @click="clear" type="danger">清空</el-button>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="less">
.input-controller {
  width: 80%;
  margin-bottom: 20px;
  height: calc(100vh - 200px);
  textarea {
    height: 100%;
    resize: none;
  }
}
.input-box {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.button-box {
  margin-top: 20px;
  width: 100%;
  .el-col {
    display: flex;
    justify-content: center;
  }
}
</style>
