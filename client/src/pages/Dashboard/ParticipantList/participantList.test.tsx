import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('calls onSelectParticipant with the participant id when a row is clicked', async () => {
    const participants: Participant[] = [
      { user_id: 'a', name: 'Me', icon: '/cat1.svg' },
      { user_id: 'b', name: 'Bob', icon: '/cat2.svg' },
    ];
    const onSelectParticipant = vi.fn();
    const user = userEvent.setup();

    render(
      <ParticipantList
        groupId="g1"
        participants={participants}
        setParticipants={vi.fn()}
        balances={{}}
        onSelectParticipant={onSelectParticipant}
      />
    );

    await user.click(screen.getByText(/Bob \/ Share/));

    expect(onSelectParticipant).toHaveBeenCalledWith('b');
    expect(onSelectParticipant).toHaveBeenCalledTimes(1);
  });

  it('calls onSelectParticipant when a row is activated with the keyboard', async () => {
    const participants: Participant[] = [
      { user_id: 'a', name: 'Me', icon: '/cat1.svg' },
    ];
    const onSelectParticipant = vi.fn();
    const user = userEvent.setup();

    render(
      <ParticipantList
        groupId="g1"
        participants={participants}
        setParticipants={vi.fn()}
        balances={{}}
        onSelectParticipant={onSelectParticipant}
      />
    );

    await user.tab();
    await user.keyboard('{Enter}');

    expect(onSelectParticipant).toHaveBeenCalledWith('a');
  });

  it('does not throw when a row is clicked without an onSelectParticipant handler', async () => {
    const participants: Participant[] = [
      { user_id: 'a', name: 'Me', icon: '/cat1.svg' },
    ];
    const user = userEvent.setup();

    render(
      <ParticipantList groupId="g1" participants={participants} setParticipants={vi.fn()} balances={{}} />
    );

    await user.click(screen.getByText(/Me \/ Share/));
  });
});
