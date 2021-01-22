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
    <div class="modal" style="padding: 36px; display: grid; gap: 20px; max-width: 400px; text-align: center;">
      <h1 style="margin: 0">Welcome to<br />EKA Virtual!</h1>
      <div style="line-height: 1.5em;">Click and drag your avatar to move around and join groups to work in teams</div>
      <button class="primary" @click="emit('submit')">Set up audio and video</button>
      <div style="line-height: 1.5em; opacity: 0.5">The project was implemented by Estonian <a href="https://www.artun.ee/en/home">Academy of Arts</a> digital product design students at Jan 2021. Source code is <a href="https://github.com/kristjanjansen/eka_virtual">available here</a>.</div>
    </div>
  </div>
  `,
};
