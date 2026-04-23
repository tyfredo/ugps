let map;
let busMarker = null; // Inicializamos el camión como "nulo" (invisible)

// Coordenadas de la DICIS (Solo las usaremos como fondo inicial)
const DICIS_CENTER = [20.5073163, -101.193337];
const INITIAL_ZOOM = 16; 

// URL de un icono de AUTOBÚS 
const BUS_ICON_URL = 'https://img.icons8.com/color/48/bus.png'; 

function initMap() {
    // 1. Inicializar el mapa (Se centra en DICIS solo para que no haya una pantalla gris)
    map = L.map('mapa').setView(DICIS_CENTER, INITIAL_ZOOM);

    // 2. Capa de calles gratuita de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // --- LA MAGIA CONTRA EL BUG DEL ZOOM ---
    map.on('zoomstart', function() {
        if (busMarker && busMarker.getElement()) {
            busMarker.getElement().classList.remove('uber-motion');
        }
    });

    map.on('zoomend', function() {
        if (busMarker && busMarker.getElement()) {
            setTimeout(() => {
                busMarker.getElement().classList.add('uber-motion');
            }, 100);
        }
    });

    // --- CORRECCIÓN: Evita el error de la pantalla gris en Bootstrap ---
    setTimeout(() => {
        map.invalidateSize();
    }, 500);
}

// Función para mover el camión en tiempo real
window.updateMarkerPosition = function(lat, lng) {
    const newLatLng = new L.LatLng(lat, lng);

    // 🌟 LA MAGIA DE LA PRIMERA CARGA 🌟
    if (!busMarker) {
        // Si el camión NO existe, significa que es el primer dato de Firebase
        const transportIcon = L.icon({
            iconUrl: BUS_ICON_URL,
            iconSize: [45, 45], 
            iconAnchor: [22, 22] 
        });

        // 1. Lo creamos directamente en su ubicación real
        busMarker = L.marker(newLatLng, {icon: transportIcon}).addTo(map);
        
        // 2. Centramos el mapa de golpe a esa ubicación (sin animar)
        map.setView(newLatLng, INITIAL_ZOOM);
        
        // 3. Le inyectamos la clase de animación 'uber-motion' para los futuros movimientos
        setTimeout(() => {
            if (busMarker.getElement()) {
                busMarker.getElement().classList.add('uber-motion');
            }
        }, 100);

    } else {
        // Si el camión YA existe (movimientos posteriores), hacemos la animación suave
        busMarker.setLatLng(newLatLng);
        
        map.panTo(newLatLng, {
            animate: true,
            duration: 4.5, 
            easeLinearity: 1 
        });
    }
};

// --- (Nota: El arranque de initMap() ahora lo maneja exclusivamente app.js) ---