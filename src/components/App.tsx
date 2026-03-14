import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { hasSessions, getSessions } from '../tmux.js';
import type { TmuxSession } from '../types.js';
import { Picker } from './Picker.js';

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [sessions, setSessions] = useState<TmuxSession[]>([]);

  useEffect(() => {
    function checkSessions() {
      const hasAny = hasSessions();
      if (!hasAny) {
        // Direct mode: no sessions, launch tmux immediately
        process.exit(0);
      }

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
