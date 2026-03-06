import type { PropsWithChildren } from 'react'
import { useLaunch } from '@tarojs/taro'
import { I18nProvider } from './components/I18nProvider'
import './app.scss'

function App({ children }: PropsWithChildren) {
  useLaunch(() => {
    console.log('App launched.')
  })
  return (
    <I18nProvider>
      {children}
    </I18nProvider>
  )
}

export default App
