import { AuthActions } from "./AuthActions";
import { DebugHelpers } from "./DebugHelpers";

export class AppiumHelper extends AuthActions {
  protected debugUtils = new DebugHelpers(); // Changed from debugHelpers to avoid conflict

  async getAccessibleElements(): Promise<string[]> {
    return this.debugUtils.getAccessibleElements();
  }

  async waitForLoadingToDisappear(timeout: number = 30000): Promise<void> {
    return this.debugUtils.waitForLoadingToDisappear(timeout);
  }

  // Driver availability check
  isDriverAvailable(): boolean {
    return this.driver !== null;
  }
}
