document.addEventListener('DOMContentLoaded', () => {
    // Filter chips interaction
    const filterChips = document.querySelectorAll('.filter-chip');
    
    function applyFilter(filter) {
        const query = document.getElementById('search-input')?.value.toLowerCase() || '';
        const targets = document.querySelectorAll('.filter-target');
        
        // Filter banner and cards
        targets.forEach(target => {
            const categories = target.getAttribute('data-category').split(' ');
            const matchesCategory = categories.includes(filter);
            
            let matchesSearch = true;
            if (target.classList.contains('app-item')) {
                const appName = target.querySelector('.app-name').textContent.toLowerCase();
                matchesSearch = appName.includes(query);
            }
            
            if (matchesCategory && matchesSearch) {
                target.style.display = '';
            } else {
                target.style.display = 'none';
            }
        });

        // Adjust sections visibility based on visible children
        const sections = document.querySelectorAll('.app-section');
        sections.forEach(section => {
            let hasVisible = false;
            section.querySelectorAll('.app-item').forEach(item => {
                if (item.style.display !== 'none') {
                    hasVisible = true;
                }
            });
            if (hasVisible) {
                section.style.display = '';
            } else {
                section.style.display = 'none';
            }
        });
    }

    filterChips.forEach(chip => {
        chip.addEventListener('click', () => {
            // Remove active class from all
            filterChips.forEach(c => c.classList.remove('active'));
            // Add active to clicked
            chip.classList.add('active');

            const filter = chip.getAttribute('data-filter');
            applyFilter(filter);
        });
    });

    // Run initial filter on load based on active chip
    const activeChip = document.querySelector('.filter-chip.active');
    if (activeChip) {
        applyFilter(activeChip.getAttribute('data-filter'));
    }

    // Real-time search filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            const currentActiveChip = document.querySelector('.filter-chip.active');
            if (currentActiveChip) {
                applyFilter(currentActiveChip.getAttribute('data-filter'));
            }
        });
    }

    // Horizontal scrolling with mouse wheel for app lists
    const appLists = document.querySelectorAll('.app-list');
    
    appLists.forEach(list => {
        list.addEventListener('wheel', (e) => {
            if (e.deltaY !== 0) {
                e.preventDefault();
                list.scrollLeft += e.deltaY;
            }
        });
    });

    // Modal controls
    const edupolAndroidBtn = document.getElementById('edupol-android-btn');
    const edupolWebBtn = document.getElementById('edupol-web-btn');
    
    const detailsModalAndroid = document.getElementById('details-modal-android');
    const detailsModalWeb = document.getElementById('details-modal-web');
    
    const closeDetailsAndroid = document.getElementById('close-details-modal-android');
    const closeDetailsWeb = document.getElementById('close-details-modal-web');
    
    const installBtn = document.getElementById('detail-install-btn');
    const downloadModal = document.getElementById('download-modal');
    const closeDownloadBtn = document.getElementById('close-modal');

    // Click on Android app card opens Android details
    if (edupolAndroidBtn) {
        edupolAndroidBtn.addEventListener('click', (e) => {
            e.preventDefault();
            detailsModalAndroid.style.display = 'flex';
        });
    }

    // Click on Web app card opens Web details
    if (edupolWebBtn) {
        edupolWebBtn.addEventListener('click', (e) => {
            e.preventDefault();
            detailsModalWeb.style.display = 'flex';
        });
    }

    // Close Android details
    if (closeDetailsAndroid) {
        closeDetailsAndroid.addEventListener('click', () => {
            detailsModalAndroid.style.display = 'none';
        });
    }

    // Close Web details
    if (closeDetailsWeb) {
        closeDetailsWeb.addEventListener('click', () => {
            detailsModalWeb.style.display = 'none';
        });
    }

    // Inside Android details page, clicking Install starts Smart Download
    if (installBtn) {
        installBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            let arch = null;
            
            // Try modern Client Hints API if available (Chromium-based browsers)
            if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                try {
                    const values = await navigator.userAgentData.getHighEntropyValues(["architecture", "bitness"]);
                    if (values.architecture === 'arm') {
                        if (values.bitness === '64') arch = 'arm64';
                        else arch = 'armv7';
                    } else if (values.architecture === 'x86') {
                        if (values.bitness === '64') arch = 'x86_64';
                    }
                } catch (err) {
                    console.error("Error reading HighEntropyValues", err);
                }
            }
            
            // Fallback: parse userAgent string for clues
            if (!arch) {
                const ua = navigator.userAgent.toLowerCase();
                if (ua.includes('android')) {
                    if (ua.includes('aarch64') || ua.includes('armv8') || ua.includes('arm64')) {
                        arch = 'arm64';
                    } else if (ua.includes('armv7') || ua.includes('armeabi')) {
                        arch = 'armv7';
                    } else if (ua.includes('x86_64') || ua.includes('x86-64')) {
                        arch = 'x86_64';
                    }
                }
            }
            
            // Direct download if we have a high confidence guess
            if (arch === 'arm64') {
                window.location.href = 'apks/app-arm64-v8a-release.apk';
            } else if (arch === 'armv7') {
                window.location.href = 'apks/app-armeabi-v7a-release.apk';
            } else if (arch === 'x86_64') {
                window.location.href = 'apks/app-x86_64-release.apk';
            } else {
                // If we can't reliably detect it, show the selection sub-modal
                downloadModal.style.display = 'flex';
            }
        });
    }

    if (closeDownloadBtn) {
        closeDownloadBtn.addEventListener('click', () => {
            downloadModal.style.display = 'none';
        });
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === detailsModalAndroid) {
            detailsModalAndroid.style.display = 'none';
        }
        if (e.target === detailsModalWeb) {
            detailsModalWeb.style.display = 'none';
        }
        if (e.target === downloadModal) {
            downloadModal.style.display = 'none';
        }
    });

    // Bottom Navigation sync with Top Navigation
    const bottomNavItems = document.querySelectorAll('.bottom-nav-item');
    const mainNavLinks = document.querySelectorAll('.main-nav a');

    bottomNavItems.forEach((item, index) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            bottomNavItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            if (mainNavLinks[index]) {
                mainNavLinks.forEach(l => l.classList.remove('active'));
                mainNavLinks[index].classList.add('active');
            }
        });
    });
});
