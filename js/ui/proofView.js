
export function initProofView() {
    const proofContainer = document.getElementById('proof-container');
    const proof = document.getElementById('proof');
    
    // Zoom Controls (Sidebar)
    const zoomInBtn = document.getElementById('sb-plus');
    const zoomOutBtn = document.getElementById('sb-minus');
    const resetZoomBtn = document.getElementById('sb-reset');
    
    // Legacy Controls (fallback if sidebar not present)
    const legacyZoomIn = document.getElementById('zoomInBtn');
    const legacyZoomOut = document.getElementById('zoomOutBtn');
    const legacyReset = document.getElementById('resetZoomBtn');

    if (!proofContainer || !proof) return;

    let scale = 1;
    let translateX = 0;
    let translateY = 0;
    let isDragging = false;
    let startX = 0; // Calculated start offset
    let startY = 0;
    
    // For click prevention
    let mouseStartX = 0; 
    let mouseStartY = 0;

    const updateTransform = () => {
        proof.style.transform = `translate(${translateX}px, ${translateY}px) scale(${scale})`;
    };

    const zoom = (delta, mouseX, mouseY) => {
        // Sensitivity factor for smoother zoom (especially for trackpads)
        // 0.002 provides a good balance between speed and precision
        const sensitivity = 0.002;
        
        // Use exponential zoom for smooth scaling proportional to input delta
        // delta > 0 (scroll down) -> exp(-val) < 1 -> zoom out
        // delta < 0 (scroll up)   -> exp(val) > 1  -> zoom in
        const scaleChange = Math.exp(-delta * sensitivity);

        const newScale = Math.min(Math.max(0.1, scale * scaleChange), 5);
        
        // Calculate actual scale ratio applied
        const ratio = newScale / scale;

        if (mouseX !== undefined && mouseY !== undefined) {
            // Get container offset
            const rect = proofContainer.getBoundingClientRect();
            // Mouse position relative to container
            const mx = mouseX - rect.left;
            const my = mouseY - rect.top;

            // Calculate new translate to keep mouse point stationary
            // formula: new_translate = mouse_pos - (mouse_pos - old_translate) * scale_ratio
            translateX = mx - (mx - translateX) * ratio;
            translateY = my - (my - translateY) * ratio;
        } else {
            // If no mouse pos (e.g. buttons), zoom to center of container
            const rect = proofContainer.getBoundingClientRect();
            const cx = rect.width / 2;
            const cy = rect.height / 2;
             translateX = cx - (cx - translateX) * ratio;
             translateY = cy - (cy - translateY) * ratio;
        }

        scale = newScale;
        updateTransform();
    };

    // Wheel Zoom
    proofContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        zoom(e.deltaY, e.clientX, e.clientY);
    });

    // Panning
    proofContainer.addEventListener('mousedown', (e) => {
        // Ignore buttons, inputs, textareas, and Monaco Editor interactions
        if (e.target.closest('button') || 
            e.target.closest('input') || 
            e.target.closest('textarea') || 
            e.target.closest('.monaco-editor') ||
            e.target.closest('.buttonText') ||
            e.target.closest('#saveBtn')) return; 
        
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        
        mouseStartX = e.clientX;
        mouseStartY = e.clientY;
        
        proof.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        translateX = e.clientX - startX;
        translateY = e.clientY - startY;
        updateTransform();
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            proof.style.cursor = 'grab';
        }
    });

    // Prevent click only if dragged significantly
    proof.addEventListener('click', (e) => {
         const dist = Math.sqrt(Math.pow(e.clientX - mouseStartX, 2) + Math.pow(e.clientY - mouseStartY, 2));
         // Only block click if it was a drag AND target isn't an interactive element we excluded
         if (dist > 5 && 
             !e.target.closest('button') && 
             !e.target.closest('input') && 
             !e.target.closest('.monaco-editor') && 
             !e.target.closest('#saveBtn')) {
             e.preventDefault();
             e.stopPropagation();
         }
    }, true);


    // Button Listeners (Sidebar)
    if (zoomInBtn) zoomInBtn.addEventListener('click', (e) => { e.preventDefault(); zoom(-100); });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', (e) => { e.preventDefault(); zoom(100); });
    if (resetZoomBtn) resetZoomBtn.addEventListener('click', (e) => {
        e.preventDefault();
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
        proofContainer.style.width = '';
        proofContainer.style.height = '';
    });
    
    // Legacy Button Listeners
    if (legacyZoomIn) legacyZoomIn.addEventListener('click', () => zoom(-100));
    if (legacyZoomOut) legacyZoomOut.addEventListener('click', () => zoom(100));
    if (legacyReset) legacyReset.addEventListener('click', () => {
        scale = 1;
        translateX = 0;
        translateY = 0;
        updateTransform();
        proofContainer.style.width = '';
        proofContainer.style.height = '';
    });

    // Custom Resize Logic
    const resizeHandle = document.getElementById('proof-resize-handle');
    if (resizeHandle) {
        let isResizing = false;
        let resizeStartX = 0;
        let resizeStartY = 0;
        let startWidth = 0;
        let startHeight = 0;

        resizeHandle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Prevent panning
            isResizing = true;
            resizeStartX = e.clientX;
            resizeStartY = e.clientY;
            startWidth = proofContainer.offsetWidth;
            startHeight = proofContainer.offsetHeight;
            document.body.style.cursor = 'nwse-resize';
        });

        window.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            e.preventDefault();
            const width = startWidth + (e.clientX - resizeStartX);
            const height = startHeight + (e.clientY - resizeStartY);
            
            // Apply new dimensions (with some minimums)
            proofContainer.style.width = Math.max(100, width) + 'px';
            proofContainer.style.height = Math.max(60, height) + 'px';
        });

        window.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                document.body.style.cursor = '';
            }
        });
    }

    // Auto-resize container when proof content changes (e.g. rule applied)
    const observer = new MutationObserver(() => {
        // Debounce slightly to wait for layout updates
        requestAnimationFrame(() => {
            // Temporarily disable min-height to measure actual content height
            // preventing the container's own height from influencing the measurement
            // via the CSS min-height: 100% rule on #proof
            const prevMinHeight = proof.style.minHeight;
            proof.style.minHeight = '0px';
            
            // Measure content
            const contentHeight = proof.offsetHeight;
            
            // Restore style
            proof.style.minHeight = prevMinHeight;
            
            // Calculate visual height based on content size and current scale
            const visualHeight = contentHeight * scale;
            
            // Update container height
            proofContainer.style.height = (visualHeight + 60) + 'px'; 
        });
    });

    observer.observe(proof, { childList: true, subtree: true });
}
