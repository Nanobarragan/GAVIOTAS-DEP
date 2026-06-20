// server.js - Código Completo del Servidor de Notificaciones Automáticas
const admin = require('firebase-admin');

// 1. INICIALIZACIÓN DE FIREBASE ADMIN
// Reemplaza "serviceAccountKey.json" con el archivo que descargas desde:
// Consola Firebase -> Configuración del proyecto -> Cuentas de servicio -> Generar nueva clave privada
const serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    // REEMPLAZA CON LA URL EXACTA DE TU REALTIME DATABASE (Visto en la imagen image_780380.png)
    databaseURL: "https://las-gaviotas-default-rtdb.firebaseio.com/" 
});

const db = admin.database();
console.log("🚀 Servidor de alertas de Las Gaviotas iniciado y escuchando cambios...");

// 2. FUNCIÓN PRINCIPAL PARA MANDAR ALERTAS MASIVAS
async function enviarNotificacionMasiva(servicio, estado) {
    try {
        // Obtener todos los tokens registrados de los vecinos
        const snapshot = await db.ref('tokensNotificaciones').once('value');
        const tokensData = snapshot.val();

        if (!tokensData) {
            console.log("⚠️ No se enviaron alertas porque no hay vecinos con tokens registrados aún.");
            return;
        }

        // Convertimos el objeto de Firebase en un arreglo limpio de tokens únicos
        const listaTokens = Object.values(tokensData);
        console.log(`📱 Preparando envío para ${listaTokens.length} dispositivos registrados...`);

        // Definimos las variables del mensaje
        let titulo = "";
        let mensaje = "";
        let iconoUrl = "";

        // Personalización inteligente según el tipo de cambio detectado
        if (servicio === 'agua') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Corte de Agua en Las Gaviotas";
                mensaje = "El servicio de agua lamentablemente no se encuentra disponible. Favor de tomar precauciones.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/3104/3104847.png"; 
            } else if (estado === 'Normal') {
                titulo = "🟢 Servicio de Agua Restablecido";
                mensaje = "El suministro de agua ha vuelto a la normalidad en el fraccionamiento.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/3104/3104850.png";
            }
        } else if (servicio === 'luz') {
            if (estado === 'Interrupción') {
                titulo = "🔴 Interrupción de Energía Eléctrica";
                mensaje = "Se reporta una falla o mantenimiento en el suministro eléctrico de áreas comunes o departamentos.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911771.png";
            } else if (estado === 'Normal') {
                titulo = "🟢 Servicio de Luz Restablecido";
                mensaje = "La energía eléctrica ha sido restablecida por completo. Los servicios operan con normalidad.";
                iconoUrl = "https://cdn-icons-png.flaticon.com/512/2911/2911776.png";
            }
        }

        // Si el estado enviado no es ninguno de estos, no mandamos nada
        if (!titulo) return;

        // Estructura de la notificación optimizada para pantallas de bloqueo (iOS/Android/Web)
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
                    requireInteraction: true, // Mantiene la alerta visible en el iPhone hasta que la descarten
                    badge: iconoUrl
                }
            }
        };

        // Mapeamos los mensajes para cada token individual utilizando la API sendEach
        const mensajesAEnviar = listaTokens.map(token => ({
            ...payload,
            token: token
        }));

        const response = await admin.messaging().sendEach(mensajesAEnviar);
        console.log(`✅ ¡Alerta enviada con éxito! (${response.successCount} enviados correctamente, ${response.failureCount} fallidos).`);

    } catch (error) {
        console.error("❌ Error en el proceso de envío masivo:", error);
    }
}

// 3. VINCULACIÓN EN TIEMPO REAL CON LA BASE DE DATOS
// El servidor se queda vigilando la carpeta 'servicios' en Firebase
db.ref('servicios').on('child_changed', (snapshot) => {
    const servicio = snapshot.key; // Puede ser 'agua' o 'luz'
    const datos = snapshot.val();
    const nuevoEstado = datos.estado; // 'Interrupción' o 'Normal'

    console.log(`🔄 Cambio detectado en la base de datos -> Servicio: ${servicio} | Nuevo Estado: ${nuevoEstado}`);
    
    // Disparar de inmediato la alerta push automática
    enviarNotificacionMasiva(servicio, nuevoEstado);
});
