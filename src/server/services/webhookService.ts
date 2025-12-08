/**
 * Webhook Service
 * Handles sending notifications to external webhooks (e.g., Slack)
 */

const SLACK_WEBHOOK_URL = 'https://workflow.sih.services/webhook/notify-slack-ai-bootcamp';

export interface AccessGrantNotification {
  grantedByUser: {
    name: string;
    email: string;
  };
  grantedToUser: {
    name: string;
    email: string;
  };
  system: {
    name: string;
    description?: string | null;
  };
  tier: {
    name: string;
  };
  instance?: {
    name: string;
  } | null;
  notes?: string | null;
  grantedAt: Date;
}

export const webhookService = {
  /**
   * Send a notification when access is granted
   */
  async notifyAccessGranted(data: AccessGrantNotification): Promise<void> {
    const payload = {
      event: 'access_granted',
      timestamp: data.grantedAt.toISOString(),
      granted_by: {
        name: data.grantedByUser.name,
        email: data.grantedByUser.email,
      },
      granted_to: {
        name: data.grantedToUser.name,
        email: data.grantedToUser.email,
      },
      system: {
        name: data.system.name,
        description: data.system.description || null,
      },
      access_tier: data.tier.name,
      instance: data.instance?.name || null,
      notes: data.notes || null,
      message: formatSlackMessage(data),
    };

    console.log('[Webhook] Sending to:', SLACK_WEBHOOK_URL);
    console.log('[Webhook] Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      console.log('[Webhook] Response status:', response.status);
      console.log('[Webhook] Response body:', responseText);

      if (!response.ok) {
        console.error('[Webhook] Failed to send notification:', response.status, responseText);
      } else {
        console.log('[Webhook] ✅ Access grant notification sent successfully!');
      }
    } catch (error) {
      // Don't throw - webhook failures shouldn't break the main flow
      console.error('[Webhook] ❌ Error sending notification:', error);
    }
  },
};

function formatSlackMessage(data: AccessGrantNotification): string {
  const instanceInfo = data.instance ? ` (${data.instance.name})` : '';
  const notesInfo = data.notes ? `\nNotes: ${data.notes}` : '';
  
  return `🔐 *Access Granted*

*${data.grantedByUser.name}* has granted *${data.grantedToUser.name}* access to:

• *System:* ${data.system.name}${instanceInfo}
• *Access Tier:* ${data.tier.name}
• *User Email:* ${data.grantedToUser.email}${notesInfo}

_Granted at ${data.grantedAt.toLocaleString()}_`;
}

