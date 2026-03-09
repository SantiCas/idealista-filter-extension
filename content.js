(function () {
    'use strict';

    let currentFilter = 'all'; // 'all', 'particular', 'professional'

    const createFilterPanel = () => {
        const header = document.querySelector('#content_main, .items-container, #main-content');
        if (!header) return;

        // Don't create if it already exists
        if (document.querySelector('.idealista-filter-panel')) return;

        const panel = document.createElement('div');
        panel.className = 'idealista-filter-panel';
        panel.innerHTML = `
            <label>Filtrar por vendedor:</label>
            <button class="idealista-filter-btn active" data-filter="all">Todos</button>
            <button class="idealista-filter-btn" data-filter="particular">Particulares</button>
            <button class="idealista-filter-btn" data-filter="professional">Profesionales</button>
        `;

        header.prepend(panel);

        panel.addEventListener('click', (e) => {
            if (e.target.classList.contains('idealista-filter-btn')) {
                const buttons = panel.querySelectorAll('.idealista-filter-btn');
                buttons.forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');

                currentFilter = e.target.dataset.filter;
                applyFilter();
            }
        });
    };

    const applyFilter = () => {
        const listings = document.querySelectorAll('article.item');

        listings.forEach(item => {
            // Is it a professional? Check the branding class or logo container
            const isProfessional = item.classList.contains('item_contains_branding') || !!item.querySelector('.item-logo-branding');

            // Or look for "Particular" text as an alternative for private sellers
            // const isParticularTxt = item.textContent.includes('Particular');

            switch (currentFilter) {
                case 'particular':
                    if (isProfessional) {
                        item.classList.add('hidden-by-filter');
                    } else {
                        item.classList.remove('hidden-by-filter');
                    }
                    break;
                case 'professional':
                    if (!isProfessional) {
                        item.classList.add('hidden-by-filter');
                    } else {
                        item.classList.remove('hidden-by-filter');
                    }
                    break;
                default: // 'all'
                    item.classList.remove('hidden-by-filter');
                    break;
            }
        });
    };

    // Monitor for changes (infinite scroll, pagination etc)
    const observer = new MutationObserver((mutations) => {
        applyFilter();
        createFilterPanel();
    });

    const config = { childList: true, subtree: true };
    observer.observe(document.body, config);

    // Initial run
    createFilterPanel();
    applyFilter();
})();
