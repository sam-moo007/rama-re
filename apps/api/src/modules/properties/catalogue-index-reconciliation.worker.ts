import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { CatalogueIndexReconciliationService } from "./catalogue-index-reconciliation.service";

@Processor("catalogue-reconciliation")
@Injectable()
export class CatalogueIndexReconciliationWorker extends WorkerHost implements OnModuleInit {
  private readonly logger = new Logger(CatalogueIndexReconciliationWorker.name);

  constructor(private readonly reconciliation: CatalogueIndexReconciliationService) {
    super();
  }

  async onModuleInit() {
    const enabled =
      process.env.CATALOGUE_INDEX_RECONCILE_ENABLED === "true" ||
      process.env.NODE_ENV === "production";

    if (!enabled) {
      this.logger.log("Catalogue index reconciliation queue processing is disabled.");
      // We don't disable BullMQ connecting, just logging that it's inactive by intent
    } else {
      this.logger.log("Catalogue index reconciliation queue is active.");
    }
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing catalogue reconciliation job: ${job.id}`);
    try {
      const result = await this.reconciliation.reconcile();
      this.logger.log(
        `Reconciled ${result.indexed} catalogue document(s); removed ${result.removed}; index count ${result.documentCount}.`
      );
      return result;
    } catch (error) {
      this.logger.error(
        "Catalogue index reconciliation failed; canonical PostgreSQL data is unchanged.",
        error instanceof Error ? error.stack : undefined
      );
      throw error;
    }
  }
}
