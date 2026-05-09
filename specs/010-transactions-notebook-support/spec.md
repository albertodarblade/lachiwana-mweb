# Feature Specification: Soporte de Notebooks de Transacciones

**Feature Branch**: `010-transactions-notebook-support`
**Created**: 2026-05-08
**Status**: Draft
**Input**: User description: "Actualiza el Frontend para soportar el nuevo tipo de Notebook de transacciones."

## Clarifications

### Session 2026-05-08

- Q: Cuando `type` cambia de `'transactions'` a `'notes'`, ¿qué sucede con las transacciones existentes? → A: Se preservan silenciosamente en la base de datos; el frontend cambia la vista a notas sin advertencia ni pérdida de datos.
- Q: ¿Dónde se muestra el selector `transactionsViewType` (`'all'` / `'by-month'`)? → A: Solo en la página de configuración/edición del Notebook; no aparece como toggle en la vista de transacciones.
- Q: ¿Cuál es el mes inicial que muestra `MonthSelector` al abrir la vista `'by-month'`? → A: Siempre el mes calendar actual; si no hay transacciones en ese mes se muestra `TransactionEmptyState`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear Notebook de Tipo Transacciones (Priority: P1)

Un usuario crea un nuevo Notebook y elige el tipo "transacciones" mediante un selector de Radio Button en el formulario. El sistema persiste la selección y redirige al usuario a la vista de transacciones del notebook.

**Why this priority**: Es el flujo de entrada más crítico. Sin él, ningún Notebook de transacciones puede existir y el resto de la funcionalidad no tiene sentido.

**Independent Test**: Se puede probar completamente creando un Notebook nuevo, seleccionando el tipo "transactions" y verificando que el sistema navega a `notebooks/:id/transactions`.

**Acceptance Scenarios**:

1. **Given** el formulario de creación de Notebook está abierto, **When** el usuario selecciona el tipo "transactions" con el Radio Button y guarda, **Then** el Notebook se crea con `type: 'transactions'` y el usuario es redirigido a `notebooks/:id/transactions`.
2. **Given** el formulario de creación está abierto con tipo "notes" seleccionado por defecto, **When** el usuario no cambia el tipo y guarda, **Then** el Notebook se crea con `type: 'notes'` y el usuario es redirigido a `notebooks/:id/notes`.
3. **Given** un Notebook de tipo "transactions" existe, **When** el usuario navega a su configuración y cambia el tipo a "notes", **Then** el campo se actualiza, las transacciones se preservan en la base de datos, y la navegación redirige a `notebooks/:id/notes`.

---

### User Story 2 - Ver Transacciones por Mes (Priority: P2)

Un usuario con un Notebook de tipo "transactions" activa la vista `'by-month'`. El sistema muestra un selector de mes con navegación anterior/siguiente y lista las transacciones del mes activo. El encabezado muestra el balance total del mes.

**Why this priority**: Es la vista principal y más útil para revisar gastos periódicos, tal como muestra el diseño visual entregado.

**Independent Test**: Se puede probar completamente cambiando el `transactionsViewType` a `'by-month'`, navegando entre meses y verificando que la lista de movimientos y el total cambian correctamente.

**Acceptance Scenarios**:

1. **Given** un Notebook de tipo "transactions" está abierto con `transactionsViewType: 'by-month'`, **When** la vista carga, **Then** se muestra el componente `MonthSelector` con el mes actual y el balance total del mes.
2. **Given** la vista `'by-month'` está activa, **When** el usuario navega al mes anterior, **Then** la lista de movimientos y el balance se actualizan para reflejar ese mes.
3. **Given** la vista `'by-month'` está activa, **When** hay transacciones en el mes, **Then** cada fila muestra: descripción, tag(s) como chips, monto con color según signo (rojo para negativo) y fecha relativa.

---

### User Story 3 - Configurar Vista de Transacciones desde Ajustes (Priority: P3)

Un usuario entra a la página de configuración/edición del Notebook y cambia el `transactionsViewType` a `'all'`. Al volver a la vista de transacciones, el sistema muestra todas las entradas sin filtro de mes.

**Why this priority**: Permite al usuario personalizar la vista predeterminada de su Notebook; la configuración vive en ajustes para no saturar la pantalla principal de transacciones.

**Independent Test**: Se puede probar yendo a la página de edición del Notebook, cambiando `transactionsViewType` a `'all'`, guardando y regresando a la vista de transacciones para verificar que el `MonthSelector` no aparece y se muestra la lista completa.

**Acceptance Scenarios**:

1. **Given** un Notebook de tipo `'transactions'` existe, **When** el usuario abre la página de edición, **Then** ve un selector de Radio Button para `transactionsViewType` con las opciones `'all'` y `'by-month'`.
2. **Given** el usuario cambia `transactionsViewType` a `'all'` en la página de edición y guarda, **When** navega a `notebooks/:id/transactions`, **Then** el `MonthSelector` no aparece y se muestra la lista completa de transacciones con el balance total acumulado.
3. **Given** el usuario cambia `transactionsViewType` a `'by-month'` en la página de edición y guarda, **When** navega a `notebooks/:id/transactions`, **Then** se muestra el `MonthSelector` con el mes actual.

---

### User Story 4 - Acceder al Botón de Creación (Priority: P4)

En la vista de transacciones, el usuario ve un botón de acción flotante ("Crear") que actúa como placeholder funcional. Al presionarlo, el sistema muestra un indicador de que la funcionalidad completa llegará en una iteración futura.

**Why this priority**: Placeholder necesario para mantener la consistencia de la UI y no bloquear la navegación; el flujo completo de creación es fuera de alcance de esta especificación.

