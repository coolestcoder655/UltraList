import { WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { isInTauriContext, safeInvoke } from "./databaseService";

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  target?: string;
}

export const logsService = {
  // Get all application logs
  async getLogs(): Promise<LogEntry[]> {
    try {
      return await safeInvoke<LogEntry[]>("get_application_logs");
    } catch (error) {
      console.error("Failed to get logs:", error);
      // Return diagnostic logs instead of assuming web mode
      return [
        {
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: "Application started - attempting to retrieve Tauri logs",
        },
        {
          timestamp: new Date().toISOString(),
          level: "WARN",
          message: `Failed to retrieve Tauri logs: ${error instanceof Error ? error.message : String(error)}`,
        },
        {
          timestamp: new Date().toISOString(),
          level: "INFO",
          message: `Tauri context check: invoke available = ${typeof window !== 'undefined' && typeof (window as any).invoke === 'function'}`,
        },
      ];
    }
  },

  // Open logs in a new window
  async openLogsWindow(): Promise<void> {
    try {
      // Use centralized Tauri context check
      if (!isInTauriContext()) {
        // Fallback for web - open logs in a new browser tab
        const logs = await this.getLogs();
        const logsHtml = this.generateLogsHtml(logs);
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(logsHtml);
          newWindow.document.close();
        }
        return;
      }

      // Create a new Tauri window for logs
      const logsWindow = new WebviewWindow("logs", {
        url: "/logs.html",
        title: "UltraList - Developer Debug Logs",
        width: 1000,
        height: 700,
        resizable: true,
        maximizable: true,
        minimizable: true,
      });

      // Wait for the window to be ready
      await logsWindow.once("tauri://created", () => {
        console.log("Logs window created successfully");
      });

      await logsWindow.once("tauri://error", (e) => {
        console.error("Failed to create logs window:", e);
      });
    } catch (error) {
      console.error("Failed to open logs window:", error);
      // Fallback to alert with logs
      const logs = await this.getLogs();
      const logsText = logs
        .map(log => `[${log.timestamp}] ${log.level}: ${log.message}`)
        .join('\n');
      alert(`Application Logs:\n\n${logsText}`);
    }
  },

  // Generate HTML for logs display
  generateLogsHtml(logs: LogEntry[]): string {
    const logsHtml = logs
      .map(
        (log) => `
        <div class="log-entry log-${log.level.toLowerCase()}">
          <span class="timestamp">${new Date(log.timestamp).toLocaleString()}</span>
          <span class="level">[${log.level}]</span>
          <span class="message">${log.message}</span>
        </div>
      `
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>UltraList - Application Logs</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              margin: 0;
              padding: 20px;
              background-color: #1a1a1a;
              color: #ffffff;
              line-height: 1.4;
            }
            h1 {
              color: #4ade80;
              margin-bottom: 20px;
              font-size: 24px;
            }
            .log-entry {
              margin-bottom: 8px;
              padding: 8px;
              border-radius: 4px;
              font-size: 12px;
              word-wrap: break-word;
            }
            .log-info {
              background-color: rgba(59, 130, 246, 0.1);
              border-left: 3px solid #3b82f6;
            }
            .log-error {
              background-color: rgba(239, 68, 68, 0.1);
              border-left: 3px solid #ef4444;
            }
            .log-warn {
              background-color: rgba(245, 158, 11, 0.1);
              border-left: 3px solid #f59e0b;
            }
            .log-debug {
              background-color: rgba(107, 114, 128, 0.1);
              border-left: 3px solid #6b7280;
            }
            .timestamp {
              color: #9ca3af;
              margin-right: 10px;
            }
            .level {
              font-weight: bold;
              margin-right: 10px;
            }
            .message {
              color: #ffffff;
            }
            .refresh-btn {
              position: fixed;
              top: 20px;
              right: 20px;
              background-color: #3b82f6;
              color: white;
              border: none;
              padding: 10px 20px;
              border-radius: 5px;
              cursor: pointer;
              font-size: 14px;
            }
            .refresh-btn:hover {
              background-color: #2563eb;
            }
          </style>
        </head>
        <body>
          <h1>🚀 UltraList Application Logs</h1>
          <button class="refresh-btn" onclick="location.reload()">Refresh</button>
          <div class="logs-container">
            ${logsHtml}
          </div>
          <script>
            // Auto-scroll to bottom
            window.scrollTo(0, document.body.scrollHeight);
          </script>
        </body>
      </html>
    `;
  },
};
