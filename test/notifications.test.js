import { describe, expect, it } from 'vitest';
import reducer, { addNotification, clearNotifications } from '../store/slices/notificationSlice';

describe('notification realtime deduplication', () => {
  it('does not duplicate the same stable socket event', () => {
    const payload = { type: 'message', message: 'New message', conversationId: 'conv-1' };
    const once = reducer(undefined, addNotification(payload));
    const twice = reducer(once, addNotification(payload));
    expect(twice.items).toHaveLength(1);
  });

  it('clears protected cached notification data on logout flow', () => {
    const populated = reducer(undefined, addNotification({ _id: 'n1', message: 'Update' }));
    expect(reducer(populated, clearNotifications()).items).toEqual([]);
  });
});
