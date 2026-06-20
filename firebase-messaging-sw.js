// Importar los scripts necesarios de Firebase desde la CDN
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Configuración de Firebase para el Service Worker
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

// Inicializar Firebase Messaging
const messaging = firebase.messaging();

// Configurar cómo se muestra la notificación cuando el teléfono la recibe en segundo plano
messaging.onBackgroundMessage((payload) => {
    console.log('[firebase-messaging-sw.js] Notificación recibida en segundo plano: ', payload);
    
    const notificationTitle = payload.notification.title || "Aviso Residencial";
    const notificationOptions = {
        body: payload.notification.body || "Hay una nueva actualización en el panel.",
        icon: '/favicon.ico' // Puedes poner la ruta de un icono si tienes uno
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
});