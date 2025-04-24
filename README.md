# hy-competition

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur) + [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.vscode-typescript-vue-plugin) to make the TypeScript language service aware of `.vue` types.

If the standalone TypeScript plugin doesn't feel fast enough to you, Volar has also implemented a [Take Over Mode](https://github.com/johnsoncodehk/volar/discussions/471#discussioncomment-1361669) that is more performant. You can enable it by the following steps:

1. Disable the built-in TypeScript Extension
    1) Run `Extensions: Show Built-in Extensions` from VSCode's command palette
    2) Find `TypeScript and JavaScript Language Features`, right click and select `Disable (Workspace)`
2. Reload the VSCode window by running `Developer: Reload Window` from the command palette.

## Customize configuration

See [Vite Configuration Reference](https://vitejs.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

### GCLoud
HY-comp
hy-competitions
serviceAccount: service-782030950250@gs-project-accounts.iam.gserviceaccount.com 

Cityhoops
cityhoops-basketball
serviceAccount: service-762961716792@gs-project-accounts.iam.gserviceaccount.com


Export:
gcloud config set project cityhoops-basketball
gcloud firestore export gs://cityhoops-export --database='(default)'

Import
gcloud config set project hy-competitions
gcloud firestore import gs://cityhoops-export/2024-03-19T23:22:29_59009 --database='(default)'


## Publish City Hoops (www.cityhoopspty.com)

### App 
Run `npm run build-only` 
Zip content of `dist` folder

### Publish
Connect to `cityhoopspty.com/cpanel` into files admin.
Navigate to `public_html/app`
Upload and unzip the zip file.

