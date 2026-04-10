import connectDB from '@/lib/db';
import Notification from '@/models/Notification';

interface CreateNotificationParams {
  memberId: string;
  memberName: string;
  projectId: string;
  projectName: string;
  action: 'created' | 'edited';
  updateId: string;
}

/**
 * Fire-and-forget notification creation.
 * Errors are swallowed so notification failure never breaks the update API.
 */
export async function createNotification(params: CreateNotificationParams): Promise<void> {
  try {
    await connectDB();
    await Notification.create({
      memberName: params.memberName,
      memberId: params.memberId,
      projectName: params.projectName,
      projectId: params.projectId,
      action: params.action,
      updateId: params.updateId,
    });
  } catch (err) {
    console.error('[createNotification] failed:', err);
  }
}
