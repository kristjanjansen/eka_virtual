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
  <div class="overlay" style="background: none">
    <div class="modal" style="display: grid; gap: 16px;">
      <div style="position: relative; display: flex; justify-content: center;">
        <video
          style="
            width: 100%;
            max-width: 200px;
            margin: 0 8px;
            clip-path: circle(40%);
            transform: scale(-1, 1);
          "
          ref="video"
          autoplay
          muted
        />
        <!--
          <div style="position: absolute; top: 0; right: 0; bottom: 0; left: 0; display: flex; justify-content: center">
          <div style="border: 3px solid white; border-radius: 1000px; width: 150px; height: 150px;" />
        </div>
        -->
      </div>
      <label>Select camera</label>
      <Select v-model="camera" :options="cameraOptions" />
      <label>Select mic</label>
      <Select v-model="mic" :options="micOptions" />
      <div />
      <button class="primary" @click="onStart">Start</button>
    </div>
  </div>
  `,
};
