export enum NotificationType {
  NEW_REQUEST = 'newRequest',
  REQUEST_ACCEPTED = 'requestAccepted',
  REQUEST_REJECTED = 'requestRejected',
}

export interface NotificationPayload {
  type: NotificationType;
  message: string;
  requestId: string;
  skillTitle: string;
  user: {
    id: string;
    name: string;
    avatar: string | null;
  };
}
