"use strict";

import { photoswithtagsAPI_auto } from './api/_photoswithtags.js';
import { PhotoRenderer } from './renderers/photoRenderer.js';

async function main() {
    const galleryContainer = document.getElementById('divGallery');
    if (!galleryContainer) return;
    
    galleryContainer.innerHTML = '';

    try {
        const photosWithTagsRaw = await photoswithtagsAPI_auto.getAll();
        const photosById = {};        for (const item of photosWithTagsRaw) {
            if (item.visibility !== 'Public') continue;
            
            if (!photosById[item.photoId]) {
                photosById[item.photoId] = {
                    photoId: item.photoId,
                    title: item.title,
                    url: item.url,
                    tags: []
                };
            }

            if (item.name && !photosById[item.photoId].tags.includes(item.name)) {
                photosById[item.photoId].tags.push(item.name);
            }
        }
        
        const publicPhotos = Object.values(photosById);

        if (publicPhotos.length === 0) {
            galleryContainer.innerHTML = '<p class="text-center text-muted col-12">No se encontraron fotos públicas con etiquetas.</p>';
        } else {
            publicPhotos.forEach(photoData => {
                const photoCardElement = PhotoRenderer.renderPhotoCard(photoData);
                galleryContainer.appendChild(photoCardElement);
            });
        }
    } catch (error) {
        console.error("Error al cargar o procesar las fotos:", error);
        galleryContainer.innerHTML = '<p class="text-center text-danger col-12">Ocurrió un error al cargar las fotos. Por favor, inténtalo más tarde.</p>';
    }
}

document.addEventListener('DOMContentLoaded', main);