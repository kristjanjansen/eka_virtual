import { createApp, computed, ref } from "./src/deps/vue.js";

import {
  useUser,
  useOpenvidu,
  OpenviduVideo,
  createMessage,
} from "./src/deps/live.js";

import { useChannel, Draggable, socket } from "./src/deps/hackaton.js";

import { channel } from "./config.js";

const App = {
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

    const onUserDrag = ({ x, y }) => {
      const outgoingMessage = createMessage({
        type: "CHANNEL_USER_UPDATE",
        channel,
        value: {
          userX: x,
          userY: y,
        },
      });
      socket.send(outgoingMessage);
    };

    return {
      ...useUser(),
      ...openvidu,
      publisherUser,
      subscribersUsers,
      onUserDrag,
    };
  },
  template: `
  <div class="buttons">
    <button v-if="!sessionStarted" @click="joinSession">Join</button>
    <button v-if="sessionStarted" @click="leaveSession">Leave</button>
  </div>
  
  <div
    v-for="(subscriber, i) in subscribersUsers"
    style="transform: scale(0.5); transform-origin: 0 0; position: absolute; filter: blur(0); mix-blend-mode: multiply"
    :style="{left: (subscriber.user ? subscriber.user.userX : '') + 'px', top: (subscriber.user ? subscriber.user.userY : '') + 'px'}"
  >
    <OpenviduVideo :publisher="subscriber" />
    <!-- <div>{{ subscriber ? subscriber.user : '' }}</div> -->
  </div>


  <Draggable @drag="onUserDrag" style="transform: scale(0.5); transform-origin: 0 0; filter: blur(0); mix-blend-mode: multiply">
    <OpenviduVideo :publisher="publisherUser" />
    <!-- <div>{{ publisherUser ? publisherUser.user : '' }}</div> -->
  </Draggable>
  `,
};

const app = createApp(App);

app.mount("#app");
