import { createApp, ref, watch } from "./src/deps/vue.js";
import {
  OpenviduVideo,
  createMessage,
  debounce,
  events,
} from "./src/deps/live.js";
import { Draggable, socket } from "./src/deps/hackaton.js";
import { useOpenviduUsers } from "./src/lib/index.js";
import { channel } from "./config.js";

import { Select, Sounds } from "./src/components/index.js";

import { getSheet } from "./src/lib/index.js";

const App = {
  components: { OpenviduVideo, Draggable, Select, Sounds },
  template: `
  <iframe
    style="
      display: block;      
      border: none; 
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: -1000;
    "
    src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FBa9AzRlpIVIC2tvbvWkJPA%2FVirtual-EKA%3Fnode-id%3D0%253A1"
    allowfullscreen
  />
  <div>
    <div class="toolbar" v-if="!sessionStarted">
      <button @click="joinSession">Join</button>
    </div>
    <div class="toolbar" v-if="sessionStarted">
      <button @click="leaveSession">Leave</button>
      <input
        type="range"
        v-model="scale"
        min="0.1"
        max="0.8"
        step="0.01"
      />
      <div>Blend&nbsp;mode</div>
      <Select
        :options="{
          normal: 'Normal',
          multiply: 'Multiply',
          difference: 'Difference',
          screen: 'Screen'
        }"
        v-model="blendmode"
      />
    </div>
  </div>

  <div
    v-for="subscriber in subscribers"
    style="
      transform-origin: 0 0;
      position: absolute;
      filter: blur(0);
      transition: all 100ms linear;
    "
    :style="{
      'mix-blend-mode': blendmode,
      transform: 'scale(' + (subscriber.user ? subscriber.user.userScale : 0.5) + ')',
      left: (subscriber.user ? subscriber.user.userX : '') + 'px', 
      top: (subscriber.user ? subscriber.user.userY : '') + 'px'
    }"
  >
    <OpenviduVideo
      :publisher="subscriber"
      style="
        clipPath: circle(33%)
      "
    />
  </div>

  <Draggable
    @drag="onUserDrag"
    style="
      transform-origin: 0 0;
      filter: blur(0);
    "
    :style="{
      'mix-blend-mode': blendmode,
      transform: 'scale(' + scale + ')'
    }"
  >
    <OpenviduVideo
      :publisher="publisher"
      style="
        clipPath: circle(33%)
      "
    />
  </Draggable>
  <Sounds v-show="settingsOpened" />
  <div
    @click="settingsOpened = !settingsOpened"
    style="position: fixed; top: 20px; right: 64px;"
  >
    <img src="files/settings.svg" />
  </div>
  
  `,
  setup() {
    const blendmode = ref("normal");

    const {
      sessionStarted,
      joinSession,
      leaveSession,
      publisher,
      subscribers,
    } = useOpenviduUsers(channel);

    const onUserDrag = debounce(({ x, y }) => {
      const outgoingMessage = createMessage({
        type: "CHANNEL_USER_UPDATE",
        channel,
        value: {
          userX: x,
          userY: y,
        },
      });
      socket.send(outgoingMessage);
    }, 100);

    const scale = ref(0.5);

    watch(
      scale,
      () => {
        const outgoingMessage = createMessage({
          type: "CHANNEL_USER_UPDATE",
          channel,
          value: {
            userScale: scale.value,
          },
        });
        socket.send(outgoingMessage);
      },
      { immediate: true }
    );

    const soundMap = ref({});

    getSheet("1UiT9-5swmTl5FSpluz9tGHPoowCBQZ9WSed0q9ZaSaI").then((sounds) => {
      soundMap.value = Object.fromEntries(
        sounds.map(({ key, url }) => [key, url])
      );
    });

    const onPlay = (name) => {
      events.emit("play", name);
    };
    const onPause = (name) => {
      events.emit("pause", name);
    };

    const settingsOpened = ref(false);

    return {
      sessionStarted,
      joinSession,
      leaveSession,
      publisher,
      subscribers,
      onUserDrag,
      scale,
      blendmode,
      soundMap,
      onPlay,
      onPause,
      settingsOpened,
    };
  },
};

const app = createApp(App);

app.mount("#app");
