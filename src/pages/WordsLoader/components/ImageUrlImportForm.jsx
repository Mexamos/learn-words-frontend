import { VStack, Input } from '@chakra-ui/react';

export default function ImageUrlImportForm({ url, onChange }) {
  return (
    <VStack spacing={3} mt={4} maxW="320px">
      <Input
        name="url"
        placeholder="Enter URL to page with images"
        value={url}
        onChange={onChange}
      />
    </VStack>
  );
}

