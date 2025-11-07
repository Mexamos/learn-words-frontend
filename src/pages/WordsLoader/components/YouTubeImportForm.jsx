import { VStack, Input } from '@chakra-ui/react';

export default function YouTubeImportForm({ url, onChange }) {
  return (
    <VStack spacing={3} mt={4} maxW="320px">
      <Input
        name="url"
        placeholder="Enter YouTube URL"
        value={url}
        onChange={onChange}
      />
    </VStack>
  );
}

