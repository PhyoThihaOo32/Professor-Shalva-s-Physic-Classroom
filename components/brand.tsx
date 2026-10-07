import Link from 'next/link';
import {appName} from '@/lib/brand';

export function Brand() {
  return <Link href="/" className="brand" aria-label={`${appName} home`} title={appName}>
    <span className="brand-mark" aria-hidden="true">p<span>✦</span></span>
    <span className="brand-name"><span className="brand-professor">Professor</span>Shalva’s<small>PHYSIC CLASSROOM</small></span>
  </Link>;
}
