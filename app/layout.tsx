import type {Metadata} from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import './cosmos.css';
import {Shell} from '@/components/shell';
import {RadioTransport} from '@/components/radio-transport';
import {appName} from '@/lib/brand';
export const metadata:Metadata={title:`${appName} — Learn by teaching`,description:'A quiet classroom for learning physics by teaching an original simulated student.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><RadioTransport/><Shell>{children}</Shell></body></html>;}
