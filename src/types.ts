export interface TmuxSession {
  name: string;
  attached: boolean;
  windows: number;
  created: number;
}

export type PickerMode = 'new' | 'list';

export interface AppState {
  sessions: TmuxSession[];
  selectedIndex: number;
  mode: PickerMode;
  newSessionName: string;
  isLoading: boolean;
  error: string | null;
}
