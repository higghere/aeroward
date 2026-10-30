import { cpcbIngestionJob } from "../ingestion/cpcbIngestionJob.js";
import { sentinelIngestionJob } from "../ingestion/sentinelIngestionJob.js";

class ScheduledTasksManager {
  private timer: NodeJS.Timeout | null = null;
  private isRunning = false;

  start() {
    if (this.isRunning) return;
    this.isRunning = true;

    // Run initial cycle
    this.executeCycle();

    // Schedule 15-minute periodic ingestion cycle matching CAAQMS telemetry updates
    this.timer = setInterval(() => {
      this.executeCycle();
    }, 15 * 60 * 1000);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }

  private async executeCycle() {
    try {
      await Promise.all([
        cpcbIngestionJob.run(),
        sentinelIngestionJob.run(),
      ]);
    } catch (err) {
      console.error("[ScheduledTasks] Ingestion cycle error:", err);
    }
  }
}

export const scheduledTasks = new ScheduledTasksManager();
