import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const repositoryName =
  process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "robotics-portfolio";

const base =
  process.env.GITHUB_ACTIONS === "true" ? `/${repositoryName}/` : "/";

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
  },
});
