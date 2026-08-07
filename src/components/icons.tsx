import type { SVGProps } from 'react';

const base = (props: SVGProps<SVGSVGElement>) => ({
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
});

export const PhoneIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4.5 3.5h3l1.6 4.2-2 1.3a12.5 12.5 0 0 0 5.9 5.9l1.3-2 4.2 1.6v3a2 2 0 0 1-2 2C10 19.5 4.5 14 4.5 5.5a2 2 0 0 1 2-2Z" />
  </svg>
);

export const HangupIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M2.6 13.4c5.2-4.6 13.6-4.6 18.8 0l-2.6 2.9-3.6-1.5-.4-2.5a11.4 11.4 0 0 0-5.6 0l-.4 2.5-3.6 1.5-2.6-2.9Z" />
  </svg>
);

export const PauseIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 5v14M15 5v14" />
  </svg>
);

export const PlayIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M7 4.5 19 12 7 19.5v-15Z" />
  </svg>
);

export const MicIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" />
  </svg>
);

export const MicOffIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 9v2a3 3 0 0 0 4.6 2.5M15 11.4V6a3 3 0 0 0-5.6-1.5" />
    <path d="M5.5 11a6.5 6.5 0 0 0 10 5.5M18.5 11a6.5 6.5 0 0 1-.8 3.1M12 17.5V21" />
    <path d="m3.5 3.5 17 17" />
  </svg>
);

export const SpeakerIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
    <path d="M15.5 9.2a4 4 0 0 1 0 5.6" />
  </svg>
);

export const SpeakerOffIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 9.5h3.5L12 5.5v13L7.5 14.5H4v-5Z" />
    <path d="m16 9.5 4 5M20 9.5l-4 5" />
  </svg>
);

export const PowerIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M12 3.5v8" />
    <path d="M17.5 6.8a7.5 7.5 0 1 1-11 0" />
  </svg>
);

export const CoffeeIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M4 8h12v6a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V8Z" />
    <path d="M16 9.5h1.5a2.5 2.5 0 0 1 0 5H16" />
    <path d="M7 3.5v2M11 3.5v2" />
  </svg>
);

export const CheckIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </svg>
);

export const BackspaceIcon = (p: SVGProps<SVGSVGElement>) => (
  <svg {...base(p)}>
    <path d="M9 5h10a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-6-7 6-7Z" />
    <path d="m12 9.5 5 5M17 9.5l-5 5" />
  </svg>
);
