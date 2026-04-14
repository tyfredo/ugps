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


// Asumimos que la estructura en tu base de datos será: camiones -> dicis -> lat / lng
const camionRef = ref(database, 'camiones/dicis');

console.log("Conectando a Firebase Realtime Database...");


onValue(camionRef, (snapshot) => {
  const datos = snapshot.val();
  

  if (datos && datos.lat && datos.lng) {
      console.log("¡Nuevas coordenadas recibidas! Moviendo a:", datos.lat, datos.lng);
      
  
      window.updateMarkerPosition(datos.lat, datos.lng);
  } else {
      console.warn("No se encontraron coordenadas válidas en Firebase.");
  }
});