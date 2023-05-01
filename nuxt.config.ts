export default defineNuxtConfig({
  css: ['@blocksuite/editor/themes/affine.css', '~/styles/global.css'],
  modules: ['@vue-macros/nuxt', '@vueuse/nuxt', '@nuxt/devtools'],
  vite: {
    define: {
      'process.env.FORCE_COLOR': 'undefined',
    },
  },
  typescript: {
    tsConfig: {
      compilerOptions: {
        moduleResolution: 'bundler',
      },
      exclude: ['../react'],
    },
  },
  app: {
    head: {
      title: 'Nuxt AFFiNE demo',
    },
  },
})
