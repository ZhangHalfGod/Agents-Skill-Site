import DefaultTheme from 'vitepress/theme'
import RunGuide from './components/RunGuide.vue'
import QuickJump from './components/QuickJump.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('RunGuide', RunGuide)
    app.component('QuickJump', QuickJump)
  }
}
