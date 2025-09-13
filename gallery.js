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
    
    // Initialize gallery
    function initGallery() {
        // Clear existing content
        galleryGrid.innerHTML = '';
        
        // Create gallery items
        galleryImages.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-index', index);
            
            const img = document.createElement('img');
            img.src = image.src;
            img.alt = image.alt;
            img.loading = 'lazy';
            
            // Add error handling for missing images
            img.onerror = function() {
                this.style.display = 'none';
                galleryItem.innerHTML = `
                    <div style="display: flex; align-items: center; justify-content: center; height: 200px; color: #666; font-size: 1.2rem;">
                        Image not found
                    </div>
                `;
            };
            
            galleryItem.appendChild(img);
            galleryGrid.appendChild(galleryItem);
            
            // Add click event listener
            galleryItem.addEventListener('click', () => openLightbox(index));
        });
        
        // Initialize Masonry after images are loaded
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
                
                // Layout Masonry after each image loads
                const images = galleryGrid.querySelectorAll('img');
                images.forEach(img => {
                    img.addEventListener('load', () => {
                        if (masonry) {
                            masonry.layout();
                        }
                    });
                });
            }
        }, 100);
        
        // Store images array for lightbox navigation
        images = galleryImages;
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
    
    // No loading animations - images load instantly
    const galleryItems = document.querySelectorAll('.gallery-item img');
    galleryItems.forEach(img => {
        img.style.opacity = '1';
    });
    
    // No animations - gallery items appear instantly
    const galleryItemsElements = document.querySelectorAll('.gallery-item');
    galleryItemsElements.forEach(item => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
    });
    
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
