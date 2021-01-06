import { createApp } from "./src/deps/vue.js";

import {
  useChat,
  useUser,
  useOpenvidu,
  OpenviduVideo,
} from "./src/deps/live.js";

import { channel } from "./config.js";

const App = {
  components: { OpenviduVideo },
  setup() {
    return {
      ...useChat(channel),
      ...useUser(),
      ...useOpenvidu(channel),
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
  
  <p><OpenviduVideo :publisher="publisher" /></p>
  
  <p>
    <OpenviduVideo
      v-for="(publisher, i) in subscribers"
      :key="i"
      :publisher="publisher"
    />
  </p>
  </div>
  `,
};

const app = createApp(App);

app.mount("#app");
