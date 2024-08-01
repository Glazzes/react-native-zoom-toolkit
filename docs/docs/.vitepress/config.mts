import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "React Native Zoom Toolkit",
  description: "A set of components and utilities for common pinch to zoom requirements",
  base: '/react-native-zoom-toolkit/',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: '2.1.0', items: [
        {text: 'Releases', link: 'https://github.com/Glazzes/react-native-zoom-toolkit/releases'},
        {text: 'Contributing', link: 'https://github.com/Glazzes/react-native-zoom-toolkit/blob/main/CONTRIBUTING.md'},
      ]}
    ],

    sidebar: [
      {
        text: 'Get Started',
        items: [
          {text: 'Installation', link: '/installation'}
        ]
      },
      {
        text: 'Components',
        items: [
          {text: 'SnapbackZoom', link: '/components/snapbackzoom'},
          {text: 'ResumableZoom', link: '/components/resumablezoom'},
          {text: 'CropZoom', link: '/components/cropzoom'},
          {text: 'Gallery', link: '/components/gallery'}
        ]
      },
      {
        text: 'Utilities',
        items: [
          {text: 'useImageResolution', link: '/utilities/useimageresolution'},
          {text: 'getAspectRatioSize', link: '/utilities/getAspectRatioSize'}
        ]
      },
      {
        text: 'Guides',
        items: [
          {text: 'Use CropZoom with Expo Image Manipulator', link: '/guides/cropzoomexpo'},
        ]
      }
    ],

    footer: {
      message: "Released under the MIT License.",
    },

    search: {
      provider: "local"
    }, 

    socialLinks: [
      { icon: 'github', link: 'https://github.com/Glazzes/react-native-zoom-toolkit' }
    ]
  }
})
