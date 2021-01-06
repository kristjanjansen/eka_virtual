import { createApp, computed } from "./src/deps/vue.js";

import {
  useChat,
  useUser,
  useOpenvidu,
  OpenviduVideo,
} from "./src/deps/live.js";

import { useChannel } from "./src/deps/hackaton.js";

import { channel } from "./config.js";

const App = {
  components: { OpenviduVideo },
  setup() {
    const openvidu = useOpenvidu(channel);
    const publisherWithChannel = computed(() => {
      return openvidu.publisher.value;
    });
    return {
      ...useChat(channel),
      ...useUser(),
      ...openvidu,
      publisherWithChannel,
      ...useChannel(channel),
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
  
  <p><OpenviduVideo :publisher="publisherWithChannel" /></p>
  
  <p>
    <OpenviduVideo
      v-for="(publisher, i) in subscribers"
      :key="i"
      :publisher="publisher"
    />
  </p>

  <pre>
    {{ users }}
  </pre>
  `,
};

const app = createApp(App);

app.mount("#app");
