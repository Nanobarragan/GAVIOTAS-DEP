importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

const firebaseConfig = {
    apiKey: "AIzaSyBUpbVlkqgr8-To72rS5hIeHJ_cpklknR8",
    authDomain: "gaviotas-efa2b.firebaseapp.com",
    databaseURL: "https://gaviotas-efa2b-default-rtdb.firebaseio.com",
    projectId: "gaviotas-efa2b",
    storageBucket: "gaviotas-efa2b.firebasestorage.app",
    messagingSenderId: "483619094544",
    appId: "1:483619094544:web:470213b77c84921ead0a95"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
    console.log('Mensaje recibido en segundo plano: ', payload);
    
    const notificationTitle = payload.notification.title || "Aviso Las Gaviotas";
    const notificationOptions = {
        body: payload.notification.body || "Hay una nueva actualización en el panel.",
        icon: 'https://cdn-icons-png.flaticon.com/512/3104/3104847.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});
