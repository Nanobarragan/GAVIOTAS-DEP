// enviar-alerta.js
const admin = require('firebase-admin');

// Inicializa Firebase con tus credenciales de administrador
// (Debes descargar este archivo JSON desde la configuración de tu proyecto Firebase)
const serviceAccount = require("./serviceAccountKey.json");

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "TU_URL_DE_REALTIME_DATABASE_AQUI"
    });
}

// Función principal para enviar las alertas según el estado de los servicios
async function notificarCambioServicio(servicio, estado) {
    try {
        // 1. Obtener todos los tokens guardados de tus vecinos en la base de datos
        const db = admin.database();
        const snapshot = await db.ref('tokensNotificaciones').once('value');
        const tokensData = snapshot.val();

        if (!tokensData) {
            console.log("No hay vecinos registrados con tokens aún.");
            return;
        }

        // Convertir el objeto de Firebase en una lista limpia de tokens
        const listaTokens = Object.values(tokensData);

        // 2. Personalizar el mensaje e icono según lo que pasó en el fraccionamiento
        let titulo = "";
        let mensaje = "";
        let iconoUrl = "";

        if (servicio === 'agua') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Corte de Agua en Las Gaviotas";
                mensaje = "El servicio de agua lamentablemente no se encuentra disponible. Favor de tomar precauciones.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/3104/3104847.png"; // Icono de alerta
            } else {
                titulo = "🟢 Servicio de Agua Restablecido";
                mensaje = "El suministro de agua ha vuelto a la normalidad en el fraccionamiento.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/3104/3104850.png"; // Icono normal
            }
        } else if (servicio === 'luz') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Interrupción de Energía Eléctrica";
                mensaje = "Se reporta una falla/mantenimiento en el suministro de luz de las áreas comunes o departamentos.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911771.png";
            } else {
                titulo = "🟢 Servicio de Luz Restablecido";
                mensaje = "La energía eléctrica ha sido restablecida por completo. Los servicios operan con normalidad.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911776.png";
            }
        }

        // 3. Crear la estructura oficial de la notificación para los celulares
        const payload = {
            notification: {
                title: titulo,
                body: mensaje,
                icon: iconoUrl
            },
            webpush: {
                headers: {
                    Urgency: "high"
                },
                notification: {
                    body: mensaje,
                    icon: iconoUrl,
                    requireInteraction: true, // Mantiene la alerta en pantalla hasta que el vecino la cierre
                    badge: iconoUrl
                }
            }
        };

        // 4. Enviar a todos los dispositivos registrados al mismo tiempo utilizando sendEachForMulticast
        const mensajesAEnviar = listaTokens.map(token => ({
            ...payload,
            token: token
        }));

        const response = await admin.messaging().sendEach(mensajesAEnviar);
        console.log(`¡Alerta enviada con éxito a ${response.successCount} dispositivos de vecinos!`);
        
    } catch (error) {
        console.error("Error enviando la notificación masiva automática:", error);
    }
}

module.exports = { notificarCambioServicio };
