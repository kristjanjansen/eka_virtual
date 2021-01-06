import { createApp, computed } from "./src/deps/vue.js";

import {
  useChat,
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

    const onDrag = ({ x, y }) => {
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
      ...useChat(channel),
      ...useUser(),
      ...openvidu,
      publisherUser,
      subscribersUsers,
      users,
      onDrag,
    };
  },
  template: `
  <h2>Chat</h2>

  Your username: {{ userName }}
  
  <button @click="onUserNameChange">Change</button>
  
  <br />

  <textarea v-model="newMessage" ref="textareaEl"></textarea>
  
  <br />
  
  <button @click="onNewMessage">Send message</button>
  
  <pre ref="scrollEl">{{ messages }}</pre>

  <h2>WebRTC</h2>
  
  <button @click="joinSession">Join</button>
  <button @click="leaveSession">Leave</button>
  
    
  <div
    v-for="(subscriber, i) in subscribersUsers"
    style="transform: scale(0.5); transform-origin: 0 0; position: absolute;"
    :style="{left: subscriber.user.userX + 'px', top: subscriber.user.userY + 'px'}"
  >
    <OpenviduVideo :publisher="subscriber" />
    <div>{{ subscriber ? subscriber.user : '' }}</div>
  </div>


  <Draggable @drag="onDrag" style="transform: scale(0.5); transform-origin: 0 0;">
    <OpenviduVideo :publisher="publisherUser" />
    <div>{{ publisherUser ? publisherUser.user : '' }}</div>
  </Draggable>

  <pre>
    {{ users }}
  </pre>
  `,
};

const app = createApp(App);

app.mount("#app");
