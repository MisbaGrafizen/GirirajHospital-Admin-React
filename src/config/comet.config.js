import { CometChat } from "@cometchat-pro/chat";

const appID = import.meta.env.VITE_COMETCHAT_APP_ID;
const region = import.meta.env.VITE_COMETCHAT_REGION;

const appSetting = new CometChat.AppSettingsBuilder()
  .subscribePresenceForAllUsers()
  .setRegion(region)
  .build();

export async function initCometChat() {
  try {
    await CometChat.init(appID, appSetting);
    console.log("✅ CometChat initialized");
  } catch (err) {
    console.error("❌ CometChat initialization failed:", err);
  }
}

export default CometChat;
