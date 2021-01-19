import { createApp, ref, watch } from "./src/deps/vue.js";
import { OpenviduVideo, createMessage, debounce } from "./src/deps/live.js";
import { Draggable, socket } from "./src/deps/hackaton.js";
import { useOpenviduUsers } from "./src/lib/index.js";
import { channel } from "./config.js";

import * as components from "./src/components/index.js";

const App = {
  components: { OpenviduVideo, Draggable, ...components },
  template: `
  <!--iframe
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
  /-->
  <div class="overlay" style="background: #242424; z-index: -1000" />
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
    <Controls @toggleVideo="onToggleVideo" />
  </div>
  <Setup />
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

    const settingsOpened = ref(false);

    const onToggleVideo = () => console.log("video toggled");

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
      onToggleVideo,
    };
  },
};

const app = createApp(App);

app.mount("#app");
