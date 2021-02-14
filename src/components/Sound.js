import { ref } from "../deps/vue.js";
import { events, createMessage, safeJsonParse } from "../deps/live.js";
import { socket } from "../deps/hackaton.js";
import { channel } from "../../config.js";

export default {
  props: {
    name: {
      type: String,
    },
    src: {
      type: String,
      default: "",
    },
    loop: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const audioRef = ref(null);
    const muted = ref(true);

    socket.addEventListener("message", ({ data }) => {
      const message = safeJsonParse(data);
      if (
        message &&
        message.type === "EMOTION" &&
        message.channel === channel &&
        message.value === props.name
      ) {
        muted.value = false;
        audioRef.value.play();
      }
    });

    events.on("pause", (name) => {
      if (name === props.name) {
        muted.value = true;
        audioRef.value.play();
      }
    });

    events.on("play", (name) => {
      if (name === props.name) {
        const outgoingMessage = createMessage({
          type: "EMOTION",
          channel,
          value: name,
        });
        socket.send(outgoingMessage);
      }
    });

    return { muted, audioRef };
  },
  template: `
  <audio
    ref="audioRef"
    :src="src"
    :muted="muted" 
    :loop="loop"
    autoplay
  />
  `,
};
