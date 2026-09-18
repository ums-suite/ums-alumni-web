import { signalStoreFeature, withState } from '@ngrx/signals';

export interface LoadState {
  readonly isLoading: boolean;
  readonly error: string | null;
}

export function withLoadState() {
  return signalStoreFeature(withState<LoadState>({ isLoading: false, error: null }));
}
