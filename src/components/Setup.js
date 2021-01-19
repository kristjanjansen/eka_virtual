import { ref, computed } from "../deps/vue.js";
import { Select } from "./index.js";

export default {
  components: { Select },
  props: {
    cameraIndex: { type: Number, default: 0 },
    micIndex: { type: Number, default: 0 },
  },
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

    const cameraOptions = ref([]);
    const micOptions = ref([]);
    const video = ref(null);

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: true })
      .then((stream) => {
        video.value.srcObject = stream;
        video.value.onloadedmetadata = () => video.value.play();

        navigator.mediaDevices.enumerateDevices().then((dev) => {
          cameraOptions.value = Object.fromEntries(
            dev
              .filter(({ kind }) => kind === "videoinput")
              .map(({ label }, index) => [index, label])
          );

          micOptions.value = Object.fromEntries(
            dev
              .filter(({ kind }) => kind === "audioinput")
              .map(({ label }, index) => [index, label])
          );
        });
      });

    const onStart = () => emit("start");

    return { video, camera, cameraOptions, mic, micOptions, onStart };
  },
  template: `
  <div class="overlay" style="background: rgba(0,0,0,0.9);">
    <div class="modal" style="display: grid; gap: 16px;">
      <video
        style="
          clipPath: circle(40%);
          width: 320px;
          transform: scale(-1,1);
        "
        ref="video"
        autoplay
        muted
      />
      <div style="display: grid; gap: 16px; grid-template-columns: auto auto;">
        <label>Select camera</label>
        <Select v-model="camera" :options="cameraOptions" />
        <label>Select mic</label>
        <Select v-model="mic" :options="micOptions" />
      </div>
      <button @click="onStart">Start</button>
    </div>
  </div>
  `,
};
