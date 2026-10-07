import Link from 'next/link';
export default function NotFound(){return <div className="page centered"><h1>A blank page.</h1><p>This page isn’t in the notebook.</p><Link href="/library" className="button">Return to the chapter library</Link></div>;}
