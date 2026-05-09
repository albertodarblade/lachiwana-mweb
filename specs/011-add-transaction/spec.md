# Feature Specification: Añadir Transacción a un Notebook

**Feature Branch**: `011-add-transaction`
**Created**: 2026-05-09
**Status**: Draft
**Input**: User description: "The user should be able to add transactions using a two-step flow with tag selection and a transaction form."

## Clarifications

### Session 2026-05-09

- Q: ¿Cómo determina el usuario si la transacción es un gasto o un ingreso, y cómo afecta al monto? → A: Al presionar el FAB "+", aparecen dos botones ("Gasto" / "Ingreso") como primer paso. La selección determina el signo del monto: gasto → negativo (`-`), ingreso → positivo (`+`). El monto que el usuario ingresa es siempre un valor absoluto; el sistema aplica el signo automáticamente.
- Q: ¿Cómo se presentan los dos botones al presionar el FAB? → A: Speed Dial de Framework7 — dos botones flotantes que aparecen encima del FAB al presionarlo. "Gasto" en rojo, "Ingreso" en verde.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Añadir Transacción con Etiquetas (Priority: P1)

Un usuario en la vista de transacciones de un Notebook que tiene etiquetas configuradas presiona el botón "+" (FAB). El FAB se expande mostrando dos botones flotantes apilados: "Gasto" (rojo) e "Ingreso" (verde) al estilo Speed Dial. Tras elegir, aparece el panel de selección de etiquetas. Al confirmar las etiquetas, aparece el formulario de transacción con el monto en foco automático. El usuario ingresa un valor absoluto y el sistema aplica el signo según el tipo seleccionado.

**Why this priority**: Es el flujo principal de creación de transacciones. Representa el 80% de los casos de uso reales.

**Independent Test**: Presionar FAB → elegir "Gasto" → seleccionar una etiqueta → confirmar → ingresar monto → guardar → verificar que la transacción aparece en la lista con monto negativo y la etiqueta asignada.

**Acceptance Scenarios**:

1. **Given** un Notebook de tipo `'transactions'` con etiquetas, **When** el usuario presiona el FAB "+", **Then** el FAB se expande mostrando dos botones Speed Dial: "Gasto" (rojo) e "Ingreso" (verde).
2. **Given** el Speed Dial está expandido, **When** el usuario elige "Gasto" o "Ingreso", **Then** el Speed Dial se cierra y el sistema abre el panel de selección de etiquetas del Notebook.
3. **Given** el panel de etiquetas está abierto, **When** el usuario selecciona una o más etiquetas y presiona "Confirmar", **Then** el panel se cierra y se abre el formulario de transacción con el campo de monto en foco automático.
4. **Given** el formulario está abierto con tipo "Gasto" seleccionado, **When** el usuario ingresa el valor `100`, **Then** el sistema almacena la transacción con monto `-100`.
5. **Given** el formulario está abierto con tipo "Ingreso" seleccionado, **When** el usuario ingresa el valor `100`, **Then** el sistema almacena la transacción con monto `+100`.
6. **Given** el formulario de transacción está abierto, **When** el usuario presiona "Atrás", **Then** regresa al panel de selección de etiquetas con las etiquetas previamente seleccionadas conservadas.
7. **Given** el panel de etiquetas está abierto, **When** el usuario no selecciona ninguna etiqueta y presiona "Confirmar", **Then** el formulario se abre sin etiquetas asignadas.

---

### User Story 2 - Añadir Transacción sin Etiquetas Configuradas (Priority: P2)

Un usuario en la vista de transacciones de un Notebook sin etiquetas presiona el FAB "+". El FAB se expande mostrando los dos botones Speed Dial (Gasto rojo / Ingreso verde). Al elegir, abre directamente el formulario sin panel de etiquetas.

**Why this priority**: Garantiza que el flujo funcione para notebooks sin etiquetas.

**Independent Test**: En Notebook sin etiquetas: presionar FAB → elegir "Gasto" → verificar que el formulario se abre directamente (sin panel de etiquetas) y que al guardar el monto queda negativo.

**Acceptance Scenarios**:

1. **Given** un Notebook de tipo `'transactions'` sin etiquetas, **When** el usuario presiona el FAB "+", **Then** el FAB se expande mostrando los botones Speed Dial "Gasto" (rojo) e "Ingreso" (verde).
2. **Given** el selector de tipo está visible, **When** el usuario elige un tipo, **Then** el formulario de transacción se abre directamente sin panel de etiquetas.
3. **Given** el formulario se abre directamente, **When** el usuario completa el monto y presiona el botón de confirmación, **Then** la transacción se guarda con el signo correcto y sin etiquetas asociadas.

---

### User Story 3 - Seleccionar Fecha de la Transacción (Priority: P3)

Un usuario en el formulario de transacción puede modificar la fecha. Por defecto es el día actual. Al presionar el campo, puede seleccionar una fecha diferente.

**Why this priority**: Permite registrar transacciones pasadas o futuras.

**Independent Test**: Abrir formulario → verificar fecha actual → presionar campo de fecha → seleccionar fecha diferente → guardar → verificar que la transacción tiene la fecha seleccionada.

**Acceptance Scenarios**:

