# Portfolio — Samuel Martinez

Portfolio personal construido con Next.js, TypeScript y Tailwind CSS.

## Editar el contenido

Todo el contenido (nombre, tagline, sobre mí, lenguajes, proyectos y contacto)
vive en un único archivo:

```
lib/data.ts
```

Edita ahí para:

- Cambiar la lista de **lenguajes** (`languages`) por la que realmente domines.
- Sustituir los **proyectos** de ejemplo (`projects`) por los tuyos, con enlaces reales a demo/repo.
- Poner tu **email, GitHub y LinkedIn** reales (`contact`).

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Desplegar en Vercel

1. Sube este proyecto a un repositorio de GitHub/GitLab/Bitbucket.
2. Entra en [vercel.com/new](https://vercel.com/new), importa el repositorio.
3. Vercel detecta automáticamente que es un proyecto Next.js — no requiere configuración adicional.
4. Deploy.

Alternativamente, con la CLI de Vercel:

```bash
npm i -g vercel
vercel
```
