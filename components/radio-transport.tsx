'use client';
import {useEffect, useRef} from 'react';
import {attachRadio} from '@/lib/study-radio';

export function RadioTransport() {
  const element = useRef<HTMLAudioElement>(null);
  useEffect(() => element.current ? attachRadio(element.current) : undefined, []);
  return <audio ref={element} data-study-radio="" preload="none" hidden/>;
}