1. **Given** el formulario de transacción está abierto, **When** se carga, **Then** el campo de fecha muestra la fecha actual en formato legible (ej. "9 de mayo de 2026").
2. **Given** el formulario está abierto, **When** el usuario presiona el campo de fecha, **Then** se abre un selector de fecha nativo del dispositivo.
3. **Given** el usuario seleccionó una fecha diferente, **When** confirma la selección, **Then** el campo muestra la nueva fecha y se incluye al guardar.

---

### Edge Cases

- Si el usuario presiona fuera del Speed Dial expandido sin elegir ningún botón, el Speed Dial se colapsa y el flujo de creación no se inicia.
- Si el usuario cierra el panel de etiquetas sin confirmar, regresa al selector de tipo sin perder la selección de tipo.
- Si el usuario cierra el formulario sin guardar, los datos no se persisten.
- Si la red falla al guardar, el sistema muestra un mensaje de error sin perder los datos del formulario.
- El campo de descripción es opcional; la transacción puede guardarse sin ella.
- El usuario siempre ingresa un valor absoluto en el campo de monto; el sistema nunca muestra el signo `-` o `+` en el campo de entrada, pero lo aplica internamente al guardar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: El FAB "+" en la vista de transacciones DEBE comportarse como un Speed Dial: al presionarlo se expande mostrando dos botones flotantes apilados — "Gasto" (color rojo) e "Ingreso" (color verde). Al elegir uno, el Speed Dial se cierra e inicia el flujo correspondiente.
- **FR-002**: La selección del tipo DEBE determinar el signo del monto almacenado: "Gasto" → negativo (`-`), "Ingreso" → positivo (`+`).
- **FR-003**: Tras seleccionar el tipo, si el Notebook tiene etiquetas configuradas, el sistema DEBE mostrar el panel inferior de selección de etiquetas con opción de selección múltiple.
- **FR-004**: Tras seleccionar el tipo, si el Notebook NO tiene etiquetas configuradas, el sistema DEBE abrir directamente el formulario de transacción.
- **FR-005**: El panel de etiquetas DEBE mostrar cada etiqueta con su ícono y nombre, con indicador visual de selección/deselección, y un botón "Confirmar" para avanzar.
- **FR-006**: El formulario de transacción DEBE mostrar: tipo seleccionado (Gasto/Ingreso), etiqueta(s) seleccionada(s) (si aplica), campo de monto con prefijo "Bs." y autofocus, campo de descripción (opcional), campo de fecha con valor predeterminado de hoy.
- **FR-007**: El campo de monto DEBE recibir foco automático al abrirse el formulario.
- **FR-008**: El campo de fecha DEBE mostrar la fecha actual por defecto y permitir seleccionar una fecha diferente mediante un selector nativo.
- **FR-009**: El formulario DEBE incluir un botón de confirmación cuya etiqueta refleja el tipo: "Añadir Gasto" para gastos, "Añadir Ingreso" para ingresos.
- **FR-010**: Desde el formulario, el usuario DEBE poder regresar al panel de etiquetas conservando las etiquetas seleccionadas. Desde el panel de etiquetas, el usuario DEBE poder regresar al selector de tipo.
- **FR-011**: Al guardar exitosamente, el sistema DEBE cerrar el flujo y actualizar la lista de transacciones inmediatamente.
- **FR-012**: Si ocurre un error al guardar, el sistema DEBE mostrar un mensaje de error sin perder los datos ingresados.

### Key Entities

- **Transaction**: Entidad creada por este flujo con atributos: `amount` (número con signo, negativo para gastos, positivo para ingresos), `description` (texto opcional), `date` (fecha), `tags` (lista, puede estar vacía), `type` (`'expense'` | `'income'`).
- **Tag**: Etiqueta del Notebook con `title` e `icon`. Usada para categorizar la transacción.
- **TransactionType**: Enum que representa el tipo de transacción: `'expense'` (gasto, monto negativo) o `'income'` (ingreso, monto positivo).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario puede completar la creación de una transacción en menos de 30 segundos desde el toque del FAB hasta la confirmación.
- **SC-002**: El flujo de tres pasos (tipo → etiquetas → formulario) funciona sin errores en el 100% de los casos cuando el notebook tiene etiquetas.
- **SC-003**: El flujo de dos pasos (tipo → formulario) funciona sin errores en el 100% de los casos cuando el notebook no tiene etiquetas.
- **SC-004**: La nueva transacción aparece en la lista inmediatamente después de guardar, con el signo correcto según el tipo seleccionado.
- **SC-005**: La navegación de retroceso conserva el estado de cada paso en el 100% de los casos.

## Assumptions

- El backend expone un endpoint para crear transacciones dentro de un Notebook; el payload incluye `amount` (con signo), `description`, `date`, y `tags`.
- Las etiquetas mostradas en el panel son las etiquetas del Notebook (`notebook.tags`), no etiquetas globales.
- El selector de fecha usa el componente nativo del dispositivo.
- El flujo completo se implementa mediante paneles inferiores (sheets) o popups de Framework7, no como páginas separadas.
- La descripción es texto libre sin formato especial.
- El formato de monto es numérico simple; "Bs." es un prefijo visual fijo. El usuario ingresa siempre un valor absoluto.
- El campo `type` en la entidad Transaction puede ser redundante con el signo del monto, pero se almacena para facilitar filtros futuros.
