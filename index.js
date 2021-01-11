import { createApp, computed, ref, watch } from "./src/deps/vue.js";

import {
  useUser,
  useOpenvidu,
  OpenviduVideo,
  createMessage,
  debounce,
} from "./src/deps/live.js";

import { useChannel, Draggable, socket } from "./src/deps/hackaton.js";

import { channel } from "./config.js";

console.log(debounce);

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
    v-for="(subscriber, i) in subscribersUsers"
    style="
      transform-origin: 0 0;
      position: absolute;
      filter: blur(0);
      mix-blend-mode: difference;
    "
    :style="{
      transform: 'scale(' + (subscriber.user ? subscriber.user.userScale : 0.5) + ')',
      transition: 'all 100ms linear',
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
    <OpenviduVideo :publisher="publisherUser" />
  </Draggable>
  `,
  components: { OpenviduVideo, Draggable },
  setup() {
    const { users } = useChannel(channel);
    const openvidu = useOpenvidu(channel);

    const publisherUser = computed(() => {
      if (openvidu.publisher.value) {
        const userId = JSON.parse(
          openvidu.publisher.value.stream.connection.data
        ).userId;
        const user = users.value.find((user) => user.userId === userId);
        if (user) {
          openvidu.publisher.value.user = user;
        }
      }
      return openvidu.publisher.value;
    });

    const subscribersUsers = computed(() => {
      return openvidu.subscribers.value.map((subscriber) => {
        const userId = JSON.parse(subscriber.stream.connection.data).userId;
        const user = users.value.find((user) => user.userId === userId);
        if (user) {
          subscriber.user = user;
        }
        return subscriber;
      });
    });

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
      ...useUser(),
      ...openvidu,
      publisherUser,
      subscribersUsers,
      onUserDrag,
      scale,
    };
  },
};

const app = createApp(App);

app.mount("#app");
