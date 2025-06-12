import { spawn, ChildProcess } from "child_process";
import * as path from "path";

/**
 * Expo development server management
 */
export class ExpoManager {
  private expoProcess: ChildProcess | null = null;

  async startExpoServer(): Promise<void> {
    console.log("Starting Expo development server...");

    return new Promise((resolve, reject) => {
      const projectRoot = path.resolve(__dirname, "../../../");
      console.log(`Starting Expo in: ${projectRoot}`);

      this.expoProcess = spawn("npx", ["expo", "start", "--clear"], {
        cwd: projectRoot,
        stdio: "pipe",
        detached: false,
      });

      let startupComplete = false;

      this.expoProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("Expo:", output);

        if (
          output.includes("Metro waiting on") ||
          output.includes("Expo DevTools") ||
          (output.includes("›") && output.includes("Press"))
        ) {
          if (!startupComplete) {
            startupComplete = true;
            console.log("Expo server is ready!");

            setTimeout(() => {
              resolve();
            }, 3000);
          }
        }
      });

      this.expoProcess.stderr?.on("data", (data) => {
        console.error("Expo error:", data.toString());
      });

      this.expoProcess.on("error", (error) => {
        console.error("Failed to start Expo:", error);
        reject(error);
      });

      this.expoProcess.on("exit", (code) => {
        console.log(`Expo process exited with code ${code}`);
        if (!startupComplete) {
          reject(
            new Error(`Expo process exited prematurely with code ${code}`),
          );
        }
      });

      setTimeout(() => {
        if (!startupComplete) {
          reject(new Error("Expo server startup timeout"));
        }
      }, 60000);
    });
  }

  async stopExpoServer(): Promise<void> {
    if (this.expoProcess) {
      console.log("Stopping Expo development server...");
      this.expoProcess.kill("SIGTERM");

      await new Promise((resolve) => {
        if (this.expoProcess) {
          this.expoProcess.on("exit", resolve);
          setTimeout(resolve, 5000);
        } else {
          resolve(void 0);
        }
      });

      this.expoProcess = null;
    }
  }

  async openAppInSimulator(): Promise<void> {
    console.log("Opening app in iOS simulator...");

    return new Promise((resolve, reject) => {
      const projectRoot = path.resolve(__dirname, "../../../");

      const openProcess = spawn("npx", ["expo", "start", "--ios"], {
        cwd: projectRoot,
        stdio: "pipe",
      });

      let opened = false;

      openProcess.stdout?.on("data", (data) => {
        const output = data.toString();
        console.log("Expo iOS:", output);

        if (
          output.includes("Opening on iOS") ||
          output.includes("Opened on iOS") ||
          output.includes("simulator")
        ) {
          if (!opened) {
            opened = true;
            setTimeout(() => {
              openProcess.kill();
              resolve();
            }, 8000);
          }
        }
      });

      openProcess.stderr?.on("data", (data) => {
        console.error("Expo iOS error:", data.toString());
      });

      openProcess.on("error", (error) => {
        console.error("Failed to open iOS app:", error);
        reject(error);
      });

      setTimeout(() => {
        if (!opened) {
          openProcess.kill();
          reject(new Error("Failed to open app in simulator within timeout"));
        }
      }, 30000);
    });
  }

  async setupExpoApp(): Promise<void> {
    try {
      await this.startExpoServer();
      await this.openAppInSimulator();
      console.log("Expo app setup completed successfully!");
    } catch (error) {
      console.error("Failed to setup Expo app:", error);
      await this.stopExpoServer();
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    await this.stopExpoServer();
  }
}
