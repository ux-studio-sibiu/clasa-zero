// sanity.config.ts

import {defineConfig} from 'sanity'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'
// import deskStructure from './sanity.config.deskStructure'
import { media } from 'sanity-plugin-media'
import {structureTool} from 'sanity/structure'

export default defineConfig({
  name: 'default',
  title: 'game-dev',

  projectId: "kdwjys69", //game-dev
  dataset: 'production',
  basePath: "/studio",

  plugins: [structureTool(), visionTool(), media()],

  schema: {
    types: schemaTypes,
  },
})
