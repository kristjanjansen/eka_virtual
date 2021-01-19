import { computed } from "../deps/vue.js";
import { Select } from "./index.js";

export default {
  components: { Select },
  props: {
    cameraIndex: { type: Number, default: 0 },
    micIndex: { type: Number, default: 0 },
  },
  emits: ["update:cameraIndex", "update:micIndex"],
  setup(props, { emit }) {
    const camera = computed({
      get: () => props.cameraIndex,
      set: (value) => {
        console.log("update:cameraIndex", value);
        emit("update:cameraIndex", value);
      },
    });

    const mic = computed({
      get: () => props.micIndex,
      set: (value) => {
        console.log("update:micIndex", value);
        emit("update:micIndex", value);
      },
    });

    return { camera, mic };
  },
  template: `
  <div class="overlay">
    <div class="modal" style="display: grid; gap: 16px;">
      <div style="display: grid; gap: 16px; grid-template-columns: 1fr 1fr">
        <label>Select camera</label>
        <Select v-model="camera" :options="{0: 'Camera1', 1: 'Camera2'}" />
        <label>Select mic</label>
        <Select v-model="mic" :options="{0: 'Mic1', 1: 'Mic2'}" />
      </div>
      <button>Start</button>
    </div>
  </div>
  `,
};
