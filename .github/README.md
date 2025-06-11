# CI/CD Workflows

## Docker Publish Workflow

Este workflow publica automáticamente una imagen Docker en GitHub Container Registry (ghcr.io) cuando:

- Se hace push directamente a la rama `main`
- Se aprueba y mergea una Pull Request a la rama `main`

### Funcionamiento

1. Se ejecuta en Ubuntu Latest
2. Verifica que sea un push a main o una PR mergeada a main
3. Hace checkout del código
4. Inicia sesión en GitHub Container Registry
5. Extrae metadatos para etiquetar la imagen
6. Configura Docker Buildx para construcciones optimizadas
7. Construye y publica la imagen con las etiquetas apropiadas

### Variables de entorno

- `EXPO_PUBLIC_API_URL`: URL de la API para la aplicación (se debe configurar como secreto de GitHub)

### Etiquetas generadas

La imagen se etiqueta automáticamente con:

- Número de versión semántico (si existe un tag)
- Nombre de la rama
- SHA del commit
- `latest` para la versión más reciente

### Acceso a la imagen

La imagen se publica en: `ghcr.io/[owner]/[repo-name]`

Para usar la imagen en producción, utiliza:

```
docker pull ghcr.io/[owner]/[repo-name]:latest
```

### Permisos requeridos

El workflow usa el token `GITHUB_TOKEN` automáticamente generado por GitHub Actions, con permisos para:

- `contents: read`: Leer el contenido del repositorio
- `packages: write`: Publicar imágenes en GitHub Packages

### Configuración adicional

Para usar variables de entorno personalizadas durante la construcción, añade los secretos correspondientes en la configuración del repositorio en GitHub.
