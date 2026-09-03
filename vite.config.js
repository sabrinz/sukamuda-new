import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  plugins: [react()],

  // Situs dipasang langsung pada domain utama.
  base: "/",

  server: {
    port: 5174,
    host: "127.0.0.1",

    // Proxy ini hanya digunakan saat npm run dev.
    proxy: {
      "/api": {
        target: "https://sukamuda.co.id",
        changeOrigin: true,
        secure: true,
      },

      "/storage": {
        target: "https://sukamuda.co.id",
        changeOrigin: true,
        secure: true,
      },

      "/sanctum": {
        target: "https://sukamuda.co.id",
        changeOrigin: true,
        secure: true,
      },
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "esbuild",
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1000,

    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (
            id.includes("@react-three") ||
            id.includes("/three/")
          ) {
            return "vendor-three";
          }

          if (id.includes("recharts")) {
            return "vendor-recharts";
          }

          if (id.includes("quill")) {
            return "vendor-quill";
          }

          if (id.includes("framer-motion")) {
            return "vendor-motion";
          }

          return undefined;
        },
      },
    },
  },

  preview: {
    port: 4173,
    host: "127.0.0.1",
  },
});