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

    // Le ponemos nuestra animación al nacer
    if (busMarker.getElement()) {
        busMarker.getElement().classList.add('uber-motion');
    }

    // --- LA MAGIA CONTRA EL BUG DEL ZOOM ---
    // Cuando el usuario empieza a hacer zoom: Apagamos la animación
    map.on('zoomstart', function() {
        if (busMarker && busMarker.getElement()) {
            busMarker.getElement().classList.remove('uber-motion');
        }
    });

    // Cuando el usuario termina el zoom: Prendemos la animación
    map.on('zoomend', function() {
        if (busMarker && busMarker.getElement()) {
            // Le damos 100 milisegundos a Leaflet para que termine de acomodar el mapa
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
// Función para mover el camión en tiempo real con Efecto Uber
window.updateMarkerPosition = function(lat, lng) {
    if (busMarker) {
        const newLatLng = new L.LatLng(lat, lng);
        
        // 1. Leaflet actualiza la coordenada, pero tu CSS nuevo hará que se deslice visualmente
        busMarker.setLatLng(newLatLng);
        
        // 2. Hacemos que la cámara siga al camión con la misma suavidad
        map.panTo(newLatLng, {
            animate: true,
            duration: 4.5, // Emparejado con la duración del CSS
            easeLinearity: 1 // Movimiento constante sin frenar de golpe
        });
    }
};

// --- CORRECCIÓN: Ejecutar la función cuando el HTML esté listo ---
document.addEventListener('DOMContentLoaded', initMap);