import React from 'react';
import { Box, Text } from 'ink';

interface NewSessionInputProps {
  value: string;
  error: string | null;
}

export function NewSessionInput({ value, error }: NewSessionInputProps) {
  return (
    <Box flexDirection="column">
      <Text bold>New session name:</Text>
      <Box marginTop={1}>
        <Text color="cyan">{value}</Text>
        <Text backgroundColor="cyan"> </Text>
      </Box>
      {error && (
        <Box marginTop={1}>
          <Text color="red">{error}</Text>
        </Box>
      )}
    </Box>
  );
}
