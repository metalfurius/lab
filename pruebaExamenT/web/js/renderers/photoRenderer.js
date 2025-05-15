"use strict";

// Importa la función para convertir cadenas HTML en elementos DOM.
import { parseHTML } from '../utils/parseHTML.js';

const PhotoRenderer = {
    /**
     * Renderiza una tarjeta de foto individual utilizando Bootstrap.
     * @param {object} photoData - Objeto que contiene los detalles de la foto
     *                             (photoId, title, url) y un array con sus etiquetas (tags).
     * @returns {HTMLElement} - El elemento DOM que representa la columna con la tarjeta de la foto.
     */
    renderPhotoCard: function (photoData) {
        // Genera el HTML para las etiquetas de la foto usando "badges" de Bootstrap.
        let tagsHTML = '';
        if (photoData.tags && photoData.tags.length > 0) {
            // Mapea cada etiqueta a un elemento span con la clase "badge".
            tagsHTML = photoData.tags.map(tag =>
                `<span class="badge bg-secondary me-1">${tag}</span>`
            ).join(' '); // Une todas las etiquetas en una sola cadena.
        } else {
            // Mensaje si no hay etiquetas.
            tagsHTML = `<span class="text-muted fst-italic small">Sin etiquetas</span>`;
        }

        // Plantilla HTML para la tarjeta de la foto.
        // Utiliza clases de Bootstrap para el diseño (col-md-4 para 3 columnas, card, etc.).
        let html = `
        <div class="col-md-4 mb-4"> <!-- Contenedor de columna para el diseño responsivo -->
            <div class="card h-100"> <!-- Tarjeta Bootstrap, h-100 para igualar alturas en la fila -->
                <img src="${photoData.url}" class="card-img-top" alt="${photoData.title}" style="height: 200px; object-fit: cover;"> <!-- Imagen de la foto -->
                <div class="card-body d-flex flex-column"> <!-- Cuerpo de la tarjeta, flex para alinear contenido -->
                    <h5 class="card-title">${photoData.title}</h5> <!-- Título de la foto -->
                    <p class="card-text"><small class="text-muted">ID: ${photoData.photoId}</small></p> <!-- ID de la foto -->
                    <div class="mt-auto tags-container"> <!-- Contenedor para las etiquetas, mt-auto las empuja al final -->
                        <h6>Etiquetas:</h6>
                        ${tagsHTML} <!-- HTML de las etiquetas generado arriba -->
                    </div>
                </div>
            </div>
        </div>`;

        return parseHTML(html); // Convierte la cadena HTML en un elemento DOM real.
    }
};

export { PhotoRenderer }; // Exporta el renderizador para que pueda ser usado en otros módulos.