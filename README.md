# module-federation-example-monorepo

![image](https://github.com/jiheon788/module-federation-example-monorepo/assets/90181028/0fce6d85-38ac-4627-910f-f076a1f1b2f6)

위 레포지토리는 vite + react 기반 module federation 예제입니다. host, remote 두 프로젝트로 이루어진 모노레포에서 module federation 구현하며 발생한 이슈와 가이드를 기록하였습니다.

## YarnBerry Monorepo 구축 가이드

1. Yarn Berry 기반의 모노레포를 생성

```
yarn init -2
```

2. 루트 경로의 `package.json` workspaces 셋팅

```json
{
  "name": "module-federation-example-monorepo",
  "packageManager": "yarn@4.1.0",
  "workspaces": ["packages/*"]
}
```

3. 프로젝트 생성

```bash
mkdir packages
cd packages

# 프로젝트 생성 (본 레포에서는 vite-react-typescript 기반 원격, 호스트 두가지 생성)
yarn create vite --template react-ts
```

4. 의존성 설치

```bash
# root
yarn install
```

5. Project간의 설정 공유

```json
// tsconfig.base.json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}

// packages/*/tsconfig.json
{
  "extends": "../../tsconfig.base.json",
  "include": ["./src"]
}

```

6. scripts 셋팅

```json
// packages/*/package.json

"name": "@monorepo/remote",
"scripts": {
  "dev": "vite --port 5173 --strictPort",
  "build": "tsc && vite build",
  "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
  "preview": "vite preview --port 5173 --strictPort"
},


// ./package.json
"scripts": {
  "dev:remote": "yarn workspace @monorepo/remote dev",
  "build:remote": "yarn workspace @monorepo/remote build",
  "deploy:remote": "yarn workspace @monorepo/remote deploy",
  "dev:host": "yarn workspace @monorepo/host dev",
  "build:host": "yarn workspace @monorepo/host build"
},

```

#### ⚠️ Typescript 에러 해결법

yarn berry는 npm과 모듈을 불러오는 방식이 다르기 때문에 typescript 오류가 발생함

```bash
# 루트 경로
yarn add -D typescript prettier eslint

# vscode 사용시 sdk 설치 (위 커맨드 이후)
yarn dlx @yarnpkg/sdks vscode
```

## Module Federation 구현 가이드
