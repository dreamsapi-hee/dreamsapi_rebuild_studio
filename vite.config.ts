import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/dreamsapi_rebuild_studio/",
  plugins: [react()],
});
