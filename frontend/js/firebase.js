import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyChevJ7wP6b3omwKOq9tFuqI_ZPkAQnceI",
  authDomain: "ugps-4dac6.firebaseapp.com",
  databaseURL: "https://ugps-4dac6-default-rtdb.firebaseio.com",
  projectId: "ugps-4dac6",
  storageBucket: "ugps-4dac6.firebasestorage.app",
  messagingSenderId: "340010889324",
  appId: "1:340010889324:web:e5483f806f5d4711f3a849"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const camionRef = ref(database, 'camiones/dicis');

// 🔑 TU LLAVE DE GOOGLE MAPS PARA CORREGIR CARRETERAS
const GOOGLE_API_KEY = "AIzaSyASWkAcnf0bbYIbWh4gFg7-GnVcaZdWdLU";

console.log("Conectando a Firebase Realtime Database...");

onValue(camionRef, async (snapshot) => {
  const datos = snapshot.val();

  if (datos && datos.lat && datos.lng) {
      const latOriginal = datos.lat;
      const lngOriginal = datos.lng;
      // Extraemos el ángulo de rotación (si no existe, apuntamos al Norte = 0)
      const angulo = datos.curso ? parseFloat(datos.curso) : 0;
      
      console.log(`📍 Coordenadas Crudas: ${latOriginal}, ${lngOriginal}`);

      try {
          // --- MAGIA: Consultamos a la API de Google ---
          const url = `https://roads.googleapis.com/v1/nearestRoads?points=${latOriginal},${lngOriginal}&key=${GOOGLE_API_KEY}`;
          const respuesta = await fetch(url);
          const dataGoogle = await respuesta.json();

          let latPerfecta = latOriginal;
          let lngPerfecta = lngOriginal;

          // Si Google detecta exitosamente el carril más cercano, extraemos esa coordenada
          if (dataGoogle.snappedPoints && dataGoogle.snappedPoints.length > 0) {
              latPerfecta = dataGoogle.snappedPoints[0].location.latitude;
              lngPerfecta = dataGoogle.snappedPoints[0].location.longitude;
              console.log("🛣️ Coordenada Corregida por Google:", latPerfecta, lngPerfecta);
          }

          // Le mandamos a Leaflet la coordenada ajustada y el ángulo de rotación
          window.updateMarkerPosition(latPerfecta, lngPerfecta, angulo);

      } catch (error) {
          console.error("Error al usar Snap-to-Roads, usando datos originales:", error);
          // Respaldo: Si el internet falla o Google no responde, usamos el dato original de Firebase
          window.updateMarkerPosition(latOriginal, lngOriginal, angulo);
      }
      
      // Ocultamos la pantalla de carga inicial elegantemente
      if (typeof window.ocultarSplashScreen === 'function') {
          window.ocultarSplashScreen();
      }
      
  } else {
      console.warn("No se encontraron coordenadas válidas en Firebase.");
  }
});