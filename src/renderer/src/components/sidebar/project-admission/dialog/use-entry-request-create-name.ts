import { useEffect } from 'react'
import type { AddRepoDialogEntryRequest } from './add-repo-dialog-types'

/** Run on can open Create after this dialog is already mounted, so prefill the requested name. */
export function useEntryRequestCreateName(
  isOpen: boolean,
  entryRequest: AddRepoDialogEntryRequest | null,
  setCreateName: (value: string) => void
): void {
  useEffect(() => {
    if (isOpen && entryRequest?.kind === 'create' && entryRequest.createName) {
      setCreateName(entryRequest.createName)
    }
  }, [entryRequest, isOpen, setCreateName])
}
