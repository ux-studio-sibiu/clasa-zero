import createClient from "@sanity/client";
import {createImageUrlBuilder}  from '@sanity/image-url'

import type { ClientConfig } from "@sanity/client";
import type { SanityImageSource } from '@sanity/image-url'

const config: ClientConfig = {
  projectId: "kdwjys69", //ux.studio.sibiu
  dataset: "production",
  apiVersion: "2025-11-22",
  useCdn: false,
};

const client = createClient(config);

export default client;


const builder = createImageUrlBuilder(client)

export function urlFor(source: SanityImageSource) {
  return builder.image(source)
}