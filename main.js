const tasaInput = document.getElementById('tasaInput');
    const tablaBody = document.querySelector('#tablaProductos tbody');
    const actualizarBtn = document.getElementById('actualizarBtn');

    // Clave para localStorage
    const STORAGE_KEY = 'gestorPreciosData';

    // === FUNCIONES DE ALMACENAMIENTO ===

    function guardarDatos() {
      const tasa = parseFloat(tasaInput.value);
      if (isNaN(tasa) || tasa <= 0) return;

      const productos = [];
      const filas = tablaBody.querySelectorAll('tr');

      filas.forEach(fila => {
        const nombre = fila.querySelector('input[type="text"]').value || '';
        const bs = fila.querySelector('.bs').value;
        const usd = fila.querySelector('.usd').value;
        productos.push({ nombre, bs, usd });
      });

      const data = { tasa, productos };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function cargarDatos() {
      const dataStr = localStorage.getItem(STORAGE_KEY);
      if (!dataStr) return false;

      try {
        const data = JSON.parse(dataStr);
        if (typeof data.tasa === 'number' && data.tasa > 0) {
          tasaInput.value = data.tasa;
        }

        if (Array.isArray(data.productos) && data.productos.length > 0) {
          tablaBody.innerHTML = '';
          data.productos.forEach(p => {
            agregarProducto(p.nombre || '', p.bs || '', p.usd || '');
          });
          return true;
        }
      } catch (e) {
        console.error('Error al cargar datos:', e);
      }
      return false;
    }

    // === FUNCIONES DE ACTUALIZACIÓN ===

    function actualizarProducto(fila, tasa) {
      const bsInput = fila.querySelector('.bs');
      const usdInput = fila.querySelector('.usd');

      const bs = parseFloat(bsInput.value);
      const usd = parseFloat(usdInput.value);

      // Evitar actualización si ambos están vacíos o inválidos
      if (!isNaN(usd)) {
        bsInput.value = (usd * tasa).toFixed(2);
      } else if (!isNaN(bs)) {
        usdInput.value = (bs / tasa).toFixed(2);
      }
    }

    function actualizarTodos() {
      const tasa = parseFloat(tasaInput.value);
      if (isNaN(tasa) || tasa <= 0) {
        alert('Por favor ingresa una tasa válida (mayor a 0).');
        return;
      }

      const filas = tablaBody.querySelectorAll('tr');
      filas.forEach(fila => actualizarProducto(fila, tasa));

      guardarDatos(); // Guardar tras actualizar
    }

    // === CREAR FILAS ===

    function agregarProducto(nombre = '', bs = '', usd = '') {
      const nuevaFila = document.createElement('tr');
      nuevaFila.innerHTML = `
        <td><input type="text" value="${nombre.replace(/"/g, '&quot;')}" placeholder="Nombre del producto" /></td>
        <td><input type="number" class="bs" step="0.01" value="${bs}" placeholder="0.00" /></td>
        <td><input type="number" class="usd" step="0.01" value="${usd}" placeholder="0.00" /></td>
      `;
      tablaBody.appendChild(nuevaFila);

      // Añadir listeners a los nuevos inputs
      const inputs = nuevaFila.querySelectorAll('input');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          guardarDatos();
        });
      });
    }

    // === EVENTOS ===

    actualizarBtn.addEventListener('click', actualizarTodos);

    // Guardar al cambiar la tasa
    tasaInput.addEventListener('input', () => {
      const tasa = parseFloat(tasaInput.value);
      if (!isNaN(tasa) && tasa > 0) {
        actualizarTodos(); // Opcional: actualizar al instante
      }
      guardarDatos();
    });

    // Cargar datos al iniciar
    window.addEventListener('load', () => {
      const hayDatos = cargarDatos();
      if (!hayDatos) {
        // Datos iniciales si no hay nada guardado
        agregarProducto('Arroz 1kg', '36.50', '1.00');
        agregarProducto('Leche 1L', '73.00', '2.00');
        guardarDatos();
      }
    });

    // Guardar al salir (opcional, pero útil)
    window.addEventListener('beforeunload', guardarDatos);