**Independent Test**: Se puede probar verificando que el botón FAB aparece en la vista de transacciones y que al presionarlo no rompe la aplicación.

**Acceptance Scenarios**:

1. **Given** la vista `notebooks/:id/transactions` está activa, **When** la vista carga, **Then** se muestra un botón de acción flotante "+" en la esquina inferior derecha.
2. **Given** el botón FAB está visible, **When** el usuario lo presiona, **Then** el sistema responde (ej. toast/snackbar de "Próximamente") sin errores.

---

### Edge Cases

- Si un Notebook de tipo "notes" cambia a "transactions", el sistema redirige correctamente a la vista de transacciones; las notas existentes permanecen en la base de datos pero no se muestran en la vista de transacciones.
- Si un Notebook de tipo "transactions" cambia a "notes", las transacciones se preservan silenciosamente en la base de datos; el frontend redirige a `notebooks/:id/notes` sin advertencia ni pérdida de datos.
- Si el Notebook de tipo "transactions" no tiene ninguna transacción, la lista debe mostrarse vacía con un mensaje informativo (`TransactionEmptyState`).
- Si el usuario navega directamente a `notebooks/:id/transactions` con un Notebook de tipo "notes", el sistema redirige automáticamente a `notebooks/:id/notes`.
- Si el monto de una transacción es exactamente cero, el color del monto debe ser neutral (ni rojo ni verde).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El formulario de creación y edición de Notebook DEBE incluir un campo `type` con opciones `'notes'` y `'transactions'` implementado como Radio Button.
- **FR-002**: El campo `type` DEBE ser editable en la vista de configuración del Notebook.
- **FR-003**: El sistema DEBE navegar condicionalmente basado en `type`: notebooks de tipo `'notes'` dirigen a `notebooks/:id/notes` y los de tipo `'transactions'` a `notebooks/:id/transactions`.
- **FR-004**: La página de edición del Notebook DEBE mostrar un selector de Radio Button para `transactionsViewType` con opciones `'all'` y `'by-month'` cuando el `type` del Notebook es `'transactions'`. Este selector no aparece en la vista principal de transacciones.
- **FR-005**: Si `transactionsViewType` es `'by-month'`, la vista DEBE mostrar el componente `MonthSelector` inicializado en el mes calendar actual, con navegación anterior/siguiente y el balance total del mes seleccionado. Si no hay transacciones en el mes activo, se muestra `TransactionEmptyState`.
- **FR-006**: Si `transactionsViewType` es `'all'`, la vista DEBE mostrar un resumen general con el balance acumulado de todas las transacciones del Notebook.
- **FR-007**: Cada ítem de la lista de transacciones DEBE mostrar: descripción, tags como chips, monto con color según signo (rojo para negativo, verde para positivo, neutro para cero) y fecha relativa.
- **FR-008**: La vista de transacciones DEBE mostrar un botón de acción flotante (FAB) como placeholder funcional para la creación de una nueva transacción.
- **FR-009**: El estado de `transactionsViewType` DEBE persistir en el servidor (campo del Notebook) para sobrevivir navegaciones y recargas de sesión.
- **FR-010**: El selector de tipo DEBE construirse usando el componente `<Radio>` nativo de Framework7, envuelto en un componente `TypeSelector` con estilos CSS Module propios.

### Key Entities

- **Notebook**: Entidad principal con atributos `id`, `name`, `type` (`'notes'` | `'transactions'`). El `type` determina el comportamiento de navegación y las vistas disponibles.
- **Transaction**: Entidad de dato con atributos `id`, `description`, `amount` (numérico con signo), `tags` (lista), `attachments` (lista), `date`.
- **TransactionsViewType**: Enum que define el modo de visualización de un Notebook de transacciones: `'all'` (todas las entradas) o `'by-month'` (filtrado por mes).
- **MonthSelector**: Componente UI que representa el mes seleccionado activo con acciones de navegación anterior/siguiente y muestra el balance del período.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede crear un Notebook de tipo `'transactions'` en menos de 60 segundos sin instrucciones adicionales.
- **SC-002**: La navegación condicional funciona correctamente en el 100% de los casos: notebooks de tipo `'notes'` nunca muestran la vista de transacciones y viceversa.
- **SC-003**: El cambio entre `'by-month'` y `'all'` actualiza la vista visible sin recarga completa de la página.
- **SC-004**: La lista de transacciones diferencia visualmente (por color) los montos positivos y negativos en el 100% de los casos.
- **SC-005**: El campo `type` es editable en la configuración del Notebook y el cambio se refleja en la navegación sin necesidad de reiniciar la aplicación.

## Assumptions

- El backend ya soporta el campo `type` en el modelo de Notebook con valores `'notes'` y `'transactions'`, y el campo `transactionsViewType` con valores `'all'` y `'by-month'` (confirmado en el schema de Mongoose del repositorio hermano).
- Las transacciones son sub-documentos embebidos del Notebook; no existe un endpoint REST dedicado para CRUD de transacciones individuales en este alcance.
- El flujo de creación detallada de una transacción individual está fuera del alcance de esta especificación; el botón FAB es solo un placeholder.
- No existe un componente Radio Button dedicado en el codebase actual; se construirá un componente `TypeSelector` usando el primitivo `<Radio>` de Framework7.
- La moneda y el formato numérico están determinados por los datos del backend; el Frontend solo aplica el color según el signo del valor.
- El tipo por defecto al crear un Notebook nuevo es `'notes'` para mantener compatibilidad con los Notebooks existentes.
- Los Notebooks existentes sin campo `type` se tratarán como tipo `'notes'`.
