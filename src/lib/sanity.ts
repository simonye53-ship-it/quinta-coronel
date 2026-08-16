import {createClient} from '@sanity/client'
import {createImageUrlBuilder} from '@sanity/image-url'

export const sanityClient = createClient({
  projectId: 'aff8o7wr',
  dataset: 'production',
  apiVersion: '2026-08-15',
  useCdn: false,
  perspective: 'published',
})

const builder = createImageUrlBuilder(sanityClient)

export const urlFor = (source: any) => builder.image(source)