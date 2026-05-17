import { SVGProps } from 'react';

const NotificationIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M7.1875 14.6875C7.1875 18.4375 12.8125 18.4375 12.8125 14.6875M10 2.1875C6.91496 2.1875 4.6875 4.0625 4.6875 6.5625V10.3125L2.1875 14.6875H17.8125L15.3125 10.3125V6.5625C15.3125 4.0625 13.8549 2.1875 10 2.1875Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default NotificationIcon;
