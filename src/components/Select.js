export default {
  props: {
    modelValue: {
      default: "",
    },
    options: {
      default: [],
    },
    placeholder: {
      default: "Select...",
    },
  },
  emits: ["update:modelValue"],
  template: `
  <select
    @input="$emit('update:modelValue', $event.target.value)"
    :value="modelValue"
  >
    <option disabled value="">{{ placeholder }}</option>
    <option v-for="option, value in options" :value="value">{{ option }}</option>
  </select>
  `,
};
