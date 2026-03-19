import { db } from '@/db/client';
import { platformAuditLogs } from '@/db/schema';

export async function logPlatformActivity(params: {
  eventType: string;
  actorUserId?: string | null;
  actorRole?: string | null;
  clinicId?: string | null;
  entityType: string;
  entityId?: string | null;
  action: string;
  summary: string;
  metadata?: any;
}) {
  try {
    await db.insert(platformAuditLogs).values({
      eventType: params.eventType,
      actorUserId: params.actorUserId ?? null,
      actorRole: params.actorRole ?? null,
      clinicId: params.clinicId ?? null,
      entityType: params.entityType,
      entityId: params.entityId ?? null,
      action: params.action,
      summary: params.summary,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
    });
  } catch (error) {
    // Non-blocking error logging
    console.error('[Audit Logger Error] Failed to log activity:', error);
  }
}
