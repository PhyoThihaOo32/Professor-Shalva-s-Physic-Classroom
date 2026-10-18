import type {Metadata} from 'next';
import Link from 'next/link';
import {ArrowLeft} from 'lucide-react';
import {appName} from '@/lib/brand';
import './privacy.css';

export const metadata:Metadata={title:`Privacy · ${appName}`};

export default function PrivacyPage(){
 return <article className="page privacy-page">
  <Link href="/login" className="breadcrumb"><ArrowLeft size={14}/>Back to sign in</Link>
  <h1>Privacy</h1>
  <p className="privacy-updated">Updated October 18, 2026</p>
  <p>{appName} uses account information to give you a personal classroom and keep your saved conversations connected to your account.</p>
  <section><h2>Your account</h2><p>If you choose Google sign-in, Google shares your name, email address, profile picture, and a unique account identifier with this app. We store these details to create or connect your account and recognize you when you return. We do not request access to Gmail, Drive, Calendar, or your Google password.</p><p>If you create an email account, we store your name, email, and a securely hashed password. Sign-in cookies keep you logged in; browser storage remembers preferences such as your selected character and music settings.</p></section>
  <section><h2>Your classroom</h2><p>We save your conversations, submitted drawings, worked steps, corrections, hint use, and learning feedback so you can resume your work. Saved conversations are restricted to the account that owns them.</p></section>
  <section><h2>Services that help the app work</h2><p>Vercel hosts the app, and a hosted PostgreSQL database stores account and classroom records. Google processes Google sign-in. When you use AI features, your message, submitted drawings, and relevant problem or conversation content are sent through the server to OpenAI to generate replies and learning feedback. Google account profile details are not included in those AI requests unless you put them in your conversation.</p><p>We do not sell your Google account information or use it for advertising. If you play online radio, your browser connects to the station’s streaming service.</p></section>
  <section><h2>Your choices</h2><p>You can export or delete your conversation history in Settings and delete individual conversations in My space. Deletion removes active classroom records; service providers may retain backups or operational records according to their retention policies.</p><p>You can revoke Google access in <a href="https://myaccount.google.com/permissions" target="_blank" rel="noreferrer">your Google Account</a>. Revoking access does not automatically delete existing classroom records. For account deletion, a correction to your account details, or a privacy question, contact <a href="mailto:phyothihaoo.pto@gmail.com">phyothihaoo.pto@gmail.com</a>.</p></section>
 </article>;
}
