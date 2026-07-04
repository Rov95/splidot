import request from 'supertest';
import type TestAgent from 'supertest/lib/agent';
import type { Express } from 'express';

let userCounter = 0;

// Registering also starts a session, so the returned agent is authenticated.
export const registerAgent = async (app: Express): Promise<TestAgent> => {
  const agent = request.agent(app);
  await agent.post('/users/register').send({
    email: `user-${++userCounter}@example.com`,
    password: 'correct-horse-battery-staple',
    firstName: 'Test',
    lastName: 'User',
  });
  return agent;
};

interface CreatedGroup {
  group: { group_id: string; name: string | null };
  participants: { user_id: string; name: string }[];
}

export const createGroup = async (
  agent: TestAgent,
  name: string,
  participantNames: string[]
): Promise<CreatedGroup> => {
  const groupRes = await agent.post('/groups').send({ name, participants: participantNames });
  const participantsRes = await agent.get(`/groups/${groupRes.body.group_id}/participants`);
  return { group: groupRes.body, participants: participantsRes.body };
};
