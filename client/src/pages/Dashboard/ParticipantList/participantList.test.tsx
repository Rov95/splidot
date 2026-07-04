import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ParticipantList from './participantList';
import { getGroupParticipants } from '../../../services/groupService';
import type { Participant } from '../../../types';

vi.mock('../../../services/groupService');

describe('ParticipantList', () => {
  beforeEach(() => {
    vi.mocked(getGroupParticipants).mockReset();
  });

  it('fetches participants for the group and marks the first as "Me"', async () => {
    vi.mocked(getGroupParticipants).mockResolvedValue([
      { user_id: 'a', name: 'Alice' },
      { user_id: 'b', name: 'Bob' },
    ]);
    const setParticipants = vi.fn();

    render(
      <ParticipantList groupId="g1" participants={[]} setParticipants={setParticipants} balances={{}} />
    );

    await vi.waitFor(() => expect(setParticipants).toHaveBeenCalled());
    const passed = setParticipants.mock.calls[0][0] as Participant[];
    expect(passed[0]).toMatchObject({ user_id: 'a', name: 'Me', icon: '/cat1.svg' });
    expect(passed[1]).toMatchObject({ user_id: 'b', name: 'Bob', icon: '/cat2.svg' });
  });

  it('does not fetch when there is no selected group', () => {
    render(
      <ParticipantList groupId={null} participants={[]} setParticipants={vi.fn()} balances={{}} />
    );
    expect(getGroupParticipants).not.toHaveBeenCalled();
  });

  it('shows an error message when the fetch fails', async () => {
    vi.mocked(getGroupParticipants).mockRejectedValue(new Error('Failed to fetch participants.'));

    render(
      <ParticipantList groupId="g1" participants={[]} setParticipants={vi.fn()} balances={{}} />
    );

    expect(await screen.findByText('Failed to fetch participants.')).toBeInTheDocument();
  });

  it('renders the participants passed in via props with their balances', () => {
    const participants: Participant[] = [
      { user_id: 'a', name: 'Me', icon: '/cat1.svg' },
    ];

    render(
      <ParticipantList
        groupId="g1"
        participants={participants}
        setParticipants={vi.fn()}
        balances={{ a: 40 }}
      />
    );

    expect(screen.getByText(/Me \/ Share: \$40/)).toBeInTheDocument();
  });

  it('shows a zero share for participants without a balance entry', () => {
    const participants: Participant[] = [
      { user_id: 'b', name: 'Bob', icon: '/cat2.svg' },
    ];

    render(
      <ParticipantList groupId="g1" participants={participants} setParticipants={vi.fn()} balances={{}} />
    );

    expect(screen.getByText(/Bob \/ Share: \$0/)).toBeInTheDocument();
  });
});
