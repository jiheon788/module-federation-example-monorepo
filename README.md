# module-federation-example-monorepo

![image](https://github.com/jiheon788/module-federation-example-monorepo/assets/90181028/0fce6d85-38ac-4627-910f-f076a1f1b2f6)

위 레포지토리는 vite + react 기반 module federation 예제입니다. `yarnberry monorepo`, `module federation` 구축 가이드와 이슈 해결법을 기록하였습니다.

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

---

## Module Federation 구현 가이드

> Module Federation은 Webpack5에서 추가된 기능이다. 여러 개의 애플리케이션을 따로 빌드한 다음 런타임에 통합하여 하나의 애플리케이션으로 동작하게 한다는 개념이다. 마이크로 프런트엔드의 빌드타임 통합방식은 모노레포를 사용함으로써 가능했지만 결국 여러 패키지를 한 번에 같이 빌드해야 했던 한계가 있었다. 이제는 Module Federation이 등장함으로써 보다 자연스럽게 런타임에 통합할 수 있다.

Module federation은 Webpack5에서 나온 기능이지만 본 레포에서는 vite에서 이 기능을 사용할 수 있도록 구현된 [vite-plugin-federation](https://github.com/originjs/vite-plugin-federation) 플러그인을 사용합니다.

- remote: 원격 앱, 모듈을 내보는 역할
- host: 모듈을 받아서 사용하는 역할

1. remote앱의 원격 모듈 정의

리모트 앱을 빌드하면 remoteEntry.js라는 파일이 생성되며 Expose한 원격 모듈을 호스트 앱에서 로딩할 수 있도록 인터페이스를 정의

```typescript
// packages/remote/vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "remote-app",
      filename: "remoteEntry.js",
      // Modules to expose
      exposes: {
        "./RemotedImage": "./src/components/RemotedImage",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
```

2. Build & Preview
   빌드 후 빌드 파일을 실행하여 링크에 액세스하면 매니페스트 파일이 표시

   e.g. http://localhost:5175/assets/remoteEntry.js

3. host앱에서 원격 모듈에 접근

```typescript
// packages/host/vite.config.ts
export default defineConfig({
  plugins: [
    react(),
    federation({
      name: "host-app",
      remotes: {
        remoteApp: "http://localhost:5175/assets/remoteEntry.js",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
```

4. 원격 모듈 사용

```typescript
import reactLogo from "./assets/react.svg";

const RemotedImage = React.lazy(() => import("remoteApp/RemotedImage"));

function App() {
  return (
    <>
      <h1>Host app</h1>
      <RemotedImage src={reactLogo} />
    </>
  );
}

export default App;
```

#### ⚠️ Overwriting "build" object in vite config in build mode prevents use of top-level await

모듈 내보내기 하는 remote app 빌드시 에러 발생 -> vite.config.ts에 build 설정 추가

[관련 이슈](https://github.com/storybookjs/storybook/issues/22223#issuecomment-1812956474)

```typescript
export default defineConfig({
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext",
    },
  },
  build: {
    target: "esnext",
  },
  // ...
});
```

#### ⚠️ Cannot find module 'remoteApp/\*' or its corresponding type declarations.ts(2307)

TypeScript가 모듈 페더레이션을 통해 불러오는 'remoteApp/ReactLogo' 모듈의 타입 선언을 찾을 수 없다는 것을 의미, 모듈 페더레이션을 통해 불러오는 외부 모듈을 선언해야 한다.

```typescript
// src/vite-env.d.ts
declare module "remoteApp/*";
```
