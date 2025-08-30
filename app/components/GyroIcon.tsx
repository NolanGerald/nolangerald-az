import React from 'react';

interface GyroIconProps {
  isActive: boolean;
  size?: number;
  triggerHint?: boolean;
}

const GyroIcon: React.FC<GyroIconProps> = ({ isActive, size = 24, triggerHint = false }) => {
  const [hasAnimatedOnce, setHasAnimatedOnce] = React.useState(false);
  const [shouldShowHint, setShouldShowHint] = React.useState(false);
  const [showHandCursor, setShowHandCursor] = React.useState(false);
  
  // Initial hint animation on page load
  React.useEffect(() => {
    if (!isActive && !hasAnimatedOnce) {
      const timer = setTimeout(() => {
        setHasAnimatedOnce(true);
        setShouldShowHint(true);
        // Show hand cursor after phone animation starts
        setTimeout(() => setShowHandCursor(true), 500);
        // Reset hint state after animation completes
        setTimeout(() => {
          setShouldShowHint(false);
          setShowHandCursor(false);
        }, 2000);
      }, 2000); // Wait 2 seconds after mount, then trigger hint animation
      
      return () => clearTimeout(timer);
    }
  }, [isActive, hasAnimatedOnce]);

  // Recurring hint animation every 5 seconds when inactive
  React.useEffect(() => {
    if (!isActive) {
      const interval = setInterval(() => {
        setShouldShowHint(true);
        // Show hand cursor after phone animation starts
        setTimeout(() => setShowHandCursor(true), 500);
        // Reset hint state after animation completes
        setTimeout(() => {
          setShouldShowHint(false);
          setShowHandCursor(false);
        }, 2000);
      }, 5000); // Repeat every 5 seconds
      
      return () => clearInterval(interval);
    }
  }, [isActive]);
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: 'translateY(2px)'
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="-5 -10 110 135"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          transformOrigin: 'center center',
          animation: isActive 
            ? 'phoneRotate 2s ease-in-out infinite' 
            : (shouldShowHint ? 'phoneRotateOnce 2s ease-in-out' : 'none')
        }}
      >
        <path d="m92.074 54.598-46.672-46.672c-3.7031-3.7031-9.7305-3.7031-13.434 0l-24.043 24.043c-3.7031 3.7031-3.7031 9.7305 0 13.434l46.668 46.668c1.8516 1.8516 4.2852 2.7773 6.7188 2.7773s4.8672-0.92578 6.7188-2.7773l24.043-24.043c3.7031-3.7031 3.7031-9.7305 0-13.434zm-62.227-38.188c0.66016 0.66016 1.0234 1.5391 1.0234 2.4766 0 0.93359-0.36328 1.8125-1.0234 2.4766l-8.4844 8.4844c-1.3242 1.3242-3.6289 1.3242-4.9492 0l-1.0625-1.0625 13.434-13.434 1.0625 1.0625zm60.105 49.5-24.043 24.043c-2.5352 2.5312-6.6602 2.5312-9.1914 0l-46.672-46.672c-2.5352-2.5352-2.5352-6.6562 0-9.1914l3.1836-3.1836 1.0625 1.0625c1.2656 1.2656 2.9336 1.9023 4.5977 1.9023s3.3281-0.63281 4.5977-1.9023l8.4844-8.4844c2.5352-2.5352 2.5352-6.6562 0-9.1914l-1.0625-1.0625 3.1836-3.1836c1.2656-1.2656 2.9336-1.9023 4.5977-1.9023 1.6641 0 3.3281 0.63281 4.5977 1.9023l46.668 46.668c2.5352 2.5352 2.5352 6.6562 0 9.1914zm-12.02 0c0.58594 0.58594 0.58594 1.5352 0 2.1211l-9.8984 9.8984c-0.29297 0.29297-0.67578 0.4375-1.0625 0.4375-0.38281 0-0.76562-0.14453-1.0625-0.4375-0.58594-0.58594-0.58594-1.5352 0-2.1211l9.8984-9.8984c0.58594-0.58594 1.5352-0.58594 2.1211 0zm-20.355-55.73c-0.49219-0.66406-0.35547-1.6055 0.3125-2.0977l8.875-6.582c0.66406-0.49219 1.6055-0.35547 2.0977 0.3125 0.49219 0.66406 0.35547 1.6055-0.3125 2.0977l-5.2109 3.8633c7.457 0.48047 14.527 3.6289 19.891 8.9922 6.4766 6.4766 9.7422 15.43 8.9609 24.566-0.066406 0.78125-0.72266 1.3711-1.4922 1.3711-0.042969 0-0.085938 0-0.12891-0.003906-0.82422-0.070313-1.4375-0.79688-1.3672-1.6211 0.70312-8.2539-2.2461-16.34-8.0938-22.188-5.1875-5.1875-12.141-8.0859-19.406-8.1758l4.8633 6.5586c0.49219 0.66406 0.35547 1.6055-0.3125 2.0977-0.26953 0.19922-0.58203 0.29688-0.89062 0.29688-0.45703 0-0.91016-0.21094-1.207-0.60547l-6.5781-8.875zm-15.156 79.641c0.49219 0.66406 0.35547 1.6055-0.3125 2.0977l-8.875 6.582c-0.26953 0.19922-0.58203 0.29688-0.89062 0.29688-0.45703 0-0.91016-0.21094-1.207-0.60547-0.49219-0.66406-0.35547-1.6055 0.3125-2.0977l5.1953-3.8555c-7.457-0.48438-14.52-3.6406-19.879-9-6.4766-6.4766-9.7422-15.43-8.9609-24.566 0.070312-0.82422 0.79297-1.4297 1.6211-1.3672 0.82422 0.070312 1.4375 0.79687 1.3672 1.6211-0.70312 8.2539 2.2461 16.34 8.0938 22.188 5.1914 5.1875 12.141 8.0859 19.41 8.1836l-4.8672-6.5625c-0.49219-0.66406-0.35547-1.6055 0.3125-2.0977 0.66406-0.49219 1.6055-0.35547 2.0977 0.3125l6.5781 8.875z"/>
      </svg>
      
      {/* Hand cursor icon that appears during hint */}
      {showHandCursor && (
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: 'calc(50% - 12px)',
            transform: 'translateX(-50%)',
            animation: 'handCursorMove 1.5s ease-in-out',
            pointerEvents: 'none'
          }}
        >
          <svg
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 256 256"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M0 0 C17.16 0 34.32 0 52 0 C52 10.89 52 21.78 52 33 C57.61 33 63.22 33 69 33 C69 38.94 69 44.88 69 51 C80.22 51 91.44 51 103 51 C103 56.61 103 62.22 103 68 C114.22 68 125.44 68 137 68 C137 73.61 137 79.22 137 85 C148.55 85 160.1 85 172 85 C172 118.99 172 152.98 172 188 C166.06 188 160.12 188 154 188 C154 199.22 154 210.44 154 222 C148.39 222 142.78 222 137 222 C137 233.22 137 244.44 137 256 C97.4 256 57.8 256 17 256 C17 244.78 17 233.56 17 222 C11.39 222 5.78 222 0 222 C0 210.78 0 199.56 0 188 C-5.61 188 -11.22 188 -17 188 C-17 181.4 -17 174.8 -17 168 C-22.61 168 -28.22 168 -34 168 C-34 157.77 -34 147.54 -34 137 C-39.94 137 -45.88 137 -52 137 C-52 119.84 -52 102.68 -52 85 C-46.369375 84.690625 -40.73875 84.38125 -34.9375 84.0625 C-33.19460693 83.92593994 -31.45171387 83.78937988 -29.65600586 83.64868164 C-25.33984375 83.53515625 -25.33984375 83.53515625 -16 85 C-11.05 89.95 -6.1 94.9 -1 100 C-0.67 67 -0.34 34 0 0 Z M18 18 C18 57.27 18 96.54 18 137 C12.06 137 6.12 137 0 137 C0 131.39 0 125.78 0 120 C-5.61 120 -11.22 120 -17 120 C-17 114.39 -17 108.78 -17 103 C-22.28 103 -27.56 103 -33 103 C-33 113.89 -33 124.78 -33 136 C-27.39 136 -21.78 136 -16 136 C-16 141.61 -16 147.22 -16 153 C-10.39 153 -4.78 153 1 153 C1 164.22 1 175.44 1 187 C6.61 187 12.22 187 18 187 C18 198.22 18 209.44 18 221 C23.61 221 29.22 221 35 221 C35 226.61 35 232.22 35 238 C62.72 238 90.44 238 119 238 C119 232.39 119 226.78 119 221 C124.61 221 130.22 221 136 221 C136 209.78 136 198.56 136 187 C141.61 187 147.22 187 153 187 C153 159.28 153 131.56 153 103 C147.39 103 141.78 103 136 103 C136 97.39 136 91.78 136 86 C130.72 86 125.44 86 120 86 C120 97.22 120 108.44 120 120 C114.06 120 108.12 120 102 120 C102 103.17 102 86.34 102 69 C96.72 69 91.44 69 86 69 C86 80.22 86 91.44 86 103 C80.06 103 74.12 103 68 103 C68 85.84 68 68.68 68 51 C62.72 51 57.44 51 52 51 C52 63.21 52 75.42 52 88 C46.06 88 40.12 88 34 88 C34 64.9 34 41.8 34 18 C28.72 18 23.44 18 18 18 Z " transform="translate(68,0)"/>
          </svg>
        </div>
      )}
      
      <style jsx>{`
        @keyframes phoneRotate {
          0% { transform: rotateZ(-15deg); }
          50% { transform: rotateZ(15deg); }
          100% { transform: rotateZ(-15deg); }
        }
        
        @keyframes phoneRotateOnce {
          0% { transform: rotateZ(0deg); }
          25% { transform: rotateZ(-15deg); }
          75% { transform: rotateZ(15deg); }
          100% { transform: rotateZ(0deg); }
        }
        
        @keyframes handCursorMove {
          0% { 
            transform: translateY(75px) scale(1);
            opacity: 0;
          }
          50% { 
            transform: translateY(-5px) scale(1.3);
            opacity: 1;
          }
          100% { 
            transform: translateY(-15px) scale(0.8);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default GyroIcon;