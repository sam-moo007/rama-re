import { Module } from "@nestjs/common";

import { DecisionCaseModule } from "../decision-cases/decision-case.module";
import { AdvisorMessagesController } from "./advisor-messages.controller";
import { COMMUNICATIONS_REPOSITORY } from "./communications.repository";
import { CommunicationsRetentionWorker } from "./communications-retention.worker";
import { createCommunicationsRepository, createContactCipher, createContactDelivery } from "./communications.factory";
import { CommunicationsService } from "./communications.service";
import { CONTACT_CIPHER } from "./contact-cipher";
import { CONTACT_DELIVERY } from "./contact-delivery.port";
import { ContactProfileService } from "./contact-profile.service";
import { CustomerContactController } from "./customer-contact.controller";
import { CustomerNotificationsController } from "./customer-notifications.controller";
import { NotificationDeliveryProcessor } from "./notification-delivery.processor";
import { NotificationDeliveryWorker } from "./notification-delivery.worker";

@Module({
  imports: [DecisionCaseModule],
  controllers: [CustomerContactController, CustomerNotificationsController, AdvisorMessagesController],
  providers: [
    ContactProfileService, CommunicationsService, CommunicationsRetentionWorker, NotificationDeliveryProcessor, NotificationDeliveryWorker,
    { provide: COMMUNICATIONS_REPOSITORY, useFactory: createCommunicationsRepository },
    { provide: CONTACT_CIPHER, useFactory: createContactCipher },
    { provide: CONTACT_DELIVERY, useFactory: createContactDelivery },
  ],
  exports: [ContactProfileService, CommunicationsService],
})
export class CommunicationsModule {}
