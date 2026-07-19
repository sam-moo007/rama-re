import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";

import { DecisionCaseService } from "./decision-case.service";

@Injectable()
export class DecisionCaseRetentionWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DecisionCaseRetentionWorker.name);
  private timer: NodeJS.Timeout | null = null;

  constructor(private readonly cases: DecisionCaseService) {}

  onModuleInit(): void {
    void this.run();
    this.timer = setInterval(() => void this.run(), this.intervalMs());
    this.timer.unref();
  }

  onModuleDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  async run(now = new Date()): Promise<number> {
    try {
      const purged = await this.cases.purgeExpired(now.toISOString(), 250);
      if (purged > 0) this.logger.log(`Purged ${purged} expired advisor decision case(s).`);
      return purged;
    } catch (error) {
      this.logger.error("Decision-case retention sweep failed; the next interval will retry.", error instanceof Error ? error.stack : undefined);
      return 0;
    }
  }

  private intervalMs(): number {
    const value = Number(process.env.DECISION_CASE_RETENTION_SWEEP_MS ?? 900_000);
    return Number.isInteger(value) && value >= 60_000 && value <= 86_400_000 ? value : 900_000;
  }
}
