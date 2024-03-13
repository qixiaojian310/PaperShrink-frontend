<template>
  <div class="responseBox">
    <el-scrollbar ref="scrollbarRef">
      <div ref="innerRef" class="scrollbarContainer">
        <chat-box
          v-for="(responseOutput, index) in responseOutputs"
          :key="index"
          :response-markdown="responseOutput.responseMarkdown"
          :send-role="responseOutput.sendRole"
        ></chat-box>
        <chat-box
          v-if="responseMarkdownNew.length != 0"
          :response-markdown="responseMarkdownNew"
          :send-role="'vicuna'"
        ></chat-box>
      </div>
    </el-scrollbar>
    <span
      class="backButton"
      :class="{ backButtonChecked: isBottomStably }"
      @click="toBottomButton()"
    >
      <el-icon :size="40" class="customIcon"><Bottom /></el-icon>
    </span>
  </div>
</template>

<script setup lang="ts">
import {
  ComputedRef,
  Ref,
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";
import { callOpenAI } from "../vicunaConnector";
import {
  createParser,
  type ParsedEvent,
  type ReconnectInterval,
} from "eventsource-parser";
import { marked } from "marked";
import hljs from "highlight.js";
import { ElMessage, ElScrollbar } from "element-plus";
import { addEventListenerOnce } from "../eventListenerUtils";
import { useInputStore } from "../pinia/inputStore";
import ChatBox from "./ChatBox.vue";

const store = useInputStore();
/**
 *The returned code block
 */
const responseCode = ref("");
const innerRef = ref<HTMLDivElement>();
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
interface ResponseOutput {
  responseMarkdown: string;
  sendRole: "vicuna" | "user" | undefined;
}

/**
 * The computed string of markdown response
 */
const responseMarkdownNew: ComputedRef<string> = computed(() => {
  return markedCon(responseCode.value);
});
const responseOutputs: Ref<ResponseOutput[]> = ref([]);
const { isBottomStably, registerScrollInterval, clearScrollInterval } =
  useBottomStably();

const toBottomButton = () => {
  if (isBottomStably.value) {
    clearScrollInterval(true);
  } else {
    registerScrollInterval();
  }
};
function useBottomStably() {
  const isBottomStably = ref(false);
  const bottomInternal = ref<number | null>(null);

  const registerScrollInterval = () => {
    isBottomStably.value = true;
    ElMessage({
      type: "success",
      message: "Scroll to bottom",
      duration: 1000,
      grouping: true,
      customClass: "scrollMessage",
    });
    //need clear the interval at first, or the user can register many interval but not clear original interval one
    clearScrollInterval(true);
    scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight);
    bottomInternal.value = setInterval(() => {
      scrollbarRef.value!.setScrollTop(innerRef.value!.clientHeight);
    }, 250);
    addEventListenerOnce(document, "wheel", () => {
      clearScrollInterval(false);
    });
  };
  /**
   * This function is used to clear the interval or init the interval
   * @param initClear initClear is used to show this clear is called for init scroll time interval or not
   */
  const clearScrollInterval = (initClear: boolean) => {
    if (bottomInternal.value) {
      isBottomStably.value = false;
      if (!initClear) {
        ElMessage({
          type: "warning",
          message: "You have cancel scroll to bottom",
          duration: 1000,
          grouping: true,
          customClass: "scrollMessage",
        });
      }
      clearInterval(bottomInternal.value);
    }
  };
  return {
    isBottomStably,
    registerScrollInterval,
    clearScrollInterval,
  };
}

/**
 * Get the response stream from input
 */
const getResponseStream = async (sendMessages: string) => {
  registerScrollInterval();
  const response = await callOpenAI(sendMessages);
  if (typeof response != "number") {
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const stream = new ReadableStream({
      async start(controller) {
        const onParse = (event: ParsedEvent | ReconnectInterval) => {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta.content;
              const queue = encoder.encode(text);
              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        };
        const parser = createParser(onParse);
        const reader = (response as Response).body!.getReader();
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          const chunk = decoder.decode(value);
          parser.feed(chunk);
        }
        try {
          controller.close();
        } catch (e) {}
      },
    });
    return stream;
  } else {
    // TODO need a handler for error code
    return response;
  }
};

const getCharValue = (char: string, delay: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      responseCode.value = responseCode.value + char;
      resolve();
    }, delay);
  });
};

/**
 * This function can get the output from the stream with @param messages and it will generate responseCode continually
 * @param messages The array of all input messages in conversation
 */
const getStreamOutput = async (sendMessages: string) => {
  const data = await getResponseStream(sendMessages);
  console.log(data);

  if (typeof data === "number") {
    return data;
  } else {
    const reader = (data! as ReadableStream<any>).getReader();
    const decoder = new TextDecoder();
    let done = false;
    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      const promises: Promise<void>[] = [];
      for (const char of chunkValue) {
        promises.push(
          getCharValue(char, import.meta.env.VITE_RESPONSE_STREAM_DELAY)
        );
      }
      await Promise.all(promises);
    }
    responseOutputs.value.push({
      responseMarkdown: markedCon(responseCode.value),
      sendRole: "vicuna",
    });
    responseCode.value = "";
    clearScrollInterval(true);
  }
};

const renderer = new marked.Renderer();
const markedCon = (content: string) => {
  renderer.code = (code: string, language: string) => {
    if (language == "C/C++" || language == "c/c++") {
      language = "C++";
    }
    const lang = language || "go";
    const highlighted = hljs.highlightAuto(code, [lang]).value;
    return `<pre><code class="hljs lang-${lang}">${highlighted}</code></pre>`;
  };
  marked.setOptions({
    renderer,
  });
  return marked(content);
};

watch(
  () => store.isSubmitted,
  async (newValue: boolean) => {
    if (newValue) {
      //被修改为true表示一次提交事件
      responseOutputs.value.push({
        responseMarkdown: markedCon(store.inputText),
        sendRole: "user",
      });
      await getStreamOutput(store.inputText);
      store.setIsSubmitted(false);
    }
  }
);

onBeforeUnmount(() => {
  clearScrollInterval(true);
});
</script>

<style scoped lang="less">
.responseBox {
  height: calc(100vh - 200px);
  width: 100%;
  overflow: hidden;
  border: #161616 2px dashed;
  border-radius: 10px;
  box-sizing: border-box;
  padding: 20px;
}
.backButton {
  height: 60px;
  width: 60px;
  background-color: #fcfcfc;
  border: #c1c1c1 2px solid;
  color: #c1c1c1;
  border-radius: 50%;
  position: fixed;
  z-index: 100;
  bottom: 30px;
  right: 30px;
  cursor: pointer;
  .customIcon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  &:hover {
    border: #59a4f9 2px solid;
    color: #59a4f9;
  }
}
.backButtonChecked {
  border: #59a4f9 2px solid;
  color: #59a4f9;
}
.scrollbarContainer {
  height: 100%;
  width: 100%;
}
</style>
