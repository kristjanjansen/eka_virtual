import { ref } from "../deps/vue.js";

export default {
  setup(_props, { emit }) {
    const showReactions = ref(false);
    return { showReactions, emit };
  },
  template: `
  <div>
    <div class="controls-reactions" v-show="showReactions">
      <button @click="emit('handRection')">✋</button>
      <button @click="emit('clapReaction')">👏</button>
      <button @click="emit('loveReaction')">😍</button>
    </div>  
    <div class="controls-buttons">
      <button @click="emit('leaveSession')"><img src="./files/phone-missed.svg"></button>
      <button @click="emit('toggleMic')"><img style="opacity: 0.25" src="./files/mic.svg"></button>
      <button @click="emit('toggleVideo')"><img style="opacity: 0.25" src="./files/video.svg"></button>
      <button @click="emit('toggleScreenshare')"><img src="./files/monitor.svg"></button>
      <button @click="showReactions = !showReactions"><img src="./files/smile.svg"></button>
      <button @click="emit('toggleChat')"><img style="opacity: 0.25" src="./files/message-square.svg"></button>
    </div>
  </div>
  `,
};
