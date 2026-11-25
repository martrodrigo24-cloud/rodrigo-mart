import {useState} from 'react';
import {ShieldCheck} from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function SafeImage({src, alt, className = '', fallbackLabel}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-600 p-4 text-center ${className}`}
      >
        <ShieldCheck className="w-7 h-7 text-[#0E6245]" aria-hidden="true" />
        <span className="text-xs font-medium text-slate-700 max-w-[180px] truncate">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
