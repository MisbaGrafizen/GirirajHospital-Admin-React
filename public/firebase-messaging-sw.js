// public/firebase-messaging-sw.js
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js");

firebase.initializeApp({
  apiKey: "AIzaSyB3pfP_JbFfg3E5lsIBNjeZomS9xePYaoE",
  authDomain: "giriraj-3ab77.firebaseapp.com",
  projectId: "giriraj-3ab77",
  storageBucket: "giriraj-3ab77.appspot.com",  // ✅ fix
  messagingSenderId: "27291072389",
  appId: "1:27291072389:web:bf8673424290b181de76ec",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  self.registration.showNotification(payload.notification.title, {
    body: payload.notification.body,
    icon: "/images.png",
  });
});
