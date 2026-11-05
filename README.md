# IAS Bank - Frontend

Interfaz web del core de transferencias de IAS Bank, construida con **Angular 21**. Permite registrar transferencias, ver su resultado al instante, consultar las transferencias recientes y administrar las cuentas, integrada con el backend real.

## Stack Tecnológico

| Tecnología | Uso |
|------------|-----|
| Angular 21 | Framework (componentes standalone, *signals*, sin Zone.js) |
| RxJS | Comunicación HTTP con el backend |
| Reactive Forms | Formularios tipados con validaciones |
| SCSS + variables CSS | Sistema de diseño con tema claro y oscuro |
| Nginx | Servidor de la aplicación y proxy hacia el backend (`/api`) en Docker |

No se usan librerías de componentes externas: íconos SVG propios, estilos y componentes compartidos hechos a la medida.

## Funcionalidades (RF07)

El menú lateral organiza cada funcionalidad en su propia pantalla:

| Pantalla | Ruta | Qué permite |
|----------|------|-------------|
| Nueva transferencia | `/transfers/new` | Registrar una transferencia y ver su resultado: estado, monto, cuentas, motivo del rechazo, referencia y fecha de procesamiento |
| Transferencias | `/transfers` | Historial paginado (10, 20 o 50 por página), de la más reciente a la más antigua. Incluye la **búsqueda por referencia** dentro de la misma tabla y un botón **Ver detalle** en cada fila, que consulta al backend y muestra toda la información de la transferencia |
| Cuentas | `/accounts` | Ver saldos y límites diarios; crear, depositar, retirar, **configurar el límite diario** y eliminar cuentas |
| Eventos | `/events` | Administración de los eventos publicados en RabbitMQ (punto opcional): pendientes, en reintento, publicados (en la cola) y fallidos, con reintentos `x / 3`, próximo intento, último error y mensajes en la cola. Se actualiza automáticamente cada 5 s |

**Experiencia de uso**

- **Modo claro / oscuro:** respeta la preferencia del sistema operativo, se puede cambiar desde el menú y se recuerda entre visitas. El modo oscuro usa fondo negro con acentos violeta.
- **Alertas:** cada acción muestra una notificación: transferencia autorizada, rechazada (con el motivo), solicitud ya procesada, consulta encontrada o no encontrada, historial actualizado, cuenta creada, depósito, retiro, cuenta eliminada y errores.
- **Validaciones en el formulario:** campos requeridos, monto mayor a cero y cuentas origen y destino diferentes. El límite diario se valida en el backend y su rechazo se muestra con el motivo.
- **Reintento seguro:** si el servidor no responde, se ofrece reintentar con la misma referencia, de modo que la transferencia nunca se duplica.
- **Confirmación** antes de eliminar una cuenta, y ventanas modales que se cierran con *Escape*.
- **Formato colombiano:** montos como `$ 600.000` y fechas `dd/MM/yyyy`.
- **Números de cuenta largos:** en las tablas, un número que no cabe se recorta con "…" y el número completo aparece al pasar el mouse. En el resultado y en el detalle de una transferencia se muestra completo, en dos líneas si hace falta.
- **Monto con separadores de miles:** en *Nueva transferencia*, el campo Monto agrega los puntos mientras se escribe (`600.000`, `1.500.000`). Solo acepta pesos enteros; al backend se envía el número sin puntos (`600000`).
- **Diseño adaptable:** en pantallas pequeñas el menú lateral se abre con el botón de menú.

## Arquitectura

```
src/app/
  core/                       Datos y servicios de la aplicación, organizados por tipo
    components/toast-container  Contenedor de alertas
    interceptors/               Registro de errores HTTP
    models/                     account, transfer, event, page
    services/                   AccountService, TransferService, EventService, ThemeService, ToastService
  shared/components/          Componentes reutilizables (icon, modal, pagination)
  shared/directives/          Directivas reutilizables (appAmountInput: monto con separadores de miles)
  features/
    transfers/
      components/             transfer-form, transfer-result, transfer-table, status-badge
      pages/                  new-transfer, transfer-history
      pipes/ validators/
    accounts/
      components/             account-table, account-form, transaction-form
      pages/                  account-page
```

- **Features con carga diferida (lazy loading)**: cada módulo funcional se descarga solo cuando se visita.
- **`core` contiene los datos por tipo y `features` las pantallas**: los modelos y servicios de cuentas y transferencias viven en `core/`; cada feature solo tiene sus páginas y componentes visuales.
- **Páginas y componentes de presentación**: las páginas manejan el estado y la comunicación con el backend; los componentes reciben datos (`input`) y emiten eventos (`output`).
- **Estado con *signals***: la aplicación funciona sin Zone.js, por lo que todo estado que cambia de forma asíncrona vive en *signals*.
- **Sistema de diseño**: los colores, sombras y radios son variables CSS definidas en `src/styles.scss`; el tema oscuro solo redefine esas variables.

## Cómo levantar el frontend

### Requisitos

