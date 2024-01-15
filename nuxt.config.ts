export default defineNuxtConfig({
  css: ['@blocksuite/presets/themes/affine.css', '~/styles/global.css'],
  modules: [
    '@vue-macros/nuxt',
    '@vueuse/nuxt',
    '@nuxt/devtools',
    '@unocss/nuxt',
    '@ant-design-vue/nuxt'
  ],
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
