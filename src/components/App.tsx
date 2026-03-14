import { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { getSessions } from '../tmux.js';
import type { TmuxSession } from '../types.js';
import { Picker } from './Picker.js';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<TmuxSession[]>([]);

  useEffect(() => {
    function checkSessions() {
      const sessionList = getSessions();
      setSessions(sessionList);
      setIsLoading(false);
    }

    checkSessions();
  }, []);

  if (isLoading) {
    return (
      <Box justifyContent="center" alignItems="center">
        <Text>Loading...</Text>
      </Box>
    );
  }

  return <Picker sessions={sessions} />;
}
