# Filtro Idealista: Particular vs. Profesional

Esta extensión añade un panel de filtrado en Idealista para que puedas elegir ver solo anuncios de particulares, solo de profesionales (inmobiliarias) o ambos.

## Cómo instalarla

1. Abre Google Chrome.
2. Ve a `chrome://extensions/`.
3. Activa el **Modo de desarrollador** (esquina superior derecha).
4. Haz clic en **Cargar descomprimida** (Load unpacked).
5. Selecciona la carpeta `idealista-filter-extension` donde has guardado estos archivos.

## Cómo usarla

1. Navega a [idealista.com](https://www.idealista.com).
2. Realiza una búsqueda de pisos (venta o alquiler).
3. Verás un nuevo panel en la parte superior de los resultados con botones para filtrar:
   - **Todos**: Muestra todos los resultados.
   - **Particulares**: Solo muestra anuncios de particulares.
   - **Profesionales**: Solo muestra anuncios de agencias e inmobiliarias.

## Notas técnicas
- La extensión detecta a los profesionales buscando la clase `item_contains_branding` y contenedores de logotipos en el código de la página.
- Funciona dinámicamente: si sigues haciendo scroll o cambias de página, el filtro se aplica automáticamente a los nuevos resultados.
- No recopila ningún dato personal ni se comunica con servidores externos.
