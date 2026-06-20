// server.js - Versión Definitiva y Sincronizada con tu Firebase Real
const admin = require('firebase-admin');

// 1. INICIALIZACIÓN SEGURA CON VARIABLES DE ENTORNO
// En tu plataforma de Hosting (Vercel/Render) debes pegar el contenido de tu JSON en una variable llamada FIREBASE_SERVICE_ACCOUNT
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://gaviotas-efa2b-default-rtdb.firebaseio.com/" // Tu URL exacta enlazada
    });
}

const db = admin.database();
console.log("🚀 Servidor de Las Gaviotas encendido. Monitoreando 'lasGaviotasData' en tiempo real...");

// 2. ENVIADOR MASIVO DE NOTIFICACIONES PUSH
async function enviarNotificacionMasiva(servicio, estado) {
    try {
        // Recuperar los tokens de los vecinos registrados
        const snapshot = await db.ref('tokensNotificaciones').once('value');
        const tokensData = snapshot.val();

        if (!tokensData) {
            console.log("⚠️ No se enviaron alertas: la lista de tokens está vacía.");
            return;
        }

        const listaTokens = Object.values(tokensData);
        let titulo = "";
        let mensaje = "";
        let iconoUrl = "";

        // Filtros con base en los cambios de tus variables reales
        if (servicio === 'agua') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Corte de Agua en Las Gaviotas";
                mensaje = "El servicio de agua lamentablemente no se encuentra disponible. Favor de tomar precauciones.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/3104/3104847.png"; 
            } else if (estado === 'Disponible') {
                titulo = "🟢 Servicio de Agua Restablecido";
                mensaje = "El suministro de agua ha vuelto a la normalidad en el fraccionamiento.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/3104/3104850.png";
            }
        } else if (servicio === 'luzDepto') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Corte de Luz en Departamentos";
                mensaje = "Se reporta una interrupción eléctrica en los departamentos. CFE ya está informada.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911771.png";
            } else if (estado === 'Disponible') {
                titulo = "🟢 Luz en Departamentos Restablecida";
                mensaje = "La energía eléctrica en los departamentos ha regresado a la normalidad.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911776.png";
            }
        } else if (servicio === 'luzComun') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Corte de Luz en Áreas Comunes";
                mensaje = "La luz en vialidades, portones o áreas comunes se encuentra temporalmente suspendida.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911771.png";
            } else if (estado === 'Disponible') {
                titulo = "🟢 Alumbrado y Áreas Comunes Operando";
                mensaje = "La energía en portones y áreas comunes se ha restablecido exitosamente.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911776.png";
            }
        }

        // Si es un cambio de otra variable (como "ultimaActualizacion"), no disparamos alertas push
        if (!titulo) return;

        // Estructura oficial del globo de notificación
        const payload = {
            notification: { title: titulo, body: mensaje, icon: iconoUrl },
            webpush: {
                headers: { Urgency: "high" },
                notification: { body: mensaje, icon: iconoUrl, requireInteraction: true, badge: iconoUrl }
            }
        };

        const mensajesAEnviar = listaTokens.map(token => ({ ...payload, token: token }));
        const response = await admin.messaging().sendEach(mensajesAEnviar);
        console.log(`🚀 ¡Notificación enviada con éxito a ${response.successCount} vecinos!`);

    } catch (error) {
        console.error("❌ Error enviando notificaciones push de Firebase:", error);
    }
}

// 3. OYENTE DE CAMBIOS EN TU NODO REAL
db.ref('lasGaviotasData').on('child_changed', (snapshot) => {
    const servicio = snapshot.key;        // 'agua', 'luzDepto', 'luzComun'
    const nuevoEstado = snapshot.val();   // 'Disponible', 'Limitado', 'Interrupción'

    // Evitar procesar objetos anidados complejos como 'avisos' o 'historial' de forma directa aquí
    if (typeof nuevoEstado === 'string') {
        console.log(`🔄 Cambio detectado en la nube -> ${servicio}: ${nuevoEstado}`);
        enviarNotificacionMasiva(servicio, nuevoEstado);
    }
});
