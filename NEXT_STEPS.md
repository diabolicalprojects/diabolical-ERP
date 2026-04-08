# Próximos Pasos - Plan de Acción Post-Auditoría Funcional

Tras la auditoría inicial de cumplimiento vs. especificaciones, se han identificado brechas críticas que requieren atención inmediata para llevar el ERP "Diabolical" a un estado de producción real y confiable.

## 1. Integración de Documentación (Prioridad Máxima)
- **Acción:** Crear la carpeta `/docs` en la raíz del proyecto.
- **Detalle:** Subir los archivos `.md` originales de requerimientos, reglas de negocio y flujos de usuario.
- **Razón:** Sin estos documentos, el equipo de QA no puede certificar que el software hace lo que el negocio exige.

## 2. Refuerzo de Lógica Financiera
- **Acción:** Corregir el manejo de sobrepagos en el endpoint de abonos a facturas (`/api/receivables/:id/pay`).
- **Detalle:** Implementar validaciones que impidan abonar más del saldo pendiente o que redirijan el excedente a una cuenta de saldo a favor.
- **Razón:** Evitar descuadres contables y errores en el flujo de caja.

## 3. Automatización de Inventario y Compras
- **Acción:** Sincronizar la recepción de compras con el stock físico.
- **Detalle:** Modificar el endpoint de recepción de órdenes de compra para que actualice automáticamente las cantidades en la tabla `inventory`.
- **Razón:** Actualmente la recepción de mercancía es solo un cambio de estado visual y no afecta la disponibilidad real de productos.

## 4. Implementación de Logs de Auditoría
- **Acción:** Crear un middleware de trazabilidad.
- **Detalle:** Registrar todas las mutaciones (POST, PUT, PATCH, DELETE) en una tabla centralizada indicando: Usuario, Acción, Recurso y Timestamp.
- **Razón:** Cumplir con estándares de seguridad y permitir la reconstrucción de eventos en caso de errores o fraudes.

## 5. Pruebas de Estrés y Casos Borde
- **Acción:** Ejecutar auditoría de concurrencia.
- **Detalle:** Validar que procesos simultáneos (ej. dos vendedores vendiendo el último artículo al mismo tiempo) no generen stock negativo o inconsistencias.

---
**Responsable:** Lead Developer / Architect  
**Fecha de Revisión Sugerida:** Inmediata a la carga de documentación.
