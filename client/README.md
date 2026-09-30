# Cliente SPA (Angular)

## Instalación de dependencias

Luego de clonar el proyecto, instalar las dependencias utilizando `npm`.

```sh
npm install
```

> [!note]
> Los comando no deben ejecutarse en la raíz del proyecto, sino dentro de la carpeta `client/`, que es donde está el archivo de configuración `package.json` y el proyecto de Angular.
>
> ```sh
> cd client/
> ```

## Scripts

Dentro del `package.json` se encuentran definidos algunos scripts útiles para interactuar con la aplicación, como `start`, `test` y `format`.

```sh
npm run format
```

## Generación de código

El CLI de Angular incluye potentes herramientas de generación de código, que nos permiten crear componentes, servicios, etc.

```sh
ng generate component component-name
```

> [!note]
> Para una lista completa de esquemas disponibles (como `components`, `directives` o `pipes`), ejecuta:
>
> ```sh
> ng generate --help
> ```
