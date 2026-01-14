importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBwQ4qK7lDLuFBXFzpo47q9LB1Pu2MegTI",
    authDomain: "japap-6c438.firebaseapp.com",
    projectId: "japap-6c438",
    storageBucket: "japap-6c438.firebasestorage.app",
    messagingSenderId: "944006139932",
    appId: "1:944006139932:web:9181aca6e06bb944c6cfd9"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/vite.svg'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
