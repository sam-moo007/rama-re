import { Injectable, Logger, type OnModuleDestroy, type OnModuleInit } from "@nestjs/common";

import { NotificationDeliveryProcessor } from "./notification-delivery.processor";

@Injectable()
export class NotificationDeliveryWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(NotificationDeliveryWorker.name);
  private timer: NodeJS.Timeout | null = null;
  constructor(private readonly processor: NotificationDeliveryProcessor) {}
  onModuleInit() { void this.run(); this.timer = setInterval(() => void this.run(), 5_000); this.timer.unref(); }
  onModuleDestroy() { if (this.timer) clearInterval(this.timer); }
  async run(now = new Date()) { try { return await this.processor.processDue(now); } catch (error) { this.logger.error("Notification delivery sweep failed; the next interval will retry.", error instanceof Error ? error.stack : undefined); return 0; } }
}
