import { defineFixture } from '../../../component-fixtures/component-fixture'
import type { ProjectHostSetupOption } from '@/lib/workspace/creation/project-host-setup-options'
import RunTargetCombobox from './RunTargetCombobox'

// Shape produced by buildProjectHostSetupOptions with local + ephemeral VM setups and SSH hosts:
// the VM is dropped entirely, SSH hosts become needs-setup rows.
const options: ProjectHostSetupOption[] = [
  {
    id: 'mac',
    kind: 'ready',
    projectId: 'p',
    hostId: 'local',
    repoId: 'mac',
    label: 'Local Mac',
    detail: 'desktop-app',
    path: '/private/tmp/orca-38669/desktop-app'
  },
  ...['devbox', 'gpu-box', 'staging', 'bastion', 'build-01', 'build-02', 'pi'].map(
    (name): ProjectHostSetupOption => ({
      id: `needs-setup:ssh:${name}`,
      kind: 'needs-setup',
      projectId: 'p',
      hostId: `ssh:${name}`,
      label: name,
      detail: 'Project location not set',
      isAvailable: true,
      attention: false,
      canSetLocation: true,
      canCreateProject: false
    })
  )
]

function Preview({ vmSelected }: { vmSelected: boolean }): React.JSX.Element {
  return (
    <div className="h-[460px] p-4">
      <RunTargetCombobox
        hostOptions={options}
        hostValue={vmSelected ? 'vm' : 'mac'}
        hostExecutionHostId={vmSelected ? 'runtime:vm-1' : 'local'}
        onHostChange={() => {}}
        recipes={[]}
        recipeValue={null}
        onAddSshHost={() => {}}
        onAddRemoteServer={() => {}}
        onConnectHost={async () => {}}
        onSetLocation={() => {}}
      />
    </div>
  )
}

const hostLocalOptions: ProjectHostSetupOption[] = [
  {
    id: 'local',
    kind: 'ready',
    projectId: 'repo:test',
    hostId: 'local',
    repoId: 'test',
    label: 'MacBook Pro',
    detail: 'test',
    path: '/Users/alice/orca/projects/test'
  },
  {
    id: 'needs-setup:runtime:rabisu',
    kind: 'needs-setup',
    projectId: 'repo:test',
    hostId: 'runtime:rabisu',
    label: 'rabisu ny',
    detail: 'This project has no Git remote',
    isAvailable: true,
    attention: false,
    canSetLocation: false,
    canCreateProject: true
  }
]

function HostLocalPreview(): React.JSX.Element {
  return (
    <div className="h-[200px] p-4">
      <RunTargetCombobox
        hostOptions={hostLocalOptions}
        hostValue="local"
        hostExecutionHostId="local"
        onHostChange={() => {}}
        recipes={[]}
        recipeValue={null}
        onCreateProject={() => {}}
      />
    </div>
  )
}

const open = (frame: HTMLElement): void => {
  frame.querySelector<HTMLInputElement>('[aria-label="Run on"][role="combobox"]')?.focus()
}
const openPicker = (frame: HTMLElement): void => {
  frame.querySelector<HTMLInputElement>('[aria-label="Run on"][role="combobox"]')?.focus()
  frame.querySelector<HTMLElement>('[data-run-target-combobox-root="true"]')?.click()
}
export const vmSelectedClosed = defineFixture({ width: 420, render: () => <Preview vmSelected /> })
export const vmSelected = defineFixture({ ...vmSelectedClosed, interact: open })
export const localSelected = defineFixture({
  width: 420,
  render: () => <Preview vmSelected={false} />,
  interact: open
})
export const hostLocalCreate = defineFixture({
  width: 420,
  render: () => <HostLocalPreview />,
  interact: openPicker
})
