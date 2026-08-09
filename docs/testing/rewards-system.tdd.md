# Sistema de puntos - evidencia TDD

## Origen

Las historias y criterios se definieron durante esta implementación, sin un archivo de plan externo.

## Historias de usuario

- Como usuario, quiero recibir 5 puntos al completar una tarea para desbloquear personalizaciones.
- Como usuario, quiero recibir 2 puntos al completar una sesión Pomodoro válida.
- Como usuario, quiero que el máximo mensual sea 100 y que mi saldo acumulado no se reinicie.
- Como sistema, quiero procesar cada tarea o sesión una sola vez aunque la solicitud se repita.

## Evidencia RED y GREEN

| Comportamiento | RED observado | GREEN observado |
|---|---|---|
| Reglas y resumen mensual | `nx test ...rewards.service.spec.ts`: módulos de Rewards inexistentes | Suite de Rewards aprobada |
| Integración con tareas y Pomodoro | constructores y propiedad `reward` inexistentes | Respuestas compatibles con `reward` y reintento aprobado |
| Límite e idempotencia | repositorio Prisma inexistente | Lock transaccional, recorte y origen único aprobados |

## Especificación de pruebas

| # | Garantía | Archivo | Tipo | Resultado |
|---|---|---|---|---|
| 1 | Una tarea genera 5 puntos y usa el mes de la zona horaria del usuario | `rewards.service.spec.ts` | Unidad | PASS |
| 2 | Una sesión elegible genera 2 puntos | `rewards.service.spec.ts` | Unidad | PASS |
| 3 | Sesiones menores a 15 minutos, activas o con pausa efectiva insuficiente no generan puntos | `rewards.service.spec.ts` | Unidad | PASS |
| 4 | El saldo informa límite y puntos mensuales restantes sin valores negativos | `rewards.service.spec.ts` | Unidad | PASS |
| 5 | El repositorio serializa premios por usuario | `prisma-points.repository.spec.ts` | Unidad de infraestructura | PASS |
| 6 | Una recompensa se recorta al alcanzar 100 puntos mensuales | `prisma-points.repository.spec.ts` | Unidad de infraestructura | PASS |
| 7 | Un origen procesado no puede generar una segunda transacción | `prisma-points.repository.spec.ts` | Unidad de infraestructura | PASS |
| 8 | Completar una tarea devuelve la recompensa sin duplicar notificaciones | `complete-task.usecase.spec.ts` | Integración de servicios | PASS |
| 9 | Repetir la finalización de Pomodoro recupera la sesión y no duplica la recompensa | `pomodoro.service.spec.ts` | Integración de servicios | PASS |
| 10 | El endpoint de resumen utiliza el usuario autenticado | `rewards.controller.spec.ts` | Unidad de API | PASS |

## Validación final

- Suite completa: `npx nx test cleanmindapi --runInBand --coverage`
- Resultado final: 33 suites y 93 pruebas aprobadas.
- Cobertura de `src/app/rewards/**/*.ts`:
  - Sentencias: 90,9%
  - Ramas: 87,5%
  - Funciones: 100%
  - Líneas: 92,3%
- Lint: sin errores; permanecen 22 advertencias preexistentes fuera de Rewards.
- Build: compilación Webpack aprobada.

## Brecha conocida

La concurrencia se valida mediante el contrato del repositorio, el advisory lock y el índice único. La migración todavía debe aplicarse en PostgreSQL antes de probar dos escrituras simultáneas contra una base real.
