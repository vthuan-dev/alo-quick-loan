// Keep Alive Utility - Prevent Render Free Tier from sleeping
class KeepAliveService {
  private intervalId: NodeJS.Timeout | null = null;
  private isActive = false;

  // Start keep-alive ping every 14 minutes
  start() {
    if (this.isActive) return;
    
    this.isActive = true;
    console.log('🔄 Starting keep-alive service...');
    
    // Ping immediately
    this.ping();
    
    // Then ping every 14 minutes (840,000 ms)
    this.intervalId = setInterval(() => {
      this.ping();
    }, 14 * 60 * 1000);
  }

  // Stop keep-alive service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
    console.log('⏹️ Stopped keep-alive service');
  }

  // Ping the server to keep it awake
  private async ping() {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        // Short timeout to avoid hanging
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        console.log('✅ Keep-alive ping successful');
      } else {
        console.log('⚠️ Keep-alive ping failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Keep-alive ping error:', error);
    }
  }

  // Check if service is running
  isRunning() {
    return this.isActive;
  }
}

// Create singleton instance
export const keepAliveService = new KeepAliveService();

// Auto-start in production
if (import.meta.env.PROD) {
  // Start after 1 minute to let app initialize
  setTimeout(() => {
    keepAliveService.start();
  }, 60000);
}

export default keepAliveService;
