import { Centrifuge } from "centrifuge";

let centrifugeInstance = null;

export const connectCentrifugo = () => {
  if (centrifugeInstance && centrifugeInstance.state === "connected") return centrifugeInstance;

  centrifugeInstance = new Centrifuge("ws://localhost:8000/connection/websocket", {
    insecure: true,
  });

  centrifugeInstance.on("connected", () => console.log("✅ Connected to Centrifugo"));
  centrifugeInstance.on("disconnected", (ctx) => console.warn("⚠️ Disconnected:", ctx.reason));
  centrifugeInstance.connect();

  return centrifugeInstance;
};

export const subscribeToCentrifugo = (channel, callback) => {
  const centrifuge = connectCentrifugo();

  if (centrifuge.getSubscription(channel)) return centrifuge.getSubscription(channel);

  const sub = centrifuge.newSubscription(channel);
  sub.on("publication", (ctx) => callback && callback(ctx.data));
  sub.subscribe();

  return sub;
};
