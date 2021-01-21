import { ref } from "../deps/vue.js";
import { events } from "../deps/live.js";

export default {
  setup(_props, { emit }) {
    const showReactions = ref(false);
    const isScreenshare = ref(false);

    const colors = {
      gray: {
        "--dot-bg": "rgba(36, 36, 36, 0.8)",
        "--main-bg": "rgba(36, 36, 36,1)",
        "--modal-bg": "rgba(89, 89, 89,1)",
        "--bubble-bg": " rgba(255, 255, 255, 0.3)",
        "--bubble-color": " rgba(255, 255, 255, 1)",
        "--border-color": " rgba(255, 255, 255, 1)",
      },
      yellow: {
        "--dot-bg": "rgba(255, 168, 0, 0.8)",
        "--main-bg": "rgba(255, 168, 0, 0.2)",
        "--modal-bg": "rgba(255, 168, 0, 0)",
        "--bubble-bg": "rgba(255, 168, 0, 1)",
        "--bubble-color": "rgba(255, 168, 0, 1)",
        "--border-color": "rgba(245, 158, 0, 1)",
      },
      lightblue: {
        "--dot-bg": "hsla(223, 100%, 86%, 1)",
        "--main-bg": "hsla(223, 100%, 86%, 1)",
        "--modal-bg": "hsla(223, 100%, 56%, 0)",
        "--bubble-bg": "hsla(223, 100%, 76%, 1)",
        "--bubble-color": "hsla(223, 100%, 86%, 1)",
        "--border-color": "hsla(223, 100%, 66%, 1)",
      },
      darkblue: {
        "--dot-bg": "hsla(223, 100%, 15%, 1)",
        "--main-bg": "hsla(223, 100%, 15%, 1)",
        "--modal-bg": "hsla(223, 100%, 25%, 0)",
        "--bubble-bg": "hsla(223, 100%, 25%, 1)",
        "--bubble-color": "hsla(223, 100%, 45%, 1)",
        "--border-color": "hsla(223, 100%, 95%, 1)",
      },
    };

    const onThemeChange = (color) => {
      Object.entries(colors[color]).forEach(([key, value]) => {
        document.body.style.setProperty(key, value);
      });
    };

    return {
      showReactions,
      emit,
      events,
      isScreenshare,
      onThemeChange,
      colors,
    };
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
      
      <button
        v-for="values, color in colors"
        :style="{color: values['--dot-bg']}"
        style="transform: translateY(-5px);"
        @click="() => onThemeChange(color)"
      >⬤</button>
      
    </div>
  </div>
  `,
};
