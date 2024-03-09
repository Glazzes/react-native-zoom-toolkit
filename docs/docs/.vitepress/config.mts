import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "React Native Zoom Toolkit",
  description: "A set of components and utilities for common pinch to zoom requirements",
  base: '/react-native-zoomable/',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {text: '1.0.0', items: [
        {text: 'Changelog', link: 'https://www.youtube.com/'},
        {text: 'Contributing', link: 'https://www.youtube.com/'},
      ]}
    ],

    sidebar: [
      {
        text: 'Get Started',
        link: '/get-started'
      },
      {
        text: 'Components',
        items: [
          {text: 'SnapbackZoom', link: '/components/snapbackzoom'},
          {text: 'Crop Zoom', link: '/components/cropzoom'}
        ]
      },
      {
        text: 'Guides',
        items: [
          {text: 'Use Crop Zoom with Expo Image Manipulator', link: '/guides/cropzoomexpo'},
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