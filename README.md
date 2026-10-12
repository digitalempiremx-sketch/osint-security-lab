# Todo List App

Una aplicación de tareas (to-do list) moderna y fácil de usar con almacenamiento local.

## Características

- ✅ **Crear tareas** con título, descripción y prioridad
- 🎯 **Establecer prioridades** (baja, media, alta)
- ✔️ **Marcar tareas como completadas**
- 📅 **Fechas de vencimiento** (opcional)
- 🗂️ **Filtrar tareas** (todas, activas, completadas)
- 💾 **Almacenamiento local** con SQLite
- 📊 **Estadísticas** en tiempo real
- 🗑️ **Eliminar tareas** individuales o en lote

## Requisitos

- Node.js 18+
- npm o yarn
- Expo CLI
- Un teléfono o emulador (Android/iOS)

## Instalación

```bash
npm install
```

## Ejecutar

### Desarrollo
```bash
npx expo start
```

Luego selecciona:
- `a` para abrir en Android Emulator
- `i` para abrir en iOS Simulator
- `w` para abrir en navegador web
- Escanea el QR con Expo Go en tu teléfono

### Compilar APK (Android)
```bash
eas build --platform android --profile preview
```

### Compilar IPA (iOS)
```bash
eas build --platform ios --profile preview
```

## Estructura

```
osint-security-lab/
├── App.tsx              # Componente principal
├── src/
│   ├── database.ts      # Funciones de base de datos SQLite
│   └── types.ts         # Tipos TypeScript
├── package.json
├── app.json             # Configuración de Expo
└── tsconfig.json
```

## Base de Datos

La app usa **SQLite** para almacenamiento local. Los datos se guardan automáticamente en el dispositivo:

- Tabla `todos`: Almacena todas las tareas
  - `id`: Identificador único
  - `title`: Título de la tarea
  - `description`: Descripción opcional
  - `completed`: Estado (0 = activa, 1 = completada)
  - `priority`: Prioridad (low, medium, high)
  - `dueDate`: Fecha de vencimiento opcional
  - `createdAt`: Fecha de creación
  - `completedAt`: Fecha de finalización

## Uso

1. **Crear tarea**: Presiona "+ Add Task"
2. **Establecer prioridad**: Elige entre baja, media o alta
3. **Marcar como hecha**: Presiona el checkbox
4. **Eliminar**: Presiona el botón de basura
5. **Filtrar**: Usa los botones All, Active, Completed
6. **Limpiar completadas**: Presiona "Clear Completed"

## Desarrollo

### Agregar nuevas funcionalidades

1. Modifica `App.tsx` para la UI
2. Agrega funciones de base de datos en `src/database.ts`
3. Actualiza tipos en `src/types.ts`

### Pruebas

La app usa Expo Testing Library. Ejecuta pruebas con:
```bash
npm test
```

## Licencia

MIT
