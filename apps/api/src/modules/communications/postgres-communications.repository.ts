import type { ContactProfileEvent, NotificationPreferences } from "@rama/contracts";
import type { OnModuleDestroy } from "@nestjs/common";
import type { Pool, PoolClient } from "pg";

import { CommunicationsConflictError, type CommunicationsRepository, type NotificationDeliveryJob, type ProtectedContactPoint, type ProtectedContactProfile, type ProtectedNotification } from "./communications.repository";

type ContactRow = { id: string; owner_subject: string; version: number; locale: "en" | "ar"; email_encrypted: string | null; email_masked: string | null; email_status: ProtectedContactPoint["status"] | null; email_verification_hash: string | null; email_verification_expires_at: Date | null; email_verification_attempts: number | null; email_verification_requested_at: Date | null; email_verified_at: Date | null; phone_encrypted: string | null; phone_masked: string | null; phone_status: ProtectedContactPoint["status"] | null; phone_verification_hash: string | null; phone_verification_expires_at: Date | null; phone_verification_attempts: number | null; phone_verification_requested_at: Date | null; phone_verified_at: Date | null; preferences: NotificationPreferences; created_at: Date; updated_at: Date };
type EventRow = { id: string; action: ContactProfileEvent["action"]; version: number; channel: "email" | "sms" | null; created_at: Date };
type NotificationRow = { id: string; case_id: string; owner_subject: string; advisor_subject: string; case_version: number; version: number; template: ProtectedNotification["template"]; requested_channel: ProtectedNotification["requestedChannel"]; delivered_channel: ProtectedNotification["deliveredChannel"]; status: ProtectedNotification["status"]; delivery_reason: ProtectedNotification["deliveryReason"]; created_at: Date; read_at: Date | null; retention_until: Date };
type DeliveryRow = { notification_id:string;status:NotificationDeliveryJob["status"];attempt_count:number;next_attempt_at:Date;locked_at:Date|null;last_error:string|null;created_at:Date;updated_at:Date };

export class PostgresCommunicationsRepository implements CommunicationsRepository, OnModuleDestroy {
  constructor(private readonly pool: Pool) {}
  async checkConnection() { await this.pool.query("SELECT 1"); }
  async onModuleDestroy() { await this.pool.end(); }

  async findContactByOwner(ownerSubject: string): Promise<ProtectedContactProfile | null> {
    const result = await this.pool.query<ContactRow>("SELECT * FROM protected_contact_profiles WHERE owner_subject = $1", [ownerSubject]);
    return result.rows[0] ? this.hydrateContact(this.pool, result.rows[0]) : null;
  }

