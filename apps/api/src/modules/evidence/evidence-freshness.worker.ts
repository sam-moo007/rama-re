import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";

import { EvidenceOperationsService } from "./evidence-operations.service";

@Injectable()
export class EvidenceFreshnessWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EvidenceFreshnessWorker.name);
  private timer: NodeJS.Timeout | null = null;
  private running = false;

  constructor(private readonly service: EvidenceOperationsService) {}

  onModuleInit() {
    const enabled =
      process.env.EVIDENCE_FRESHNESS_ENABLED === "true" ||
      process.env.NODE_ENV === "production";
    if (!enabled) return;

    void this.run();

    const requested = Number(process.env.EVIDENCE_FRESHNESS_INTERVAL_MS ?? 3600000); // 1 hour
    const interval = Number.isFinite(requested) ? Math.max(1000, requested) : 3600000;
    this.timer = setInterval(() => void this.run(), interval);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  async run() {
    if (this.running) return null;
    this.running = true;
    try {
      const expiredCount = await this.service.autoExpireStaleEvidence();
      if (expiredCount > 0) {
        this.logger.log(`Auto-expired ${expiredCount} stale evidence claim(s).`);
      }
      return expiredCount;
    } catch (error) {
      this.logger.error(
        "Evidence freshness auto-expiry failed.",
        error instanceof Error ? error.stack : undefined,
      );
      return null;
    } finally {
      this.running = false;
    }
  }
}
