document.addEventListener('DOMContentLoaded', () => {
    // En cuanto carga la página, pintamos el mapa
    initMap();
    console.log("¡Mapa cargado y listo!");
});

document.addEventListener('DOMContentLoaded', () => {
    const linkRuta = document.getElementById('linkRutasActivas');
    const modalElement = document.getElementById('modalDetallesRuta');
    const bsModal = new bootstrap.Modal(modalElement);

    linkRuta.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Verificamos si el modal ya está visible
        if (modalElement.classList.contains('show')) {
            bsModal.hide();
        } else {
            bsModal.show();
        }
    });

    // Manejo de la clase activa para el indicador visual
    modalElement.addEventListener('show.bs.modal', () => {
        linkRuta.classList.add('active');
    });

    modalElement.addEventListener('hide.bs.modal', () => {
        linkRuta.classList.remove('active');
    });
});

// ==========================================
// SISTEMA DE HORARIOS INTELIGENTE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Bases de datos extraídas de las imágenes (Formato 24hrs para cálculos)
    const horarios = {
        ascenso: [
            "07:00", "07:10", "07:20", "07:30", "07:45", "08:00", "08:30", "09:00", "09:10", 
            "09:20", "09:30", "09:45", "10:00", "10:30", "11:00", "11:10", "11:20", "11:30", 
            "12:00", "12:30", "13:00", "13:15", "13:30", "13:40", "13:45", "14:00", "14:20", 
            "14:40", "15:00", "15:15", "15:30", "15:40", "16:00"
        ],
        descenso: [
            "08:30", "09:00", "09:30", "09:45", "10:00", "10:30", "11:00", "11:20", "11:40", 
            "12:00", "12:20", "12:40", "13:00", "13:25", "13:45", "14:00", "14:20", "14:40", 
            "15:10", "15:40", "16:10", "16:20", "16:35", "17:00", "17:25", "17:45", "18:00", "18:15"
        ],
        especiales: [
            { nombre: "Puentes Gemelos", horas: ["07:10", "07:30"] },
            { nombre: "Central de Autobuses", horas: ["07:35"] },
            { nombre: "Aurrera", horas: ["09:35"] }
        ]
    };

    // Función para convertir "14:30" a "2:30 p.m." para que se vea bonito
    function formatTime(time24) {
        let [h, m] = time24.split(':');
        let hours = parseInt(h);
        let suffix = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12 || 12;
        return `${hours}:${m} ${suffix}`;
    }

    // Calcula cuántos minutos han pasado desde medianoche
    function getMinutes(timeStr) {
        let [h, m] = timeStr.split(':');
        return parseInt(h) * 60 + parseInt(m);
    }

    // Renderiza la lista y resalta el próximo
    function renderizarHorarios() {
        const now = new Date();
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const isWeekend = now.getDay() === 0 || now.getDay() === 6; // Sábado o Domingo

        // Si es fin de semana, no marcamos "próximo" para simplificar (podemos agregar sábados después)
        
        ['ascenso', 'descenso'].forEach(ruta => {
            const container = document.getElementById(`lista-${ruta}`);
            container.innerHTML = ''; // Limpiar
            
            let nextFound = false;

            horarios[ruta].forEach(time24 => {
                const timeMins = getMinutes(time24);
                const badge = document.createElement('div');
                badge.className = 'time-badge';
                
                // Lógica de iluminación de la bolita
                if (!isWeekend && !nextFound && timeMins >= currentMinutes) {
                    badge.classList.add('next-bus');
                    badge.innerHTML = `<div class="live-dot"></div> ${formatTime(time24)}`;
                    nextFound = true;
                } else {
                    badge.innerHTML = formatTime(time24);
                }
                
                container.appendChild(badge);
            });
        });

        // Renderizar Especiales
        const espContainer = document.getElementById('lista-especiales');
        espContainer.innerHTML = '';
        horarios.especiales.forEach(esp => {
            const row = document.createElement('div');
            row.className = 'd-flex justify-content-between align-items-center bg-dark bg-opacity-25 p-2 rounded-3 border border-secondary border-opacity-25';
            row.innerHTML = `
                <span class="text-white-50"><i class="bi bi-geo me-2"></i>${esp.nombre}</span>
                <div class="d-flex gap-2">
                    ${esp.horas.map(h => `<span class="badge bg-ug-blue-muted text-white">${formatTime(h)}</span>`).join('')}
                </div>
            `;
            espContainer.appendChild(row);
        });
    }

    // Ejecutar cuando se abra el modal para que la hora esté siempre actualizada
    const modalHorarios = document.getElementById('modalHorarios');
    if(modalHorarios) {
        modalHorarios.addEventListener('show.bs.modal', renderizarHorarios);
    }
});

// ==========================================
// CONTROL DEL SPLASH SCREEN
// ==========================================
let splashOculto = false;

window.ocultarSplashScreen = function() {
    if (splashOculto) return;
    splashOculto = true;
    
    const splash = document.getElementById('splash-screen');
    if (splash) {
        // Le damos un respiro de medio segundo para asegurar que Leaflet dibujó el mapa
        setTimeout(() => {
            splash.classList.add('fade-out');
            
            // Lo eliminamos del código después de la animación para no gastar RAM
            setTimeout(() => splash.remove(), 1000);
        }, 600); 
    }
};

// Respaldo de seguridad: Si Firebase tarda demasiado por mala conexión celular, quitamos el splash de todos modos a los 4 segundos.
window.addEventListener('load', () => {
    setTimeout(window.ocultarSplashScreen, 4000);
});