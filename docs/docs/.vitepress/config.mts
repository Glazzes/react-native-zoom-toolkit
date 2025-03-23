import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'React Native Zoom Toolkit',
  description:
    'A set of components and utilities for common pinch to zoom requirements',
  base: '/react-native-zoom-toolkit/',
  markdown: {
    lineNumbers: true,
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      {
        text: '4.0.2',
        items: [
          {
            text: 'Releases',
            link: 'https://github.com/Glazzes/react-native-zoom-toolkit/releases',
          },
          {
            text: 'Contributing',
            link: 'https://github.com/Glazzes/react-native-zoom-toolkit/blob/main/CONTRIBUTING.md',
          },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Get Started',
        items: [{ text: 'Installation', link: '/installation' }],
      },
      {
        text: 'Components',
        items: [
          { text: 'SnapbackZoom', link: '/components/snapbackzoom' },
          { text: 'ResumableZoom', link: '/components/resumablezoom' },
          { text: 'CropZoom', link: '/components/cropzoom' },
          { text: 'Gallery', link: '/components/gallery' },
        ],
      },
      {
        text: 'Utilities',
        collapsed: true,
        items: [
          { text: 'fitContainer', link: '/utilities/fitContainer' },
          { text: 'useImageResolution', link: '/utilities/useimageresolution' },
          {
            text: 'useTransformationState',
            link: '/utilities/usetransformationstate',
          },
        ],
      },
      {
        text: 'Guides',
        collapsed: true,
        items: [
          {
            text: 'CropZoom and Expo Image Manipulator',
            link: '/guides/cropzoomexpo',
          },
          {
            text: 'How to use with Skia Components',
            link: '/guides/skia',
          },
          {
            text: 'Downscaling Nested Components',
            link: '/guides/downscale',
          },
        ],
      },
    ],

    footer: {
      message: 'Released under the MIT License.',
    },

    search: {
      provider: 'local',
    },

    socialLinks: [
      {
        icon: 'github',
        link: 'https://github.com/Glazzes/react-native-zoom-toolkit',
      },
    ],
  },
});
