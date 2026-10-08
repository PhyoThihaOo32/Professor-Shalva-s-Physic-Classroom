import type {Metadata} from 'next';
import 'katex/dist/katex.min.css';
import './globals.css';
import './cosmos.css';
import './accounts.css';
import {Shell} from '@/components/shell';
import {RadioTransport} from '@/components/radio-transport';
import {appName} from '@/lib/brand';
import {AccountProvider} from '@/components/account-provider';
export const metadata:Metadata={title:appName,description:'A quiet classroom for learning physics by teaching an original simulated student.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning><body><RadioTransport/><AccountProvider><Shell>{children}</Shell></AccountProvider></body></html>;}
