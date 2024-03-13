<template>
  <div>
    <div class="chatBoxTitle">
      <el-avatar
        shape="circle"
        v-if="props.sendRole == 'vicuna'"
        :src="VicunaIcon"
      />
      <el-avatar
        v-else
        shape="circle"
        :size="28"
        :style="{
          background: '#10a37f',
        }"
        :icon="UserFilled"
      />
      <div class="title">
        <div class="date">{{ date }}</div>
      </div>
    </div>
    <div v-html="props.responseMarkdown"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, type PropType } from "vue";
import { UserFilled } from "@element-plus/icons-vue";
const VicunaIcon = new URL("@/assets/vicuna.jpeg", import.meta.url).href;

const formatTime = (time: Date) => {
  const formatter = new Intl.DateTimeFormat("zh-CN", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
    day: "numeric",
    month: "short",
  });
  return formatter.format(time);
};

const date = ref("");
onMounted(() => {
  date.value = formatTime(props.time);
});

const props = defineProps({
  responseMarkdown: {
    type: String,
    default: "",
  },
  time: {
    type: Date,
    default: new Date(),
  },
  sendRole: {
    type: String as PropType<"vicuna" | "user">,
    default: "vicuna",
  },
});
</script>

<style scoped lang="less">
.title {
  display: flex;
  align-items: center;
  margin: 16px 0;
  & > img {
    height: 14px;
    width: auto;
    margin-right: 16px;
  }
}

.el-avatar {
  font-size: 14px;
  line-height: 17px;
  margin-right: 16px;
}
.chatBoxTitle {
  display: flex;
  align-items: center;
}
</style>
