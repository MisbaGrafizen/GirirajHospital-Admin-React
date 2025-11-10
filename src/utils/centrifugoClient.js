import { Centrifuge } from "centrifuge";

let centrifugeInstance = null;

export const connectCentrifugo = () => {
  if (centrifugeInstance && centrifugeInstance.state === "connected")
    return centrifugeInstance;

  centrifugeInstance = new Centrifuge("ws://localhost:8000/connection/websocket", {
    insecure: true,
  });

  centrifugeInstance.on("connected", () => console.log("✅ Connected to Centrifugo"));
  centrifugeInstance.on("disconnected", (ctx) =>
    console.warn("⚠️ Disconnected:", ctx.reason)
  );
  centrifugeInstance.on("error", (err) =>
    console.error("❌ Centrifugo Error:", err)
  );

  centrifugeInstance.connect();
  return centrifugeInstance;
};

export const subscribeToCentrifugo = (channel, callback) => {
  const centrifuge = connectCentrifugo();

  console.log("🌀 Subscribing to:", channel);
  const sub = centrifuge.newSubscription(channel);

  sub.on("subscribed", () => console.log("✅ Subscribed to:", channel));
  sub.on("publication", (ctx) => {
    console.log("📩 Received data:", ctx.data);
    callback && callback(ctx.data);
  });
  sub.on("error", (err) => console.error("❌ Subscription Error:", err));

  sub.subscribe();
  return sub;
};
