import '../../memory-agent-identity-store.test-fixture'
import { afterEach, expect, it, vi } from 'vitest'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import type * as FsPromises from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { AgentHookServer } from '../../../agent-hook-server'
import { buildBody, postHookEvent } from '../../server.test-fixtures'

const openGate = vi.hoisted((): { held: Promise<void> | undefined } => ({ held: undefined }))

// Stands in for an on-access scan that holds a rollout open for seconds.
vi.mock('node:fs/promises', async (importOriginal) => {
  const actual = await importOriginal<typeof FsPromises>()
  const open: typeof actual.open = async (...args) => {
    await openGate.held
    return actual.open(...args)
  }
  return { ...actual, open, default: { ...actual, open } }
})

const dirs: string[] = []
afterEach(() => {
  openGate.held = undefined
  for (const dir of dirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true })
  }
})

it('answers a Codex hook while its rollout open is stalled, then applies its status', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'agent-hook-codex-reply-'))
  dirs.push(dir)
  const rollout = join(dir, 'rollout-parent.jsonl')
  writeFileSync(
    rollout,
    `${JSON.stringify({ type: 'event_msg', payload: { type: 'task_started', turn_id: 't1' } })}\n`
  )
  let releaseOpen!: () => void
  openGate.held = new Promise((resolve) => {
    releaseOpen = resolve
  })
  const server = new AgentHookServer()
  await server.start({ env: 'production' })
  try {
    const response = await postHookEvent(
      server,
      buildBody({
        hook_event_name: 'UserPromptSubmit',
        session_id: 'root-session',
        turn_id: 't1',
        transcript_path: rollout,
        prompt: 'stalled open'
      }),
      '/hook/codex'
    )
    expect(response.status).toBe(204)
    expect(server.getStatusSnapshot()).toEqual([])

    releaseOpen()
    await vi.waitFor(() =>
      expect(server.getStatusSnapshot()[0]).toMatchObject({
        state: 'working',
        prompt: 'stalled open'
      })
    )
  } finally {
    releaseOpen()
    server.stop()
  }
})
