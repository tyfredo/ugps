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