export default function ChatErrorIcon({
  className,
  color = '#FFFFFF',
  size = 36,
}: {
  className?: string;
  color?: string;
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M21 28.5C26.6565 28.5 29.4855 28.5 31.242 26.742C32.9985 24.984 33 22.1565 33 16.5C33 10.8435 33 8.0145 31.242 6.258C29.484 4.5015 26.6565 4.5 21 4.5H15C9.3435 4.5 6.5145 4.5 4.758 6.258C3.0015 8.016 3 10.8435 3 16.5C3 22.1565 3 24.9855 4.758 26.742C5.7375 27.723 7.05 28.1565 9 28.347"
        stroke={color}
        strokeWidth="2.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21.0004 28.4999C19.1464 28.4999 17.1034 29.2499 15.2389 30.2174C12.2419 31.7729 10.7434 32.5514 10.0054 32.0549C9.26736 31.5584 9.40686 30.0224 9.68736 26.9489L9.75036 26.2499M14.8189 13.3184L18.0004 16.4999M18.0004 16.4999L21.1819 19.6814M18.0004 16.4999L21.1819 13.3184M18.0004 16.4999L14.8189 19.6814"
        stroke={color}
        strokeWidth="2.55"
        strokeLinecap="round"
      />
    </svg>
  );
}
