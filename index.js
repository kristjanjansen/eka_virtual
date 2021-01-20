import { createApp, ref, watch } from "./src/deps/vue.js";
import {
  OpenviduVideo,
  createMessage,
  debounce,
  events,
  safeJsonParse,
} from "./src/deps/live.js";
import { Draggable, socket } from "./src/deps/hackaton.js";
import { useOpenviduUsers } from "./src/lib/index.js";
import { channel } from "./config.js";

import * as components from "./src/components/index.js";

const App = {
  components: { OpenviduVideo, Draggable, ...components },
  template: `
  <iframe
    v-show="isScreenshare"
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
  <div
    v-show="!isScreenshare"
    class="overlay"
    style="background: #242424; z-index: -1000"
  />

  <div v-if="sessionStarted">
    <div
      class="bubble"
      style="
        position: fixed;
        top: 100px;
        left: 100px;
        width: 400px;
        height: 400px;
      "
    />
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
          clipPath: circle(33%);
          transform: scale(-1,1);
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
          clipPath: circle(33%);
          transform: scale(-1,1);
        "
      />
    </Draggable>
    <Settings v-show="settingsOpened" />
    <div
      @click="settingsOpened = !settingsOpened"
      style="position: fixed; top: 32px; right: 32px;"
    >
      <img src="files/settings.svg" style="filter: invert()"/>
    </div>
    <div style="
      position: fixed;
      right: 0;
      bottom: 32px;
      left: 0;
      display: flex;
      justify-content: center;
    "
    >
      <Controls
        @leaveSession="leaveSession"
        @toggleScreenshare="onScreenshare"
      />
    </div>
  </div>

  <Setup
    v-if="!sessionStarted"
    @start="joinSession"
    v-model:camera-index="cameraIndex"
    v-model:mic-index="micIndex"
  />
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

    watch(
      () => subscribers.value,
      (value, prevValue) => {
        if (value.length > prevValue.length) {
          events.emit("play", "join");
        }
        if (value.length < prevValue.length) {
          events.emit("play", "leave");
        }
      }
    );

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

    const scale = ref(0.25);

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

    const settingsOpened = ref(false);

    const cameraIndex = ref(0);
    const micIndex = ref(0);

    const isScreenshare = ref(false);

    const onScreenshare = () => {
      const outgoingMessage = createMessage({
        type: "SCREENSHARE",
        channel,
      });
      socket.send(outgoingMessage);
      console.log(outgoingMessage);
    };

    socket.addEventListener("message", ({ data }) => {
      const message = safeJsonParse(data);
      if (
        message &&
        message.type === "SCREENSHARE" &&
        message.channel === channel
      ) {
        console.log("share");
        isScreenshare.value = !isScreenshare.value;
      }
    });

    return {
      sessionStarted,
      joinSession,
      leaveSession,
      publisher,
      subscribers,
      onUserDrag,
      scale,
      blendmode,
      settingsOpened,
      cameraIndex,
      micIndex,
      onScreenshare,
      isScreenshare,
    };
  },
};

const app = createApp(App);

app.mount("#app");
