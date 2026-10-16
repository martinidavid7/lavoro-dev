import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import LogoUploader from '../LogoUploader.vue'

function mountUploader(logoUrl: string | null = null) {
  return mount(LogoUploader, { props: { name: 'Martini Software', logoUrl } })
}

/** Simulates choosing a file in the hidden file input. */
async function choose(wrapper: ReturnType<typeof mountUploader>, file: File) {
  const input = wrapper.get('[data-test="logo-input"]')
  Object.defineProperty(input.element, 'files', { value: [file], configurable: true })
  await input.trigger('change')
}

describe('LogoUploader', () => {
  it('shows the initials when there is no logo', () => {
    const wrapper = mountUploader()

    expect(wrapper.get('[data-test="logo-initials"]').text()).toBe('MS')
    expect(wrapper.find('[data-test="remove-logo"]').exists()).toBe(false)
  })

  it('emits a valid image to be uploaded', async () => {
    const wrapper = mountUploader()
    const file = new File(['png'], 'logo.png', { type: 'image/png' })

    await choose(wrapper, file)

    expect(wrapper.emitted('upload')).toEqual([[file]])
    expect(wrapper.find('[data-test="logo-error"]').exists()).toBe(false)
  })

  it('rejects an invalid file before uploading it', async () => {
    const wrapper = mountUploader()

    await choose(wrapper, new File(['pdf'], 'cv.pdf', { type: 'application/pdf' }))

    expect(wrapper.emitted('upload')).toBeUndefined()
    expect(wrapper.get('[data-test="logo-error"]').text()).toBe(
      'Il logo deve essere un file JPG, PNG o WebP.',
    )
  })

  it('shows the current logo and lets it be removed', async () => {
    const wrapper = mountUploader('http://localhost:8000/storage/logos/ms.png')

    expect(wrapper.get('img').attributes('src')).toBe('http://localhost:8000/storage/logos/ms.png')

    await wrapper.get('[data-test="remove-logo"]').trigger('click')

    expect(wrapper.emitted('remove')).toHaveLength(1)
  })
})
