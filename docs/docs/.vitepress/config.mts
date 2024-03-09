import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "React Native Zoom Toolkit",
  description: "A set of components and utilities for common pinch to zoom requirements",
  base: '/react-native-zoomable/',
  markdown: {
    lineNumbers: true
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {text: '1.0.0', items: [
        {text: 'Changelog', link: 'https://www.youtube.com/'},
        {text: 'Contributing', link: 'https://github.com/Glazzes/react-native-zoomable/blob/main/CONTRIBUTING.md'},
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
          {text: 'CropZoom', link: '/components/cropzoom'}
        ]
      },
      {
        text: 'Utilities',
        items: [
          {text: 'useImageResolution', link: '/utilities/useimageresolution'}
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
      { icon: 'github', link: 'https://github.com/Glazzes/react-native-zoomable/' }
    ]
  }
})
