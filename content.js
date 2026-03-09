(function () {
    'use strict';

    let currentFilter = 'all'; // 'all', 'particular'
    let adsDataMap = {}; // mapping of adId -> sellerType 
    let dataExtracted = false;

    // 1. EXTRAER LA IDENTIDAD DE LOS ANUNCIOS
    const extractUtagData = () => {
        if (dataExtracted) return;

        // Método A: Inyectar un script para leer directamente de las variables de memoria y guardarlo en un data-attribute
        try {
            const script = document.createElement('script');
            script.textContent = `
                try {
                    if (window.utag_data && window.utag_data.list && window.utag_data.list.ads) {
                        const mapped = {};
                        window.utag_data.list.ads.forEach(ad => {
                            if (ad.adId && ad.owner && ad.owner.type) {
                                mapped[ad.adId] = (ad.owner.type === "1") ? 'particular' : 'professional';
                            }
                        });
                        document.body.dataset.utagAds = JSON.stringify(mapped);
                    }
                } catch(e) {}
            `;
            document.documentElement.appendChild(script);
            script.remove();

            if (document.body.dataset.utagAds) {
                const data = JSON.parse(document.body.dataset.utagAds);
                Object.assign(adsDataMap, data);
                if (Object.keys(adsDataMap).length > 0) {
                    dataExtracted = true;
                    return;
                }
            }
        } catch (e) { }

        // Método B: Fallback a leer los tags script de la página y parsear el JSON como texto puro (A prueba de CSP)
        if (!dataExtracted) {
            const scripts = document.querySelectorAll('script');
            for (const script of scripts) {
                const text = script.textContent;
                if (text && text.includes('var utag_data =')) {
                    try {
                        let start = text.indexOf('var utag_data = ') + 16;
                        let endStr = 'var dataLayerContext =';
                        let end = text.indexOf(endStr);
                        if (end === -1) {
                            endStr = 'window.utag_data =';
                            end = text.indexOf(endStr);
                        }
                        if (end !== -1) {
                            let jsonStr = text.substring(start, end).trim();
                            if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);

                            const data = JSON.parse(jsonStr);
                            if (data && data.list && data.list.ads) {
                                data.list.ads.forEach(ad => {
                                    if (ad.adId && ad.owner && ad.owner.type) {
                                        adsDataMap[ad.adId] = (ad.owner.type === "1") ? 'particular' : 'professional';
                                    }
                                });
                                dataExtracted = true;
                                break;
                            }
                        }
                    } catch (e) {
                        console.error('Idealista-Filter: Error en Fallback parsing JSON', e);
                    }
                }
            }
        }
    };

    // 2. EL FILTRO (Panel de UI - Restaurado a la versión anterior que le gustaba al usuario)
    const createFilterPanel = () => {
        if (document.getElementById('idealista-custom-filter')) return;

        const mainContent = document.querySelector('#main-content') || document.querySelector('.listing-top') || document.body;

        const filterContainer = document.createElement('div');
        filterContainer.id = 'idealista-custom-filter';
        filterContainer.innerHTML = `
            <div style="background: #f1f1f1; padding: 10px; margin-bottom: 20px; border: 1px solid #ccc; display: flex; gap: 10px; align-items: center; border-radius: 4px;">
                <strong>Filtro Custom:</strong>
                <label style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                    <input type="radio" name="sellerfilter" value="all" ${currentFilter === 'all' ? 'checked' : ''}> Todos
                </label>
                <label style="cursor:pointer; display:flex; align-items:center; gap:5px;">
                    <input type="radio" name="sellerfilter" value="particular" ${currentFilter === 'particular' ? 'checked' : ''}> Solo Particulares
                </label>
            </div>
        `;

        if (document.querySelector('#main-content')) {
            document.querySelector('#main-content').prepend(filterContainer);
        } else {
            mainContent.insertBefore(filterContainer, mainContent.firstChild);
        }

        // Event Listeners for buttons
        const radios = filterContainer.querySelectorAll('input[name="sellerfilter"]');
        radios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    currentFilter = e.target.value;
                    applyFilter();
                }
            });
        });
    };

    // 3. APLICAR FILTROS (Ocultación Inmediata)
    const applyFilter = () => {
        const items = document.querySelectorAll('article.item');

        items.forEach(item => {
            if (item.classList.contains('adv')) return;

            const adId = item.dataset.elementId;
            let isProfessional = false;

            if (adId && adsDataMap[adId]) {
                item.dataset.sellerType = adsDataMap[adId];
                isProfessional = (adsDataMap[adId] === 'professional');
            } else if (
                item.classList.contains('item_contains_branding') ||
                item.querySelector('.item-logo-branding') ||
                (item.dataset && item.dataset.sellerType === 'professional') ||
                item.querySelector('a[data-markup="listado::logo-agencia"]')
            ) {
                isProfessional = true;
                item.dataset.sellerType = 'professional';
            }

            if (currentFilter === 'particular' && isProfessional) {
                item.style.display = 'none';
                item.classList.add('hidden-by-filter');
            } else {
                item.style.display = '';
                item.classList.remove('hidden-by-filter');
            }
        });
    };

    // Inicialización global
    extractUtagData();
    createFilterPanel();
    applyFilter();

    // Vigilar si Idealista carga más anuncios o re-renderiza el layout
    new MutationObserver(() => {
        extractUtagData();
        createFilterPanel();
        applyFilter();
    }).observe(document.body, { childList: true, subtree: true });

})();
