import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";

import { createIdentityVerifier } from "./common/auth/identity.factory";
import { IDENTITY_VERIFIER } from "./common/auth/identity-verifier";
import { RamaIdentityGuard } from "./common/auth/rama-identity.guard";
import { HealthController } from "./health.controller";
import { EvidenceOperationsModule } from "./modules/evidence/evidence-operations.module";
import { IngestionModule } from "./modules/ingestion/ingestion.module";
import { PropertiesModule } from "./modules/properties/properties.module";
import { HouseholdBriefModule } from "./modules/briefs/household-brief.module";
import { ShortlistModule } from "./modules/shortlists/shortlist.module";
import { DecisionCaseModule } from "./modules/decision-cases/decision-case.module";
import { CommunicationsModule } from "./modules/communications/communications.module";
import { AiModule } from "./modules/ai-concierge/ai.module";
import { MapsModule } from "./modules/maps/maps.module";
import { OwnerCareModule } from "./modules/owner-care/owner-care.module";
import { B2bModule } from "./modules/b2b/b2b.module";
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from 'nestjs-throttler-storage-redis';
import { RedisModule } from "./modules/redis/redis.module";

const isTest = process.env.NODE_ENV === 'test';

@Module({
  imports: [
    RedisModule,
    ...(isTest ? [] : [
      ThrottlerModule.forRoot({
        throttlers: [
          { name: 'short', ttl: 1000, limit: 10 },
          { name: 'default', ttl: 60000, limit: 120 },
        ],
        storage: new ThrottlerStorageRedisService(process.env.REDIS_URL || 'redis://localhost:6379'),
      }),
    ]),
    PropertiesModule, EvidenceOperationsModule, IngestionModule, HouseholdBriefModule, ShortlistModule, DecisionCaseModule, CommunicationsModule, MapsModule, OwnerCareModule, AiModule, B2bModule
  ],
  controllers: [HealthController],
  providers: [
    ...(isTest ? [] : [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      }
    ]),
    {
      provide: IDENTITY_VERIFIER,
      useFactory: createIdentityVerifier,
    },
    {
      provide: APP_GUARD,
      useClass: RamaIdentityGuard,
    },
  ],
})
export class AppModule {}
