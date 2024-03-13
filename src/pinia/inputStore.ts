import { defineStore } from "pinia";

export const useInputStore = defineStore("input", {
  // 为了完整类型推理，推荐使用箭头函数
  state: () => {
    return {
      // 所有这些属性都将自动推断出它们的类型
      inputText: "",
      isSubmitted: false,
    };
  },
  actions: {
    setInputText(text: string) {
      this.inputText = text;
    },
    setIsSubmitted(submitted: boolean) {
      this.isSubmitted = submitted;
    },
  },
});
