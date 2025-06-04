import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
      return config;
    },
    baseUrl: "http://localhost:8081",
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "webpack",
    },
  },
  env: {
    tsConfig: {
      compilerOptions: {
        moduleResolution: "node16",
        module: "node16",
      },
    },
  },
});
