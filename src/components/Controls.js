import { ref } from "../deps/vue.js";
import { events } from "../deps/live.js";

export default {
  setup(_props, { emit }) {
    const showReactions = ref(false);
    const isScreenshare = ref(false);

    const colors = {
      purple: {
        "--dot-bg": "hsla(280, 100%, 30%, 1)",
        "--main-bg": "hsla(280, 100%, 10%, 1)",
        "--modal-bg": "hsla(280, 100%, 20%, 1)",
        "--bubble-bg": "hsla(280, 80%, 40%, 1)",
        "--bubble-color": "hsla(280, 80%, 80%, 1)",
        "--accent-color": "hsla(7, 100%, 66%, 1)",
        "--accent-inverse-color": "hsla(0, 0%, 100%, 0.8)",
      },
      gray: {
        "--dot-bg": "hsla(0, 0%, 14%, 0.75)",
        "--main-bg": "hsla(0, 0%, 14% ,1)",
        "--modal-bg": "hsla(0, 0%, 24%, 1)",
        "--bubble-bg": "hsla(0, 0%, 100%, 0.3)",
        "--bubble-color": "hsla(0, 0%, 50%, 1)",
        "--border-color": "hsla(0, 0%, 100%, 0.5)",
        "--accent-color": "hsla(7, 100%, 66%, 1)",
        "--accent-inverse-color": "hsla(0, 0%, 100%, 0.8)",
      },
      green: {
        "--dot-bg": "hsla(160, 100%, 40%, 1)",
        "--main-bg": "hsla(160, 100%, 40%, 1)",
        "--modal-bg": "hsla(160, 100%, 30%, 1)",
        "--bubble-bg": "hsla(160, 70%, 30%, 1)",
        "--bubble-color": "hsla(160, 70%, 25%, 1)",
        "--border-color": "hsla(160, 100%, 15%, 0.5)",
        "--accent-color": "hsla(0, 0%, 30%, 0.8)",
        "--accent-inverse-color": "hsla(0, 0%, 100%, 0.8)",
      },
      red: {
        "--dot-bg": "hsla(0, 100%, 65%, 1)",
        "--main-bg": "hsla(0, 100%, 15%, 1)",
        "--modal-bg": "hsla(0, 100%, 20%, 1)",
        "--bubble-bg": "hsla(0, 100%, 25%, 1)",
        "--bubble-color": "hsla(0, 100%, 50%, 1)",
        "--accent-color": "hsla(52, 98%, 48%, 1)",
        "--accent-inverse-color": "hsla(0, 0%, 0%, 0.8)",
      },
      blue: {
        "--dot-bg": "hsla(220, 100%, 35%, 1)",
        "--main-bg": "hsla(220, 100%, 15%, 1)",
        "--modal-bg": "hsla(220, 100%, 25%, 1)",
        "--bubble-bg": "hsla(220, 100%, 30%, 1)",
        "--bubble-color": "hsla(220, 100%, 50%, 1)",
        "--accent-color": "hsla(7, 100%, 66%, 1)",
        "--accent-inverse-color": "hsla(0, 0%, 100%, 0.8)",
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
        style="transform: translateY(-7px);"
        @click="() => onThemeChange(color)"
      >⬤</button>
      
    </div>
  </div>
  `,
};
