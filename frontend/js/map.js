let map;
let busMarker = null;

const DICIS_CENTER = [20.5073163, -101.193337];
const INITIAL_ZOOM = 16;

// Icono original sin cambios
const BUS_ICON_URL = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 120"><rect width="60" height="120" rx="12" fill="%23f7db3c" stroke="%231a1b1f" stroke-width="4"/><rect x="5" y="20" width="50" height="30" rx="4" fill="%231a1b1f"/><rect x="5" y="80" width="50" height="25" rx="4" fill="%231a1b1f"/><line x1="30" y1="5" x2="30" y2="15" stroke="%231a1b1f" stroke-width="3"/></svg>';

// Paradas fijas de la ruta
const PARADAS = [
    { nombre: "DICIS",                lat: 20.5073163, lng: -101.193337  },
    { nombre: "Puentes Gemelos",      lat: 20.56313,    lng: -101.20086    },
    { nombre: "Central de Autobuses", lat: 20.54342,    lng: -101.20490    },
    { nombre: "Aurrera",              lat: 20.55583,    lng: -101.20317    },
    { nombre: "ENMS Salamanca",       lat: 20.57946,    lng: -101.20290    },
];

// SVG del pin de parada
const PARADA_ICON_URL = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 40"><defs><filter id="s"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="%2300000040"/></filter></defs><g filter="url(%23s)"><path d="M16 2C9.4 2 4 7.4 4 14c0 9 12 24 12 24s12-15 12-24c0-6.6-5.4-12-12-12z" fill="%231a1b1f" stroke="%23f7db3c" stroke-width="2.5"/><circle cx="16" cy="14" r="5" fill="%23f7db3c"/></g></svg>`;

// Agrega esto junto a las otras constantes arriba del archivo
const PARADA_DIANA_SVG = `<svg viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" width="28" height="28">
  <circle cx="14" cy="14" r="13" fill="#1a1b1f" stroke="#f7db3c" stroke-width="2"/>
  <circle cx="14" cy="14" r="9" fill="none" stroke="#f7db3c" stroke-width="2"/>
  <circle cx="14" cy="14" r="4.5" fill="none" stroke="#f7db3c" stroke-width="2"/>
  <circle cx="14" cy="14" r="2" fill="#f7db3c"/>
</svg>`;

const PARADA_PIN_SVG = `<svg viewBox="0 0 28 40" xmlns="http://www.w3.org/2000/svg" width="28" height="40">
  <defs><filter id="psh"><feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000045"/></filter></defs>
  <g filter="url(#psh)">
    <path d="M14 2C8.5 2 4 6.5 4 12c0 8.5 10 26 10 26s10-17.5 10-26c0-5.5-4.5-10-10-10z" fill="#1a1b1f" stroke="#f7db3c" stroke-width="2"/>
    <circle cx="14" cy="12" r="4.5" fill="#f7db3c"/>
  </g>
</svg>`;

function initMap() {
    map = L.map('mapa').setView(DICIS_CENTER, INITIAL_ZOOM);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    map.on('zoomstart', function () {
        if (busMarker && busMarker.getElement())
            busMarker.getElement().classList.remove('uber-motion');
    });

    map.on('zoomend', function () {
        if (busMarker && busMarker.getElement()) {
            setTimeout(() => busMarker.getElement().classList.add('uber-motion'), 100);
        }
    });

    setTimeout(() => map.invalidateSize(), 500);

    _pintarParadas();
    _agregarBotonCentrar();
}

