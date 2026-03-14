import { Box, Text } from 'ink';

interface TitleProps {
  insideTmux: boolean;
  currentSession: string | null;
}

const ASCII_ART = [
  '▀█▀ █▄█ █ █ ▀▄▀   █▀ █▀ █▀ █ █▀ █▀█ █▄ █ █▀',
  ' █  █ █ █ █ █ █   ▀█ █▀ ▀█ █ ▀█ █ █ █ ▀█ ▀█',
  ' ▒  ▒ ▒ ▒▒▒ ▒ ▒   ▒▒ ▒▒ ▒▒ ▒ ▒▒ ▒▒▒ ▒  ▒ ▒▒ '
];

export function Title({ insideTmux, currentSession }: TitleProps) {
  return (
    <Box flexDirection="column" alignItems="center" marginBottom={1}>
      <Box flexDirection="column" alignItems="center">
        {ASCII_ART.map((line, index) => (
          <Text key={index} bold>{line}</Text>
        ))}
      </Box>
      {insideTmux && currentSession && (
        <Text dimColor>
          (current: {currentSession})
        </Text>
      )}
    </Box>
  );
}
