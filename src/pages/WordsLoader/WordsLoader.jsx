import './WordsLoader.css'
import { useState } from 'react'
import { 
  Select, Portal, createListCollection, Box, VStack, Input, FileUpload, Icon, Button
} from '@chakra-ui/react';
import { toast } from 'sonner';
import { LuUpload } from "react-icons/lu"
import { submitWords } from '../../services/wordsService'
import Layout from '../../components/Layout/Layout'

export default function WordsLoader() {
  const [selectorValue, setSelectorValue] = useState([])
  const [url, setUrl] = useState('')
  const [files, setFiles] = useState([])
  const [submitIsLoading, setSubmitIsLoading] = useState(false);

  const sources = createListCollection({
    items: [
      { label: "YouTube video", value: "youtube" },
      { label: "Link to page with images with text", value: "url-images-with-text" },
      { label: "Video file", value: "video-file" },
    ],
    selectionMode: 'single',
  })

  const handleSelectorChange = (e) => {
    setSelectorValue(e.value);
  };

  const handleUrlChange = (e) => {
    const { name, value } = e.target
    setUrl(value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitIsLoading(true);
    try {
      const result = await submitWords({ source: selectorValue, url, files });
      console.log('submitWords result:', result);
      toast.success(
        'Words submitted successfully',
        {
          duration: 5000,
          closeButton: true,
        }
      );
      setUrl('');
      setFiles([]);
    } catch (error) {
      if (error.response?.data?.detail?.code === 'VIDEO_TOO_LONG_FOR_PLAN') {
        toast.error(
          error.response.data.detail.title,
          {
            description: error.response.data.detail.message,
            duration: 20000,
            closeButton: true,
          }
        );
        setUrl('');
        setFiles([]);
      } else {
        console.error('Error submitting words:', error);
        toast.error(
          'Something went wrong',
          {
            description: String(error),
            duration: 5000,
            closeButton: true,
          }
        );
      }
    } finally {
      setSubmitIsLoading(false);
    }
  };

  return (
   <Layout pageTitle="Words loader">

        <Select.Root
          collection={sources}
          width="320px"
          value={selectorValue}
          onValueChange={handleSelectorChange}
        >
          <Select.Label>Words source</Select.Label>

          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Select words source" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>

          <Portal>
            <Select.Positioner>
              <Select.Content>
                {sources.items.map((source) => (
                  <Select.Item item={source} key={source.value}>
                    {source.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        {(selectorValue.includes('youtube') || selectorValue.includes('url-images-with-text')) && (
          <VStack spacing={3} mt={4} maxW="320px">
            <Input
              name="url"
              placeholder="Enter URL"
              value={url}
              onChange={handleUrlChange}
            />
          </VStack>
        )}

        {selectorValue.includes('video-file') && (
          <FileUpload.Root 
            maxW="xl" alignItems="stretch" maxFiles={10} mt={4}
            onFileAccept={(files) => {
              setFiles(files);
            }}
          >
            <FileUpload.HiddenInput />
            <FileUpload.Dropzone>
              <Icon size="md" color="fg.muted">
                <LuUpload />
              </Icon>
              <FileUpload.DropzoneContent>
                <Box>Drag and drop files here</Box>
                <Box color="fg.muted">.mkv, .mp4 up to ????MB</Box>
              </FileUpload.DropzoneContent>
            </FileUpload.Dropzone>
            <FileUpload.List />
          </FileUpload.Root>
        )}

        {selectorValue.length > 0 && (
          <Button
            type="submit"
            variant="surface"
            loading={submitIsLoading}
            loadingText="Submitting"
            onClick={handleSubmit}
            mt={4}
            _active={{
              transform: "scale(0.94)",
              boxShadow: "inner-lg",
            }}
          >
            Submit
          </Button>
        )}

    </Layout>
  )
}
