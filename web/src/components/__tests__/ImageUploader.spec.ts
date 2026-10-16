import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import ImageUploader from '../ImageUploader.vue'

function mountUploader(props: { imageUrl?: string | null; kind?: 'logo' | 'photo' } = {}) {
  return mount(ImageUploader, {
    props: { name: 'Martini Software', imageUrl: null, ...props },
  })
}

/** Simulates choosing a file in the hidden file input. */
async function choose(wrapper: ReturnType<typeof mountUploader>, file: File) {
  const input = wrapper.get('[data-test="image-input"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
}

describe('ImageUploader', () => {
  it('shows the initials when there is no image', () => {
    const wrapper = mountUploader()

    expect(wrapper.get('[data-test="avatar-initials"]').text()).toBe('MS')
    expect(wrapper.find('[data-test="remove-image"]').exists()).toBe(false)
  })

  it('emits a valid image to be uploaded', async () => {
    const wrapper = mountUploader()
    const file = new File(['png'], 'logo.png', { type: 'image/png' })

    await choose(wrapper, file)

    expect(wrapper.emitted('upload')).toEqual([[file]])
    expect(wrapper.find('[data-test="image-error"]').exists()).toBe(false)
  })

  it('rejects an invalid file before uploading it, naming the kind of image', async () => {
    const wrapper = mountUploader({ kind: 'photo' })

    await choose(wrapper, new File(['pdf'], 'cv.pdf', { type: 'application/pdf' }))

    expect(wrapper.emitted('upload')).toBeUndefined()
    expect(wrapper.get('[data-test="image-error"]').text()).toBe(
      'La foto deve essere un file JPG, PNG o WebP.',
    )
  })

  it('shows the current image and lets it be removed', async () => {
    const wrapper = mountUploader({ imageUrl: 'http://localhost:8000/storage/logos/ms.png' })

    expect(wrapper.get('img').attributes('src')).toBe('http://localhost:8000/storage/logos/ms.png')
    expect(wrapper.text()).toContain('Cambia logo')

    await wrapper.get('[data-test="remove-image"]').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })

  it('shows photos as a circle', () => {
    const wrapper = mountUploader({ kind: 'photo' })

    expect(wrapper.get('[data-test="avatar-initials"]').classes()).toContain('rounded-full')
    expect(wrapper.text()).toContain('Carica foto')
  })
})
