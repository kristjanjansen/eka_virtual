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
    const openvidu = useOpenvidu(channel);
    const publisherWithChannel = computed(() => {
      if (openvidu.publisher.value) {
        const { connection } = openvidu.publisher.value.stream;
        if (connection.data) {
          openvidu.publisher.value.data = JSON.parse(connection.data);
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
      //console.log(outgoingMessage);
      socket.send(outgoingMessage);
    };

    return {
      ...useChat(channel),
      ...useUser(),
      ...openvidu,
      publisherWithChannel,
      ...useChannel(channel),
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
  
  <Draggable @drag="onDrag">
    <OpenviduVideo :publisher="publisherWithChannel" />
    <div>{{ publisherWithChannel ? publisherWithChannel.data : '' }}</div>
  </Draggable>
  
  <div v-for="(publisher, i) in subscribers">
    <OpenviduVideo :publisher="publisher" />
  </div>

  <pre>
    {{ users }}
  </pre>
  `,
};

const app = createApp(App);

app.mount("#app");
