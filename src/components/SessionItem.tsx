import React from 'react';
import { Box, Text } from 'ink';
import type { TmuxSession } from '../types.js';

interface SessionItemProps {
  session: TmuxSession | null; // null for "New session"
  isSelected: boolean;
}

export function SessionItem({ session, isSelected }: SessionItemProps) {
  const prefix = isSelected ? '› ' : '  ';
  const highlight = isSelected ? { color: 'cyan' as const, bold: true } : {};

  if (session === null) {
    return (
      <Box>
        <Text {...highlight}>{prefix}New session</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Text {...highlight}>
        {prefix}{session.name}
        {session.attached && <Text color="green"> (attached)</Text>}
      </Text>
    </Box>
  );
}
