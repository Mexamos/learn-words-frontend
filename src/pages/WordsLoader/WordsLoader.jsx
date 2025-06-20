import './WordsLoader.css'
import { useContext, useState } from 'react'
import { 
  Select, Portal, createListCollection, Box, VStack, Input, FileUpload, Icon
} from '@chakra-ui/react';
import { LuUpload } from "react-icons/lu"
import { AuthContext } from '../../contexts/AuthContext'
import Layout from '../../components/Layout/Layout'

export default function WordsLoader() {
  const [value, setValue] = useState([])
  const [urls, setUrls] = useState({ url1: '', url2: '' })

  const sources = createListCollection({
    items: [
      { label: "YouTube video", value: "youtube" },
      { label: "Link to page with images with text", value: "url-images-with-text" },
      { label: "Video file", value: "video-file" },
    ],
    selectionMode: 'single',
  })

  const handleChange = (e) => {
    setValue(e.value);
  };

  const handleUrlChange = (e) => {
    const { name, value } = e.target
    setUrls(prev => ({ ...prev, [name]: value }))
  }

  return (
   <Layout pageTitle="Words loader">

        <Select.Root
          collection={sources}
          width="320px"
          value={value}
          onValueChange={handleChange}
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

        {(value.includes('youtube') || value.includes('url-images-with-text')) && (
          <VStack spacing={3} mt={4} maxW="320px">
            <Input
              name="url1"
              placeholder="Enter URL #1"
              value={urls.url1}
              onChange={handleUrlChange}
            />
          </VStack>
        )}

        {value.includes('video-file') && (
          <FileUpload.Root maxW="xl" alignItems="stretch" maxFiles={10}>
            <FileUpload.HiddenInput />
            <FileUpload.Dropzone>
              <Icon size="md" color="fg.muted">
                <LuUpload />
              </Icon>
              <FileUpload.DropzoneContent>
                <Box>Drag and drop files here</Box>
                <Box color="fg.muted">.png, .jpg up to 5MB</Box>
              </FileUpload.DropzoneContent>
            </FileUpload.Dropzone>
            <FileUpload.List />
          </FileUpload.Root>
        )}

    </Layout>
  )
}
