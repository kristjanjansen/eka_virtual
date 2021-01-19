import { ref } from "../deps/vue.js";
import { events } from "../deps/live.js";
import { getSheet } from "../lib/index.js";

import { Sound } from "./index.js";

export default {
  components: { Sound },
  setup() {
    const soundsMap = ref({});

    getSheet("1UiT9-5swmTl5FSpluz9tGHPoowCBQZ9WSed0q9ZaSaI").then((sounds) => {
      soundsMap.value = Object.fromEntries(
        sounds.map(({ key, url }) => [key, url])
      );
    });

    const onPlay = (name) => {
      events.emit("play", name);
    };
    const onPause = (name) => {
      events.emit("pause", name);
    };

    return {
      soundsMap,
      onPlay,
      onPause,
    };
  },
  template: `
  <div class="overlay">
    <div>
      <h3>Sound tester</h3>
      <div
        v-for="(src, name) in soundsMap"
        style="
          display: flex;
          align-items: center;
          margin-top: 4px;
        "
      >
        <Sound :src="src" :name="name" />
        {{ name }}
        &nbsp;
        <button style="transform: scale(0.8);" @click="() => onPlay(name)">Play</button>
        &nbsp;
        <button style="transform: scale(0.8);" @click="() => onPause(name)">Pause</button>
      </div>
    </div>
  </div>
  `,
};
