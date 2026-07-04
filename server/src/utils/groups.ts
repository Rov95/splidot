import { Group, UserGroup } from '../models';

// Non-owned and nonexistent groups are indistinguishable to the caller (404),
// so group ids can't be probed across accounts.
export const findOwnedGroup = (groupId: string, userId: string): Promise<Group | null> =>
  Group.findOne({ where: { group_id: groupId, created_by: userId } });

export const participantNames = (
  participants: Pick<UserGroup, 'user_id' | 'name'>[]
): Map<string, string | null> => {
  const names = new Map<string, string | null>();
  for (const participant of participants) {
    names.set(participant.user_id, participant.name);
  }
  return names;
};