function _pintarParadas() {
    // Inyectar estilos de animación una sola vez
    if (!document.getElementById('parada-styles')) {
        const s = document.createElement('style');
        s.id = 'parada-styles';
        s.textContent = `
    .leaflet-div-icon {
        background: transparent !important;
        border: none !important;
    }
    .parada-wrap { position: relative; width: 28px; height: 40px; cursor: pointer; }
    .parada-diana {
        position: absolute; top: 6px; left: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
    }
    .parada-pin {
        position: absolute; top: 0; left: 0;
        opacity: 0;
        transform: scale(0.3) translateY(10px);
        transition: opacity 0.35s ease, transform 0.4s cubic-bezier(0.34,1.56,0.64,1);
    }
    .parada-wrap.activa .parada-diana {
        opacity: 0;
        transform: scale(0.3);
    }
    .parada-wrap.activa .parada-pin {
        opacity: 1;
        transform: scale(1) translateY(0px);
    }
        `;
        document.head.appendChild(s);
    }

    let paradaActiva = null;

    PARADAS.forEach(p => {
        const divIcon = L.divIcon({
            className: '',
            html: `<div class="parada-wrap">
                     <div class="parada-diana">${PARADA_DIANA_SVG}</div>
                     <div class="parada-pin">${PARADA_PIN_SVG}</div>
                   </div>`,
            iconSize:   [28, 40],
            iconAnchor: [14, 34],
            popupAnchor:[0, -38]
        });

        const marker = L.marker([p.lat, p.lng], { icon: divIcon })
            .addTo(map)
            .bindPopup(`<b>${p.nombre}</b>`, { closeButton: false });

        marker.on('click', () => {
            const wrap = marker.getElement().querySelector('.parada-wrap');

            // Si ya está activa, la desactiva
            if (paradaActiva && paradaActiva !== wrap) {
                paradaActiva.classList.remove('activa');
            }

            wrap.classList.toggle('activa');
            paradaActiva = wrap.classList.contains('activa') ? wrap : null;
        });

        // Al cerrar el popup, regresa a diana
        marker.on('popupclose', () => {
            const wrap = marker.getElement().querySelector('.parada-wrap');
            wrap.classList.remove('activa');
            if (paradaActiva === wrap) paradaActiva = null;
        });
    });
}

function _agregarBotonCentrar() {
    const btn = document.createElement('button');
    btn.id = 'btnCentrarCamion';
    btn.title = 'Centrar en el camión';
    btn.setAttribute('aria-label', 'Centrar mapa en el camión');
    btn.innerHTML = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="#f7db3c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <line x1="12" y1="2"  x2="12" y2="6"/>
        <line x1="12" y1="18" x2="12" y2="22"/>
        <line x1="2"  y1="12" x2="6"  y2="12"/>
        <line x1="18" y1="12" x2="22" y2="12"/>
    </svg>`;

    btn.style.cssText = `
        position: absolute;
        bottom: 24px;
        right: 16px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #1a1b1f;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 14px rgba(0,0,0,0.35);
        z-index: 500;
        transition: transform 0.15s ease, background 0.15s ease;
    `;

    btn.addEventListener('click', () => {
        if (!busMarker) return;
        const svg = btn.querySelector('svg');
        btn.style.transform = 'scale(0.85)';
        btn.style.background = '#f7db3c';
        svg.style.stroke = '#1a1b1f';
        setTimeout(() => {
            btn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
                btn.style.background = '#1a1b1f';
                svg.style.stroke = '#f7db3c';
            }, 180);
        }, 120);
        map.flyTo(busMarker.getLatLng(), 17, { animate: true, duration: 1.2 });
    });

    btn.addEventListener('mouseover', () => btn.style.transform = 'scale(1.1)');
    btn.addEventListener('mouseout',  () => btn.style.transform = 'scale(1)');

    document.getElementById('mapa').appendChild(btn);
}

window.updateMarkerPosition = function (lat, lng, angulo) {
    const newLatLng = new L.LatLng(lat, lng);

    if (!busMarker) {
        const transportIcon = L.icon({
            iconUrl: BUS_ICON_URL,
            iconSize:   [40, 40],
            iconAnchor: [20, 20]
        });

        busMarker = L.marker(newLatLng, {
            icon: transportIcon,
            rotationAngle: angulo,
            rotationOrigin: 'center center'
        }).addTo(map);

        map.setView(newLatLng, INITIAL_ZOOM);
        setTimeout(() => {
            if (busMarker.getElement()) busMarker.getElement().classList.add('uber-motion');
        }, 100);

    } else {
        busMarker.setLatLng(newLatLng);
        busMarker.setRotationAngle(angulo);
        map.panTo(newLatLng, { animate: true, duration: 4.5, easeLinearity: 1 });
    }
};