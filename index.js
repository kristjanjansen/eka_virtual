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

    const publisherWithChannel = computed(() => {
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

    /*
    const usersWithVideos = computed(() =>
    allUsers.value.map((user) => {
      const imageUser = images2.value.find(
        ({ userId }) => userId === user.userId
      );
      if (imageUser) {
        user.image = imageUser.value;
      }
      return user;
    })
  );
    */
    return {
      ...useChat(channel),
      ...useUser(),
      ...openvidu,
      publisherWithChannel,
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
  
  <Draggable @drag="onDrag" style="transform: scale(0.5); transform-origin: 0 0;">
    <OpenviduVideo :publisher="publisherWithChannel" />
    <div>{{ publisherWithChannel ? publisherWithChannel.user : '' }}</div>
  </Draggable>
  
  <div v-for="(publisher, i) in subscribers" style="transform: scale(0.5); transform-origin: 0 0;">
    <OpenviduVideo :publisher="publisher" />
  </div>

  <pre>
    {{ users }}
  </pre>
  `,
};

const app = createApp(App);

app.mount("#app");
