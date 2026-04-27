let map;
let busMarker = null; // Inicializamos el camión como "nulo" (invisible)

// Coordenadas de la DICIS (Solo las usaremos como fondo inicial)
const DICIS_CENTER = [20.5073163, -101.193337];
const INITIAL_ZOOM = 16; 

// URL de un icono de AUTOBÚS 
const BUS_ICON_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120"><rect width="60" height="120" rx="12" fill="%23f7db3c" stroke="%231a1b1f" stroke-width="4"/><rect x="5" y="20" width="50" height="30" rx="4" fill="%231a1b1f"/><rect x="5" y="80" width="50" height="25" rx="4" fill="%231a1b1f"/><line x1="30" y1="5" x2="30" y2="15" stroke="%231a1b1f" stroke-width="3"/></svg>';

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
window.updateMarkerPosition = function(lat, lng, angulo) {
    const newLatLng = new L.LatLng(lat, lng);

    if (!busMarker) {
        const transportIcon = L.icon({
            iconUrl: BUS_ICON_URL,
            iconSize: [40, 40], 
            iconAnchor: [20, 20] 
        });

        // Creamos el marcador y le inyectamos el ángulo inicial
        busMarker = L.marker(newLatLng, {
            icon: transportIcon,
            rotationAngle: angulo, // <-- ¡LA MAGIA DE LA ROTACIÓN!
            rotationOrigin: 'center center'
        }).addTo(map);
        
        map.setView(newLatLng, INITIAL_ZOOM);
        setTimeout(() => { if (busMarker.getElement()) busMarker.getElement().classList.add('uber-motion'); }, 100);

    } else {
        // Actualizamos posición y rotamos suavemente la nariz del camión hacia la calle
        busMarker.setLatLng(newLatLng);
        busMarker.setRotationAngle(angulo); 
        
        map.panTo(newLatLng, { animate: true, duration: 4.5, easeLinearity: 1 });
    }
};

// --- (Nota: El arranque de initMap() ahora lo maneja exclusivamente app.js) ---