import { createApp, ref, watch } from "./src/deps/vue.js";
import { OpenviduVideo, createMessage, debounce } from "./src/deps/live.js";
import { Draggable, socket } from "./src/deps/hackaton.js";
import { useOpenviduUsers } from "./src/lib/index.js";
import { channel } from "./config.js";

const App = {
  template: `
  <div>
    <button v-if="!sessionStarted" @click="joinSession">Join</button>
    <button v-if="sessionStarted" @click="leaveSession">Leave</button>
    <input
      v-if="sessionStarted"
      type="range"
      v-model="scale"
      min="0.1"
      max="0.8"
      step="0.01"
    />
  </div>

  <div
    v-for="subscriber in subscribers"
    style="
      transform-origin: 0 0;
      position: absolute;
      filter: blur(0);
      mix-blend-mode: difference;
      transition: all 100ms linear;
    "
    :style="{
      transform: 'scale(' + (subscriber.user ? subscriber.user.userScale : 0.5) + ')',
      left: (subscriber.user ? subscriber.user.userX : '') + 'px', 
      top: (subscriber.user ? subscriber.user.userY : '') + 'px'
    }"
  >
    <OpenviduVideo :publisher="subscriber" />
  </div>

  <Draggable
    @drag="onUserDrag"
    style="
      transform-origin: 0 0;
      filter: blur(0);
      mix-blend-mode: difference;
    "
    :style="{
      transform: 'scale(' + scale + ')'
    }"
  >
    <OpenviduVideo :publisher="publisher" />
  </Draggable>
  `,
  components: { OpenviduVideo, Draggable },
  setup() {
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

    return {
      sessionStarted,
      joinSession,
      leaveSession,
      publisher,
      subscribers,
      onUserDrag,
      scale,
    };
  },
};

const app = createApp(App);

app.mount("#app");
