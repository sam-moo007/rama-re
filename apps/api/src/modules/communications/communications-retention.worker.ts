import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";

import { CommunicationsService } from "./communications.service";

@Injectable()
export class CommunicationsRetentionWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CommunicationsRetentionWorker.name);
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly communications: CommunicationsService) {}
  onModuleInit() { void this.run(); this.timer = setInterval(() => void this.run(), 900_000); this.timer.unref(); }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async run(now = new Date()) { try { const count = await this.communications.purgeExpired(now.toISOString()); if (count) this.logger.log(`Purged ${count} expired notification(s).`); return count; } catch (error) { this.logger.error("Notification retention sweep failed; the next interval will retry.", error instanceof Error ? error.stack : undefined); return 0; } }
}