| Herramienta | Versión |
|-------------|---------|
| Node.js | 20.19 o superior, 22.12 o superior, o 24 (requisito de Angular 21) |
| npm | Incluido con Node.js |
| Backend | Corriendo en `http://localhost:8080` ([cómo levantarlo](https://github.com/JEdwardGs17/iasbank-back#cómo-levantar-el-backend)) |

### Opción 1: servidor de desarrollo

```bash
npm install
npm start
```

La aplicación queda en http://localhost:4200 y se recarga sola al cambiar el código. En este modo llama al backend en `http://localhost:8080/api` (`src/environments/environment.ts`), que permite peticiones desde ese origen.

Debe usarse el puerto 4200, porque es el origen que el backend permite. Si la aplicación completa está corriendo con Docker, primero hay que detener su frontend: `docker stop ias_bank_frontend`.

### Opción 2: aplicación completa con Docker Compose

Desde la carpeta que contiene `IASBank`, `IASBankFront` y `docker-compose.yml`:

```bash
docker compose up --build -d
```

La aplicación queda en http://localhost:4200. La imagen compila Angular en modo producción y lo sirve con nginx, que reenvía `/api` al backend (`nginx.conf`). Por eso en producción la API se llama con la ruta relativa `/api` (`src/environments/environment.prod.ts`).

**Detener:** `docker compose down`.

### Comandos

| Comando | Qué hace |
|---------|----------|
| `npm start` | Servidor de desarrollo en http://localhost:4200 |
| `npm run build` | Compilación de producción en `dist/IASBankFront/browser` |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run e2e` | Pruebas de extremo a extremo (Playwright); requieren la aplicación corriendo |

## Pruebas

**Unitarias** (Vitest), 48 pruebas sobre las reglas que la interfaz hace cumplir: validación de cuentas diferentes, formato del monto con separadores de miles, traducción de motivos de rechazo, integración HTTP (distinción entre transferencia nueva y repetida), formulario, reintento seguro con la misma referencia, manejo de referencias en conflicto, búsqueda y detalle de transferencias, alertas y tema.

```bash
npm test
```

**De extremo a extremo** con [Playwright Test](https://github.com/microsoft/playwright): 30 pruebas que usan la aplicación completa en Chrome, contra el backend real. Requiere la aplicación corriendo con Docker (`docker compose up -d` desde `PlataformaBancaria`) y Google Chrome instalado.

```bash
npm run e2e           # ejecuta todas
npm run e2e:report    # abre el reporte HTML de la última ejecución
npx playwright test e2e/accounts.spec.ts   # un solo archivo
```

```
playwright.config.ts          Proyectos "escritorio" (1440 x 900) y "movil" (390 x 844), es-CO, hora de Bogotá
e2e/
  support/
    api.ts                    Cliente del backend para preparar datos y verificar resultados
    fixtures.ts               Fixtures: api y página que falla ante errores de consola inesperados
    global-setup.ts           Verifica que backend y frontend respondan antes de empezar
  layout.spec.ts              Menú lateral, navegación y tema claro / oscuro
  new-transfer.spec.ts        RF01, RF02, RF03, RF05 y formato del monto
  transfer-history.spec.ts    RF06: listado, paginación, detalle y búsqueda por referencia
  accounts.spec.ts            Crear, depositar, retirar, límite diario y eliminar
  events.spec.ts              Vista de eventos de RabbitMQ
  mobile.spec.ts              Menú y diseño en celular
```

Cómo funcionan en esta app:

| Aspecto | Funcionamiento |
|---------|----------------|
| **Datos** | Cada archivo crea sus propias cuentas por la API y las elimina al terminar. Sus números tienen 20 caracteres, el máximo que acepta el backend (`E2E-MHK3X9A1-0000001`), así que el diseño siempre se prueba con los números más anchos. No dependen de los saldos ni de los límites de las cuentas semilla, así que se pueden ejecutar las veces que se quiera en el mismo día. Las transferencias que generan se borran al reiniciar el backend (día limpio) |
| **Verificación contra el backend** | Además de lo que se ve en pantalla, las pruebas consultan la API: que el monto llegue sin puntos, que un reintento no duplique, que el límite se haya guardado, que una rechazada no genere evento |
| **Errores de consola** | Una prueba falla si el navegador registra un error que no provocó a propósito. Las que provocan uno (búsqueda inexistente, falla de red simulada, cuenta duplicada, saldo insuficiente) lo declaran con `allowedConsoleErrors` |
| **Ejecución** | Una prueba a la vez (`workers: 1`), porque todas comparten el mismo backend |
| **Fallas** | Se guardan captura de pantalla y *trace* de la prueba fallida en `test-results/`, visibles en el reporte HTML |

La relación entre cada requerimiento y las pruebas que lo demuestran está en [IASBank/docs/pruebas.md](../IASBank/docs/pruebas.md).

## Decisiones técnicas

Las decisiones del frontend y del sistema completo están registradas en el ADR [IASBank/docs/decisiones-tecnicas.md](../IASBank/docs/decisiones-tecnicas.md); la del frontend es la [ADR-11](../IASBank/docs/decisiones-tecnicas.md#adr-11).

## Uso de Inteligencia Artificial

Documentado para todo el proyecto en [IASBank/docs/uso-de-ia.md](../IASBank/docs/uso-de-ia.md).