  async saveContact(profile: ProtectedContactProfile, expectedVersion: number | null): Promise<ProtectedContactProfile> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const current = await client.query<{ version: number }>("SELECT version FROM protected_contact_profiles WHERE owner_subject = $1 FOR UPDATE", [profile.ownerSubject]);
      const currentVersion = current.rows[0]?.version ?? null;
      if (currentVersion !== expectedVersion || profile.version !== (expectedVersion ?? 0) + 1) throw new CommunicationsConflictError(profile.id, expectedVersion, currentVersion);
      const values = this.contactValues(profile);
      if (expectedVersion === null) {
        await client.query(`INSERT INTO protected_contact_profiles (
          id,owner_subject,version,locale,email_encrypted,email_masked,email_status,email_verification_hash,email_verification_expires_at,email_verification_attempts,email_verification_requested_at,email_verified_at,
          phone_encrypted,phone_masked,phone_status,phone_verification_hash,phone_verification_expires_at,phone_verification_attempts,phone_verification_requested_at,phone_verified_at,preferences,created_at,updated_at
        ) VALUES (${values.map((_value, index) => `$${index + 1}`).join(",")})`, values);
      } else {
        const updated = await client.query(`UPDATE protected_contact_profiles SET version=$3,locale=$4,email_encrypted=$5,email_masked=$6,email_status=$7,email_verification_hash=$8,email_verification_expires_at=$9,email_verification_attempts=$10,email_verification_requested_at=$11,email_verified_at=$12,
          phone_encrypted=$13,phone_masked=$14,phone_status=$15,phone_verification_hash=$16,phone_verification_expires_at=$17,phone_verification_attempts=$18,phone_verification_requested_at=$19,phone_verified_at=$20,preferences=$21,updated_at=$23
          WHERE id=$1 AND owner_subject=$2 AND version=$24`, [...values, expectedVersion]);
        if (updated.rowCount !== 1) throw new CommunicationsConflictError(profile.id, expectedVersion, currentVersion);
      }
      const event = profile.auditTrail.at(-1)!;
      await client.query("INSERT INTO contact_profile_events (id,profile_id,action,version,channel,created_at) VALUES ($1,$2,$3,$4,$5,$6)", [event.id, profile.id, event.action, event.version, event.channel, event.createdAt]);
      await client.query("COMMIT");
      return structuredClone(profile);
    } catch (error) { await client.query("ROLLBACK"); throw error; }
    finally { client.release(); }
  }

  async findNotification(id: string): Promise<ProtectedNotification | null> {
    const result = await this.pool.query<NotificationRow>("SELECT * FROM customer_notifications WHERE id = $1", [id]);
    return result.rows[0] ? this.notification(result.rows[0]) : null;
  }

  async listNotificationsByOwner(ownerSubject: string): Promise<ProtectedNotification[]> {
    const result = await this.pool.query<NotificationRow>("SELECT * FROM customer_notifications WHERE owner_subject = $1 ORDER BY created_at DESC", [ownerSubject]);
    return result.rows.map((row) => this.notification(row));
  }

  async saveNotification(item: ProtectedNotification, expectedVersion: number | null): Promise<ProtectedNotification> {
    if (expectedVersion === null) {
      await this.pool.query(`INSERT INTO customer_notifications (id,case_id,owner_subject,advisor_subject,case_version,version,template,requested_channel,delivered_channel,status,delivery_reason,created_at,read_at,retention_until)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`, [item.id,item.caseId,item.ownerSubject,item.advisorSubject,item.caseVersion,item.version,item.template,item.requestedChannel,item.deliveredChannel,item.status,item.deliveryReason,item.createdAt,item.readAt,item.retentionUntil]);
    } else {
      const updated = await this.pool.query("UPDATE customer_notifications SET version=$1,read_at=$2 WHERE id=$3 AND owner_subject=$4 AND version=$5", [item.version,item.readAt,item.id,item.ownerSubject,expectedVersion]);
      if (updated.rowCount !== 1) { const current = await this.pool.query<{version:number}>("SELECT version FROM customer_notifications WHERE id=$1",[item.id]); throw new CommunicationsConflictError(item.id,expectedVersion,current.rows[0]?.version??null); }
    }
    return structuredClone(item);
  }

  async enqueueNotification(item: ProtectedNotification, job: NotificationDeliveryJob | null): Promise<ProtectedNotification> {
    const client=await this.pool.connect();
    try { await client.query("BEGIN");
      await client.query(`INSERT INTO customer_notifications (id,case_id,owner_subject,advisor_subject,case_version,version,template,requested_channel,delivered_channel,status,delivery_reason,created_at,read_at,retention_until)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,[item.id,item.caseId,item.ownerSubject,item.advisorSubject,item.caseVersion,item.version,item.template,item.requestedChannel,item.deliveredChannel,item.status,item.deliveryReason,item.createdAt,item.readAt,item.retentionUntil]);
      if(job)await client.query(`INSERT INTO notification_delivery_outbox (notification_id,status,attempt_count,next_attempt_at,locked_at,last_error,created_at,updated_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,this.deliveryValues(job));
      await client.query("COMMIT"); return structuredClone(item);
    } catch(error){await client.query("ROLLBACK");throw error} finally{client.release()}
  }

  async claimDeliveryJob(notificationId:string,now:string,staleBefore:string):Promise<NotificationDeliveryJob|null>{
    const result=await this.pool.query<DeliveryRow>(`UPDATE notification_delivery_outbox SET status='processing',locked_at=$2,updated_at=$2 WHERE notification_id=$1 AND (((status='pending' OR status='retry_pending') AND next_attempt_at <= $2) OR (status='processing' AND locked_at <= $3)) RETURNING *`,[notificationId,now,staleBefore]);
    return result.rows[0]?this.deliveryJob(result.rows[0]):null;
  }

  async claimDueDeliveryJobs(now:string,staleBefore:string,limit:number):Promise<NotificationDeliveryJob[]>{
    const client=await this.pool.connect();try{await client.query("BEGIN");
      const selected=await client.query<{notification_id:string}>(`SELECT notification_id FROM notification_delivery_outbox WHERE (((status='pending' OR status='retry_pending') AND next_attempt_at <= $1) OR (status='processing' AND locked_at <= $2)) ORDER BY next_attempt_at LIMIT $3 FOR UPDATE SKIP LOCKED`,[now,staleBefore,limit]);
      if(!selected.rows.length){await client.query("COMMIT");return []} const ids=selected.rows.map((row)=>row.notification_id); const placeholders=ids.map((_id,index)=>`$${index+2}`).join(",");
      const claimed=await client.query<DeliveryRow>(`UPDATE notification_delivery_outbox SET status='processing',locked_at=$1,updated_at=$1 WHERE notification_id IN (${placeholders}) RETURNING *`,[now,...ids]);
      await client.query("COMMIT");return claimed.rows.map((row)=>this.deliveryJob(row));
    }catch(error){await client.query("ROLLBACK");throw error}finally{client.release()}
  }

  async settleDeliveryJob(job:NotificationDeliveryJob,item:ProtectedNotification,expectedNotificationVersion:number):Promise<ProtectedNotification>{
    const client=await this.pool.connect();try{await client.query("BEGIN");
      const updated=await client.query(`UPDATE customer_notifications SET version=$1,delivered_channel=$2,status=$3,delivery_reason=$4 WHERE id=$5 AND version=$6`,[item.version,item.deliveredChannel,item.status,item.deliveryReason,item.id,expectedNotificationVersion]);
      if(updated.rowCount!==1)throw new CommunicationsConflictError(item.id,expectedNotificationVersion,null);
      const settled=await client.query(`UPDATE notification_delivery_outbox SET status=$1,attempt_count=$2,next_attempt_at=$3,locked_at=$4,last_error=$5,updated_at=$6 WHERE notification_id=$7 AND status='processing'`,[job.status,job.attemptCount,job.nextAttemptAt,job.lockedAt,job.lastError,job.updatedAt,job.notificationId]);
      if(settled.rowCount!==1)throw new CommunicationsConflictError(item.id,expectedNotificationVersion,expectedNotificationVersion);
      await client.query("COMMIT");return structuredClone(item);
    }catch(error){await client.query("ROLLBACK");throw error}finally{client.release()}
  }

  async findDeliveryJob(notificationId:string):Promise<NotificationDeliveryJob|null>{const result=await this.pool.query<DeliveryRow>("SELECT * FROM notification_delivery_outbox WHERE notification_id=$1",[notificationId]);return result.rows[0]?this.deliveryJob(result.rows[0]):null}

  async purgeExpiredNotifications(before: string, limit: number): Promise<number> {
    const result = await this.pool.query<{ id: string }>("SELECT id FROM customer_notifications WHERE retention_until <= $1 ORDER BY retention_until LIMIT $2", [before, limit]);
    const ids = result.rows.map((row) => row.id); if (!ids.length) return 0;
    const placeholders = ids.map((_id,index)=>`$${index+1}`).join(",");
    await this.pool.query(`DELETE FROM customer_notifications WHERE id IN (${placeholders})`, ids);
    return ids.length;
  }

  private async hydrateContact(queryable: Pick<Pool|PoolClient,"query">, row: ContactRow): Promise<ProtectedContactProfile> {
    const events = await queryable.query<EventRow>("SELECT id,action,version,channel,created_at FROM contact_profile_events WHERE profile_id=$1 ORDER BY version",[row.id]);
    return { id:row.id,ownerSubject:row.owner_subject,version:row.version,locale:row.locale,email:this.point(row,"email"),phone:this.point(row,"phone"),preferences:row.preferences,createdAt:row.created_at.toISOString(),updatedAt:row.updated_at.toISOString(),auditTrail:events.rows.map((event)=>({id:event.id,action:event.action,version:event.version,channel:event.channel,createdAt:event.created_at.toISOString()})) };
  }

  private point(row: ContactRow, prefix: "email"|"phone"): ProtectedContactPoint|null {
    const encrypted=prefix==="email"?row.email_encrypted:row.phone_encrypted; if(!encrypted)return null;
    return { encryptedValue:encrypted,masked:(prefix==="email"?row.email_masked:row.phone_masked)!,status:(prefix==="email"?row.email_status:row.phone_status)!,verificationCodeHash:prefix==="email"?row.email_verification_hash:row.phone_verification_hash,verificationExpiresAt:(prefix==="email"?row.email_verification_expires_at:row.phone_verification_expires_at)?.toISOString()??null,verificationAttempts:(prefix==="email"?row.email_verification_attempts:row.phone_verification_attempts)??0,verificationRequestedAt:(prefix==="email"?row.email_verification_requested_at:row.phone_verification_requested_at)?.toISOString()??null,verifiedAt:(prefix==="email"?row.email_verified_at:row.phone_verified_at)?.toISOString()??null };
  }

  private contactValues(profile: ProtectedContactProfile): unknown[] { const p=(point:ProtectedContactPoint|null)=>[point?.encryptedValue??null,point?.masked??null,point?.status??null,point?.verificationCodeHash??null,point?.verificationExpiresAt??null,point?.verificationAttempts??null,point?.verificationRequestedAt??null,point?.verifiedAt??null]; return [profile.id,profile.ownerSubject,profile.version,profile.locale,...p(profile.email),...p(profile.phone),profile.preferences,profile.createdAt,profile.updatedAt]; }
  private notification(row: NotificationRow): ProtectedNotification { return { id:row.id,caseId:row.case_id,ownerSubject:row.owner_subject,advisorSubject:row.advisor_subject,caseVersion:row.case_version,version:row.version,template:row.template,requestedChannel:row.requested_channel,deliveredChannel:row.delivered_channel,status:row.status,deliveryReason:row.delivery_reason,createdAt:row.created_at.toISOString(),readAt:row.read_at?.toISOString()??null,retentionUntil:row.retention_until.toISOString() }; }
  private deliveryValues(job:NotificationDeliveryJob){return [job.notificationId,job.status,job.attemptCount,job.nextAttemptAt,job.lockedAt,job.lastError,job.createdAt,job.updatedAt]}
  private deliveryJob(row:DeliveryRow):NotificationDeliveryJob{return{notificationId:row.notification_id,status:row.status,attemptCount:row.attempt_count,nextAttemptAt:row.next_attempt_at.toISOString(),lockedAt:row.locked_at?.toISOString()??null,lastError:row.last_error,createdAt:row.created_at.toISOString(),updatedAt:row.updated_at.toISOString()}}
}
