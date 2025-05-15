"use strict";

// Importamos las APIs y renderizadores necesarios
// photoswithtagsAPI_auto: API para obtener fotos con sus etiquetas
// PhotoRenderer: Utilidad para renderizar las tarjetas de fotos en el DOM
import { photoswithtagsAPI_auto } from './api/_photoswithtags.js';
import { PhotoRenderer } from './renderers/photoRenderer.js';
import { sessionManager } from './utils/session.js';
import { photostagsAPI_auto } from './api/_photostags.js';
import { messageRenderer } from './renderers/messages.js';

/**
 * Función principal que se ejecuta al cargar la página
 * Se encarga de obtener las fotos públicas con sus etiquetas y mostrarlas en la galería
 */
async function main() {
    // Obtenemos el contenedor donde se mostrarán las fotos
    const galleryContainer = document.getElementById('divGallery');
    if (!galleryContainer) return; // Si no existe el contenedor, salimos de la función
    
    // Limpiamos el contenedor antes de añadir nuevos elementos
    galleryContainer.innerHTML = '';

    // Cambiamos el título de la página si el usuario está conectado
    updatePageTitle();

    try {
        // Obtenemos todas las fotos con sus etiquetas desde la API
        const photosWithTagsRaw = await photoswithtagsAPI_auto.getAll();
        
        // Objeto para agrupar las fotos por ID y evitar duplicados
        const photosById = {};
        
        // Verificamos si el usuario está conectado
        const isLogged = sessionManager.isLogged();
        const loggedUserId = isLogged ? sessionManager.getLoggedId() : null;
        const isAdmin = isLogged && sessionManager.getLoggedUser().username === 'root';
        
        // Procesamos cada entrada para organizar las fotos con sus etiquetas
        for (const item of photosWithTagsRaw) {
            // Si el usuario está conectado, mostramos solo sus fotos o todas si es admin
            if (isLogged) {
                if (isAdmin || item.userId === loggedUserId) {
                    // Procesar esta foto
                } else {
                    continue; // Omitir fotos que no sean del usuario
                }
            } else {
                // Si no está conectado, solo mostramos fotos públicas
                if (item.visibility !== 'Public') continue;
            }
            
            // Si es la primera vez que vemos esta foto, la inicializamos en nuestro objeto
            if (!photosById[item.photoId]) {
                photosById[item.photoId] = {
                    photoId: item.photoId,
                    title: item.title,
                    url: item.url,
                    userId: item.userId,
                    tags: [],
                    tagIds: [] // Añadimos un array para almacenar también los IDs de las etiquetas
                };
            }

            // Añadimos la etiqueta si existe y no está duplicada
            if (item.name && !photosById[item.photoId].tags.includes(item.name)) {
                photosById[item.photoId].tags.push(item.name);
                // Si existe photoTagId, lo guardamos junto con el nombre del tag
                if (item.photoTagId) {
                    photosById[item.photoId].tagIds.push({
                        id: item.photoTagId,
                        name: item.name
                    });
                }
            }
        }
        
        // Convertimos el objeto de fotos a un array para facilitar su procesamiento
        const photosToShow = Object.values(photosById);

        // Mostramos un mensaje apropiado si no hay fotos para mostrar
        if (photosToShow.length === 0) {
            let message = isLogged 
                ? '<p class="text-center text-muted col-12">No se encontraron fotos con etiquetas para gestionar.</p>'
                : '<p class="text-center text-muted col-12">No se encontraron fotos públicas con etiquetas.</p>';
            galleryContainer.innerHTML = message;
        } else {
            // Renderizamos cada foto en la galería
            photosToShow.forEach(photoData => {
                const photoCardElement = PhotoRenderer.renderPhotoCard(photoData, isLogged);
                galleryContainer.appendChild(photoCardElement);
            });
            
            // Si el usuario está conectado, añadimos event listeners para los botones de borrar
            if (isLogged) {
                addDeleteTagEventListeners();
            }
        }
    } catch (error) {
        // Capturamos y mostramos cualquier error que ocurra durante el proceso
        console.error("Error al cargar o procesar las fotos:", error);
        galleryContainer.innerHTML = '<p class="text-center text-danger col-12">Ocurrió un error al cargar las fotos. Por favor, inténtalo más tarde.</p>';
    }
}

/**
 * Función para actualizar el título de la página según el estado de la sesión
 */
function updatePageTitle() {
    const pageTitleElement = document.getElementById('pageTitle');
    if (pageTitleElement) {
        if (sessionManager.isLogged()) {
            pageTitleElement.textContent = "My Tags' Management";
        } else {
            pageTitleElement.textContent = "Tags";
        }
    }
}

/**
 * Añade event listeners a los botones de borrar etiquetas
 */
function addDeleteTagEventListeners() {
    const deleteButtons = document.querySelectorAll('.delete-tag-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const photoTagId = this.getAttribute('data-phototag-id');
            const tagName = this.getAttribute('data-tag-name');
            
            // Mostrar confirmación antes de borrar
            if (confirm(`¿Está seguro que desea eliminar la etiqueta "${tagName}"?`)) {
                try {
                    await photostagsAPI_auto.delete(photoTagId);
                    // Actualizar la vista después de borrar
                    main();
                    messageRenderer.showSuccessMessage(`Etiqueta "${tagName}" eliminada con éxito.`);
                } catch (error) {
                    console.error("Error al eliminar la etiqueta:", error);
                    messageRenderer.showErrorMessage(`Error al eliminar la etiqueta: ${error.message}`);
                }
            }
        });
    });
}

// Añadimos un event listener para ejecutar la función principal cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', main);