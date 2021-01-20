import { ref } from "../deps/vue.js";
import { events } from "../deps/live.js";

export default {
  setup(_props, { emit }) {
    const showReactions = ref(false);
    const isScreenshare = ref(false);
    return { showReactions, emit, events, isScreenshare };
  },
  template: `
  <div>
    <div class="controls-reactions" v-show="showReactions">
      <button @click="events.emit('play','applause')">👏</button>
      <button @click="events.emit('play','thumbsup')">👍</button>
      <button @click="events.emit('play','love')">😍</button>
    </div>  
    <div class="controls-buttons">
      <button @click="emit('leaveSession')"><img src="./files/phone-missed.svg"></button>
      <!--
      <button @click="emit('toggleMic')"><img style="opacity: 0.25" src="./files/mic.svg"></button>
      <button @click="emit('toggleVideo')"><img style="opacity: 0.25" src="./files/video.svg"></button>
      -->
      <button :class="{ active: isScreenshare }" @click="emit('toggleScreenshare'); isScreenshare = !isScreenshare;"><img src="./files/monitor.svg"></button>
      <button :class="{ active: showReactions }" @click="showReactions = !showReactions"><img src="./files/smile.svg"></button>
      <!--
      <button @click="emit('toggleChat')"><img style="opacity: 0.25" src="./files/message-square.svg"></button>
      -->
    </div>
  </div>
  `,
};
