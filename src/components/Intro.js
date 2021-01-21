import { radiuses } from "../lib/index.js";

export default {
  setup(props, { emit }) {
    return { emit, radiuses };
  },
  template: `
  <div class="overlay">
    <!-- <div
      class="bubble"
      style="
        position: fixed;
        top: 100px;
        left: 100px;
        width: 380px;
        height: 380px;
      "
      :style="{borderRadius: radiuses[2]}"
    /> -->
    <div class="modal" style="padding: 36px; display: grid; gap: 16px; max-width: 400px; text-align: center;">
      <h2 style="margin: 0">Welcome to EKA Virtual!</h2>
      <div style="line-height: 1.5em;">Click and drag your avatar to move around and join groups to work in teams</div>
      <button class="primary" @click="emit('submit')">Set up audio and video</button>
    </div>
  </div>
  `,
};
