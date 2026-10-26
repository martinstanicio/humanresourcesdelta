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

Dentro del `package.json` se encuentran definidos algunos scripts útiles para interactuar con la aplicación, como `start`, `lint` y `format`.

```sh
npm run format
```

## Gestión de componentes

El CLI de Spartan permite agregar componentes al proyecto mediante un comando simple, que instala las dependencias necesarias y genera los archivos correspondientes.

```sh
ng g @spartan-ng/cli:ui
```

## Acceso al cliente

Aunque el servicio del cliente se ejecuta en el puerto `4200` dentro de la red privada de Docker, **el único puerto expuesto hacia el host es el puerto 80** a través del reverse proxy.

Por lo tanto, la aplicación web está disponible en [http://localhost](http://localhost), no en [http://localhost:4200](http://localhost:4200).
