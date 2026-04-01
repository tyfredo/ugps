let map;
let busMarker;

// Coordenadas exactas de la DICIS (UG Campus Irapuato-Salamanca)
const DICIS_CENTER = [20.5073163, -101.193337];
const INITIAL_ZOOM = 16; 

// URL de un icono de AUTOBÚS 
const BUS_ICON_URL = 'https://img.icons8.com/color/48/bus.png'; 

function initMap() {
    // 1. Inicializar el mapa centrado en la DICIS
    map = L.map('mapa').setView(DICIS_CENTER, INITIAL_ZOOM);

    // 2. Capa de calles gratuita de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    const transportIcon = L.icon({
        iconUrl: BUS_ICON_URL,
        iconSize: [45, 45], 
        iconAnchor: [22, 22] 
    });

    // 4. Agregar el marcador al mapa
    busMarker = L.marker(DICIS_CENTER, {icon: transportIcon}).addTo(map);

    // --- CORRECCIÓN: Evita el error de la pantalla gris en Bootstrap ---
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
}

// Función para mover el camión en tiempo real
window.updateMarkerPosition = function(lat, lng) {
    if (busMarker) {
        const newLatLng = new L.LatLng(lat, lng);
        busMarker.setLatLng(newLatLng);
        
        // Efecto tipo Uber: la cámara sigue al camión suavemente
        map.panTo(newLatLng);
    }
};

// --- CORRECCIÓN: Ejecutar la función cuando el HTML esté listo ---
document.addEventListener('DOMContentLoaded', initMap);