import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { InviteScreen } from './invite-screen'
import { WaitingRoom } from './waiting-room'

const copy = {
  group_kicker: 'A night together',
  host_invite_title: '{name}, this is the invite.',
  invite_help: 'Send this invite.',
  continue_as_host: 'Wait here',
  invite_code_label: 'Invite code',
  participant_count: 'In the group: {current}',
  send_whatsapp: 'Send on WhatsApp',
  share_text: '{name} invited you.',
  waiting_title: 'Waiting for your group.',
  waiting_body: 'Invite more people or start choosing.',
  ready_title: 'Your group is ready.',
  start_choosing: 'Start choosing',
  you: 'You',
  empty_seat: 'Empty',
}

vi.mock('./copy-invite-button', () => ({
  CopyInviteButton: () => <button type="button">Copy invite</button>,
}))

vi.mock('./together-mark', () => ({
  TogetherMark: () => <div>Together</div>,
}))

vi.mock('./together-shell', () => ({
  TogetherShell: ({ children }: { children: React.ReactNode }) => (
    <main>{children}</main>
  ),
}))

describe('Together participant UI', () => {
  afterEach(cleanup)

  it('shows only the current participant count on the invite ticket', () => {
    render(
      <InviteScreen
        hostName="Ana"
        inviteCode="ABC123"
        inviteUrl="https://plotwist.app/together/ABC123"
        participantCount={1}
        copy={copy}
        onContinue={vi.fn()}
      />
    )

    expect(screen.getByText('In the group: 1')).toBeTruthy()
    expect(screen.queryByText(/four|\/ 4/i)).toBeNull()
  })

  it('renders participants and one waiting card without exposing capacity', () => {
    render(
      <WaitingRoom
        names={['Ana', 'Ben', 'Cleo']}
        participantIds={['one', 'two', 'three']}
        meId="three"
        ready
        isFull={false}
        copy={copy}
        onStart={vi.fn()}
      />
    )

    expect(screen.getByText('In the group: 3')).toBeTruthy()
    expect(screen.getByText('Ana')).toBeTruthy()
    expect(screen.getByText('Ben')).toBeTruthy()
    expect(screen.getByText('Cleo')).toBeTruthy()
    expect(screen.getByText('Empty')).toBeTruthy()
    expect(screen.getAllByText('Empty')).toHaveLength(1)
    expect(screen.queryByText(/\/ 20/)).toBeNull()
    expect(screen.getByText('You')).toBeTruthy()
    expect(
      screen.getByRole('heading', { name: 'Your group is ready.' })
    ).toBeTruthy()
    expect(screen.queryByText('Ana & Ben')).toBeNull()
  })

  it('does not render a waiting card when the room is full', () => {
    render(
      <WaitingRoom
        names={['Ana', 'Ben']}
        participantIds={['one', 'two']}
        ready
        isFull
        copy={copy}
        onStart={vi.fn()}
      />
    )

    expect(screen.queryByText('Empty')).toBeNull()
    expect(screen.getByText('In the group: 2')).toBeTruthy()
  })
})
