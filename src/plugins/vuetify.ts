import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'

export default createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#1a237e',
          secondary: '#37474f',
          accent: '#00695c',
          surface: '#ffffff',
          background: '#f4f6f8',
        },
      },
    },
  },
  defaults: {
    VCard: { rounded: 'lg', elevation: 0 },
    VBtn: { rounded: 'lg' },
    VSlider: { thumbSize: 14, trackSize: 4 },
  },
})
