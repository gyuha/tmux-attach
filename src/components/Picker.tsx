import { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import type { TmuxSession } from '../types.js';
import { SessionItem } from './SessionItem.js';
import { NewSessionInput } from './NewSessionInput.js';
import { Title } from './Title.js';
import { attachSession, newSession, isInsideTmux, getCurrentSessionName } from '../tmux.js';

interface PickerProps {
  sessions: TmuxSession[];
}

export function Picker({ sessions }: PickerProps) {
  const { exit } = useApp();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [mode, setMode] = useState<'list' | 'input'>('list');
  const [newSessionName, setNewSessionName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const currentSession = getCurrentSessionName();
  const insideTmux = isInsideTmux();

  // Total items: "New session" + existing sessions
  const totalItems = 1 + sessions.length;

  useEffect(() => {
    // Prefill new session name with current directory
    const cwd = process.cwd();
    const dirName = cwd.split('/').pop() || 'session';
    setNewSessionName(dirName);
  }, []);

  useInput((input, key) => {
    if (mode === 'input') {
      if (key.escape) {
        setMode('list');
        return;
      }
      if (key.return) {
        handleCreateSession();
        return;
      }
      if (key.backspace || key.delete) {
        setNewSessionName((prev) => prev.slice(0, -1));
        return;
      }
      if (!key.ctrl && !key.meta) {
        setNewSessionName((prev) => prev + input);
      }
      return;
    }

    // List mode navigation
    if (key.upArrow || input === 'k') {
      setSelectedIndex((prev) => (prev - 1 + totalItems) % totalItems);
    } else if (key.downArrow || input === 'j') {
      setSelectedIndex((prev) => (prev + 1) % totalItems);
    } else if (key.return) {
      handleSelect(selectedIndex);
    } else if (key.escape || input === 'q') {
      exit();
    }
  });

  function handleSelect(index: number) {
    if (index === 0) {
      // New session selected
      setMode('input');
    } else {
      // Existing session selected
      const session = sessions[index - 1];
      try {
        attachSession(session.name);
        exit();
      } catch (err) {
        setError(`Failed to attach to session: ${err}`);
      }
    }
  }

  function handleCreateSession() {
    if (!newSessionName.trim()) {
      setError('Session name cannot be empty');
      return;
    }
    try {
      newSession(newSessionName.trim());
      exit();
    } catch (err) {
      setError(`Failed to create session: ${err}`);
    }
  }

  return (
    <Box
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      height="100%"
      padding={2}
    >
      <Title insideTmux={insideTmux} currentSession={currentSession} />

      <Box flexDirection="column" borderStyle="round" borderColor="gray" padding={1}>
        {mode === 'list' ? (
          <>
            {/* New session option */}
            <SessionItem session={null} isSelected={selectedIndex === 0} />

            {/* Existing sessions */}
            {sessions.map((session, index) => (
              <SessionItem
                key={session.name}
                session={session}
                isSelected={selectedIndex === index + 1}
              />
            ))}
          </>
        ) : (
          <NewSessionInput
            value={newSessionName}
            error={error}
          />
        )}
      </Box>

      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}

      <Box marginTop={1}>
        <Text dimColor>
          {mode === 'list'
            ? '↑/↓/j/k navigate · Enter select · Esc/q quit'
            : 'Enter confirm · Esc cancel'}
        </Text>
      </Box>
    </Box>
  );
}
