import { createApp, ref, watch, onMounted } from "./src/deps/vue.js";
import {
  OpenviduVideo,
  createMessage,
  debounce,
  events,
  safeJsonParse,
} from "./src/deps/live.js";
import { Draggable, socket } from "./src/deps/hackaton.js";
import { useOpenviduUsers, radiuses } from "./src/lib/index.js";
import { channel } from "./config.js";

import * as components from "./src/components/index.js";

const App = {
  components: { OpenviduVideo, Draggable, ...components },
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
      radiuses,
    };
  },
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
    width="800" height="450" src="https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Ffile%2FQGWNz5WGIU7JeeByZelrC3%2FDelivery-App_UI-Kit%3Fnode-id%3D33%253A444" allowfullscreen
  />
  <!--div
    v-show="!isScreenshare"
    class="overlay"
    style="background: #242424; z-index: -1000"
  /-->

  <div v-if="sessionStarted">
    <div
      v-show="!isScreenshare"
      class="bubble"
      style="
        position: fixed;
        top: 100px;
        left: 100px;
        width: 380px;
        height: 380px;
      "
      :style="{borderRadius: radiuses[2]}"
    >
      #chillout
    </div>
    <div
      v-show="!isScreenshare"
      class="bubble"
      style="
        position: fixed;
        top: 100px;
        left: 500px;
        width: 380px;
        height: 380px;
      "
      :style="{borderRadius: radiuses[6]}"
    >
      #focus
    </div>
    <div
      v-show="!isScreenshare"
      class="bubble"
      style="
        position: fixed;
        top: 100px;
        left: 900px;
        width: 380px;
        height: 380px;
      "
      :style="{borderRadius: radiuses[4]}"
    >
      #random
    </div>
    <div
      v-for="(subscriber, i) in subscribers"
      class="video"
      style="
        position: absolute;
        transition: all 100ms linear;
      "
      :style="{
        left: (subscriber.user ? subscriber.user.userX : '') + 'px', 
        top: (subscriber.user ? subscriber.user.userY : '') + 'px',
        borderRadius: radiuses[(i % radiuses.length) + 1]
      }"
    >
        <OpenviduVideo
          :publisher="subscriber"
        />
    </div>
    <Draggable @drag="onUserDrag">
      <div
        class="video"
        :style="{borderRadius: radiuses[0]}"
      >
        <OpenviduVideo
          :publisher="publisher"
        />
      </div>
    </Draggable>
  </div>
  <Settings v-show="settingsOpened" />
  <!--
  <div
    v-if="sessionStarted"
    @click="settingsOpened = !settingsOpened"
    style="position: fixed; bottom: 32px; right: 28px;"
  >
    <img src="files/settings.svg" style="filter: invert()"/>
  </div>
  -->
  <div
    v-show="sessionStarted"
    style="
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
  <Setup
    v-if="!sessionStarted"
    @start="joinSession"
    v-model:camera-index="cameraIndex"
    v-model:mic-index="micIndex"
  />
  `,
};

const app = createApp(App);

app.mount("#app");
