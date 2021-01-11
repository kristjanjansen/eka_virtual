import { computed } from "../deps/vue.js";
import { useOpenvidu } from "../deps/live.js";
import { useChannel } from "../deps/hackaton.js";
import { channel } from "../../config.js";

export const useOpenviduUsers = () => {
  const { users } = useChannel(channel);
  const openvidu = useOpenvidu(channel);

  const publisher = computed(() => {
    if (openvidu.publisher.value) {
      const userId = JSON.parse(openvidu.publisher.value.stream.connection.data)
        .userId;
      const user = users.value.find((user) => user.userId === userId);
      if (user) {
        openvidu.publisher.value.user = user;
      }
    }
    return openvidu.publisher.value;
  });

  const subscribers = computed(() => {
    return openvidu.subscribers.value.map((subscriber) => {
      const userId = JSON.parse(subscriber.stream.connection.data).userId;
      const user = users.value.find((user) => user.userId === userId);
      if (user) {
        subscriber.user = user;
      }
      return subscriber;
    });
  });

  return {
    publisher,
    subscribers,
    sessionStarted: openvidu.sessionStarted,
    joinSession: openvidu.joinSession,
    leaveSession: openvidu.leaveSession,
  };
};
