// Gallery functionality
document.addEventListener('DOMContentLoaded', function() {
    const galleryGrid = document.getElementById('gallery-grid');
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxCounter = document.getElementById('lightbox-counter');
    
    let currentImageIndex = 0;
    let images = [];
    let masonry;
    
    // Gallery images data - these correspond to the images in /img/gallery/
    const galleryImages = [
        { src: 'img/gallery/001.jpg', alt: 'Coffee shop interior' },
        { src: 'img/gallery/002.jpg', alt: 'Fresh coffee beans' },
        { src: 'img/gallery/003.jpg', alt: 'Coffee brewing process' },
        { src: 'img/gallery/004.jpg', alt: 'Delicious pastries' },
        { src: 'img/gallery/005.jpg', alt: 'Coffee cup close-up' },
        { src: 'img/gallery/006.jpg', alt: 'Drive-thru service' },
        { src: 'img/gallery/007.jpg', alt: 'Coffee roasting' },
        { src: 'img/gallery/008.jpg', alt: 'Customer enjoying coffee' },
        { src: 'img/gallery/009.jpg', alt: 'Coffee shop exterior' }
    ];
    
    // Preload all images before rendering gallery
    function preloadImages() {
        return new Promise((resolve, reject) => {
            const imagePromises = galleryImages.map((imageData, index) => {
                return new Promise((imgResolve, imgReject) => {
                    const img = new Image();
                    img.onload = () => imgResolve({ ...imageData, index });
                    img.onerror = () => imgReject({ ...imageData, index, error: true });
                    img.src = imageData.src;
                });
            });
            
            Promise.allSettled(imagePromises).then(results => {
                const loadedImages = results
                    .filter(result => result.status === 'fulfilled')
                    .map(result => result.value);
                
                const failedImages = results
                    .filter(result => result.status === 'rejected')
                    .map(result => result.value);
                
                resolve({ loadedImages, failedImages });
            });
        });
    }
    
    // Initialize gallery
    function initGallery() {
        // Show loading indicator
        galleryGrid.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666; font-size: 1.2rem;">
                Loading gallery...
            </div>
        `;
        
        // Preload all images first
        preloadImages().then(({ loadedImages, failedImages }) => {
            // Clear loading indicator
            galleryGrid.innerHTML = '';
            
            // Create gallery items for successfully loaded images
            loadedImages.forEach((imageData) => {
                const galleryItem = document.createElement('div');
                galleryItem.className = 'gallery-item';
                galleryItem.setAttribute('data-index', imageData.index);
                
                const img = document.createElement('img');
                img.src = imageData.src;
                img.alt = imageData.alt;
                img.loading = 'eager'; // Images are already loaded, so use eager loading
                
                galleryItem.appendChild(img);
                galleryGrid.appendChild(galleryItem);
                
                // Add click event listener
                galleryItem.addEventListener('click', () => openLightbox(imageData.index));
            });
            
            // Handle failed images
            if (failedImages.length > 0) {
                console.warn('Some images failed to load:', failedImages);
                failedImages.forEach((imageData) => {
                    const galleryItem = document.createElement('div');
                    galleryItem.className = 'gallery-item';
                    galleryItem.setAttribute('data-index', imageData.index);
                    galleryItem.innerHTML = `
                        <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666; font-size: 1.2rem;">
                            Image not found
                        </div>
                    `;
                    galleryGrid.appendChild(galleryItem);
                });
            }
            
            // Initialize Masonry after all images are loaded
            setTimeout(() => {
                if (typeof Masonry !== 'undefined') {
                    // Calculate optimal column width based on container
                    const containerWidth = galleryGrid.offsetWidth;
                    const gutter = 16;
                    const minItemWidth = 250;
                    const maxItemWidth = 350;
                    
                    // Calculate number of columns that fit
                    let columns = Math.floor((containerWidth + gutter) / (minItemWidth + gutter));
                    columns = Math.max(1, Math.min(columns, 6)); // Between 1 and 6 columns
                    
                    // Calculate optimal item width
                    const itemWidth = Math.floor((containerWidth - (columns - 1) * gutter) / columns);
                    const finalItemWidth = Math.max(minItemWidth, Math.min(maxItemWidth, itemWidth));
                    
                    masonry = new Masonry(galleryGrid, {
                        itemSelector: '.gallery-item',
                        columnWidth: finalItemWidth,
                        gutter: gutter,
                        percentPosition: false,
                        horizontalOrder: true,
                        transitionDuration: 0
                    });
                    
                    // Update CSS with calculated width
                    document.documentElement.style.setProperty('--masonry-item-width', finalItemWidth + 'px');
                    
                    // Layout Masonry immediately since images are already loaded
                    if (masonry) {
                        masonry.layout();
                    }
                }
            }, 50); // Reduced timeout since images are preloaded
            
            // Store images array for lightbox navigation
            images = galleryImages;
        }).catch(error => {
            console.error('Error preloading images:', error);
            // Fallback to original behavior if preloading fails
            galleryGrid.innerHTML = '<div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666; font-size: 1.2rem;">Error loading gallery</div>';
        });
    }
    
    // Open lightbox
    function openLightbox(index) {
        currentImageIndex = index;
        lightboxImage.src = images[index].src;
        lightboxImage.alt = images[index].alt;
        updateCounter();
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Add keyboard event listeners
        document.addEventListener('keydown', handleKeydown);
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
    }
    
    // Navigate to previous image
    function prevImage() {
        currentImageIndex = (currentImageIndex - 1 + images.length) % images.length;
        lightboxImage.src = images[currentImageIndex].src;
        lightboxImage.alt = images[currentImageIndex].alt;
        updateCounter();
    }
    
    // Navigate to next image
    function nextImage() {
        currentImageIndex = (currentImageIndex + 1) % images.length;
        lightboxImage.src = images[currentImageIndex].src;
        lightboxImage.alt = images[currentImageIndex].alt;
        updateCounter();
    }
    
    // Update counter display
    function updateCounter() {
        lightboxCounter.textContent = `${currentImageIndex + 1} / ${images.length}`;
    }
    
    // Handle keyboard navigation
    function handleKeydown(e) {
        switch(e.key) {
            case 'Escape':
                closeLightbox();
                break;
            case 'ArrowLeft':
                prevImage();
                break;
            case 'ArrowRight':
                nextImage();
                break;
        }
    }
    
    // Event listeners
    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', prevImage);
    lightboxNext.addEventListener('click', nextImage);
    
    // Close lightbox when clicking on background
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox) {
            closeLightbox();
        }
    });
    
    // Prevent lightbox content clicks from closing the lightbox
    lightbox.querySelector('.lightbox-content').addEventListener('click', function(e) {
        e.stopPropagation();
    });
    
    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    lightbox.addEventListener('touchstart', function(e) {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    lightbox.addEventListener('touchend', function(e) {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swipe left - next image
                nextImage();
            } else {
                // Swipe right - previous image
                prevImage();
            }
        }
    }
    
    // Initialize the gallery
    initGallery();
    
    // Handle window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            if (masonry) {
                // Recalculate optimal column width
                const containerWidth = galleryGrid.offsetWidth;
                const gutter = 16;
                const minItemWidth = 250;
                const maxItemWidth = 350;
                
                let columns = Math.floor((containerWidth + gutter) / (minItemWidth + gutter));
                columns = Math.max(1, Math.min(columns, 6));
                
                const itemWidth = Math.floor((containerWidth - (columns - 1) * gutter) / columns);
                const finalItemWidth = Math.max(minItemWidth, Math.min(maxItemWidth, itemWidth));
                
                // Update CSS variable
                document.documentElement.style.setProperty('--masonry-item-width', finalItemWidth + 'px');
                
                // Reinitialize Masonry with new settings
                masonry.destroy();
                masonry = new Masonry(galleryGrid, {
                    itemSelector: '.gallery-item',
                    columnWidth: finalItemWidth,
                    gutter: gutter,
                    percentPosition: false,
                    horizontalOrder: true,
                    transitionDuration: 0
                });
            }
        }, 250);
    });
    
    // Images are preloaded, so they appear instantly
    // This code is now handled in the preloadImages function
    
    // Preload next and previous images for smoother navigation
    function preloadAdjacentImages() {
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        const nextIndex = (currentImageIndex + 1) % images.length;
        
        const prevImg = new Image();
        prevImg.src = images[prevIndex].src;
        
        const nextImg = new Image();
        nextImg.src = images[nextIndex].src;
    }
    
    // Preload images when lightbox opens
    lightbox.addEventListener('transitionend', function() {
        if (lightbox.classList.contains('active')) {
            preloadAdjacentImages();
        }
    });
    
    // Add smooth transitions for image changes
    lightboxImage.addEventListener('load', function() {
        this.style.opacity = '1';
    });
    
    // Set initial opacity for smooth transitions
    lightboxImage.style.opacity = '0';
    lightboxImage.style.transition = 'opacity 0.3s ease';
    
    // Update image opacity when changing
    function updateImageOpacity() {
        lightboxImage.style.opacity = '0';
        setTimeout(() => {
            lightboxImage.style.opacity = '1';
        }, 150);
    }
    
    // Override prevImage and nextImage to include opacity transition
    const originalPrevImage = prevImage;
    const originalNextImage = nextImage;
    
    prevImage = function() {
        updateImageOpacity();
        originalPrevImage();
    };
    
    nextImage = function() {
        updateImageOpacity();
        originalNextImage();
    };
});
