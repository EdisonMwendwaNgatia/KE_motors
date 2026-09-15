'use client';

import React, { useState, useEffect } from 'react';

interface SafeImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80',
  className,
  ...props
}: SafeImageProps) {
  const initialSrc = typeof src === 'string' && src.length > 0 ? src : fallbackSrc;
  const [imgSrc, setImgSrc] = useState<string>(initialSrc);

  useEffect(() => {
    setImgSrc(typeof src === 'string' && src.length > 0 ? src : fallbackSrc);
  }, [src, fallbackSrc]);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      {...props}
      src={imgSrc}
      alt={alt || 'Vehicle image'}
      className={className}
      onError={() => {
        if (imgSrc !== fallbackSrc) {
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
