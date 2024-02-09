import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import federation from "@originjs/vite-plugin-federation";

// https://vitejs.dev/config/
export default defineConfig({
  esbuild: {
    target: "es2020",
  },
  plugins: [
    react(),
    federation({
      name: "remote-app",
      filename: "remoteEntry.js",
      // Modules to expose
      exposes: {
        "./ReactLogo": "./src/components/ReactLogo",
      },
      shared: ["react", "react-dom"],
    }),
  ],
});
