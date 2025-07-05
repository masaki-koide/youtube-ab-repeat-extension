import { defineConfig } from 'wxt'

// See https://wxt.dev/api/config.html
export default defineConfig({
  manifest: {
    name: 'YouTube AB Repeat',
    description:
      'Loop sections of YouTube videos with customizable start and end times',
    permissions: [],
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'none'",
    },
  },
})
