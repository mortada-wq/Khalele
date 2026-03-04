"use client";

export function ProfileIcon({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg 
      className={className}
      width={size} 
      height={size} 
      viewBox="0 0 108.61 128.98"
      style={{ 
        fill: "currentColor",
        transition: "fill 0.3s ease"
      }}
    >
      <defs>
        <linearGradient id="linear-gradient" x1="35.3" y1="56.92" x2="73.34" y2="56.92" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#c28e2a"/>
          <stop offset=".31" stopColor="#b17529" stopOpacity=".7"/>
          <stop offset=".32" stopColor="#af752a" stopOpacity=".69"/>
          <stop offset=".5" stopColor="#98784f" stopOpacity=".57"/>
          <stop offset=".68" stopColor="#887a69" stopOpacity=".47"/>
          <stop offset=".85" stopColor="#7e7b79" stopOpacity=".42"/>
          <stop offset="1" stopColor="#7b7c7f" stopOpacity=".4"/>
        </linearGradient>
        <linearGradient id="linear-gradient-2" x1="0" y1="64.49" x2="108.61" y2="64.49" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="currentColor"/>
          <stop offset="1" stopColor="currentColor" stopOpacity=".1"/>
        </linearGradient>
      </defs>
      <circle fill="url(#linear-gradient)" cx="54.32" cy="56.92" r="19.02"/>
      <path 
        fill="url(#linear-gradient-2)" 
        stroke="url(#linear-gradient-2)" 
        strokeMiterlimit="10" 
        strokeWidth=".28"
        d="M92.92,32.26c-9.4-11.6-22.06-21.14-35.07-30.94-2.08-1.58-4.96-1.58-7.05,0C24.76,20.93.17,39.45.17,75.54c-.47,14.1,4.77,27.79,14.53,37.97.74.74,1.48,1.45,2.29,2.16,9.16,7.73,20.59,12.28,32.56,12.96,3.18.06,6.37.13,9.55.19l-.02-.04c11.97-.68,23.4-5.22,32.56-12.96,11.01-9.68,16.82-23.63,16.82-40.2,0-18.09-6.15-31.77-15.55-43.37ZM89.08,101.42c-.94,1.24-1.97,2.41-3.09,3.49-5.8-17.45-24.66-26.9-42.11-21.09-9.36,3.11-16.86,10.21-20.48,19.39-1.7-1.55-3.22-3.28-4.55-5.16-6.18-10.01-8.32-21.99-6-33.52,3.83-20.47,18.77-34.02,41.47-51.21,26.5,20.16,42.46,35.25,42.46,62.09.35,9.28-2.36,18.41-7.7,26.01Z"
      />
    </svg>
  );
}
