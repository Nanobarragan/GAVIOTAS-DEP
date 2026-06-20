import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { getMessaging, getToken, onMessage } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-messaging.js";

// 1. Reemplaza esto con el objeto de configuración de tu proyecto de Firebase
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "gaviotas-efa2b.firebaseapp.com",
  databaseURL: "https://gaviotas-efa2b-default-rtdb.firebaseio.com",
  projectId: "gaviotas-efa2b",
  storageBucket: "gaviotas-efa2b.appspot.com",
  messagingSenderId: "TU_MESSAGING_SENDER_ID",
  appId: "TU_APP_ID"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// 2. Solicitar permiso y obtener el Token de Notificación
function solicitarPermisos() {
  Notification.requestPermission().then((permission) => {
    if (permission === 'granted') {
      console.log('Permiso de notificación concedido.');
      
      // Pasar tu clave VAPID exacta
      getToken(messaging, { vapidKey: 'BFyj_NwMerw4pwtrFk8QHit6owRWAv2yqwMekJeDDXB1pBS1oE8vlXbD3RrBke2RkoUxIR0SAB3mQPcY4xEn4wQ' })
        .then((currentToken) => {
          if (currentToken) {
            console.log("Este es el token de este dispositivo (guárdalo para enviarle pruebas):", currentToken);
            // Aquí podrías guardar este token en tu Realtime Database bajo un nodo "tokens" si quisieras enviar notificaciones masivas
          } else {
            console.log('No se pudo obtener el token de registro. Genera uno nuevo.');
          }
        }).catch((err) => {
          console.log('Ocurrió un error al obtener el token: ', err);
        });
    } else {
      console.log('No se otorgó permiso para notificar.');
    }
  });
}

// Llamar a la función al cargar la página o al presionar un botón de "Activar Notificaciones"
solicitarPermisos();

// 3. Escuchar notificaciones en PRIMER PLANO (cuando el usuario tiene la web abierta)
onMessage(messaging, (payload) => {
  console.log('Mensaje recibido en primer plano: ', payload);
  // Aquí puedes mostrar una alerta personalizada o actualizar la interfaz
  alert(`${payload.notification.title}: ${payload.notification.body}`);
});
