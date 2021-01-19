import { ref } from "../deps/vue.js";
import { events } from "../deps/live.js";

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

    events.on("pause", (name) => {
      if (name === props.name) {
        muted.value = true;
        audioRef.value.play();
      }
    });

    events.on("play", (name) => {
      console.log("af", name);
      if (name === props.name) {
        muted.value = false;
        audioRef.value.play();
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
