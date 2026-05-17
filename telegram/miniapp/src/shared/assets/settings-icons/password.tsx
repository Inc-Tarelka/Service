import { SVGProps } from 'react';

const PasswordIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="M3.33337 12.667C3.33337 10.7817 3.33337 9.83833 3.91937 9.25299C4.50471 8.66699 5.44804 8.66699 7.33337 8.66699H12.6667C14.552 8.66699 15.4954 8.66699 16.0807 9.25299C16.6667 9.83833 16.6667 10.7817 16.6667 12.667C16.6667 14.5523 16.6667 15.4957 16.0807 16.081C15.4954 16.667 14.552 16.667 12.6667 16.667H7.33337C5.44804 16.667 4.50471 16.667 3.91937 16.081C3.33337 15.4957 3.33337 14.5523 3.33337 12.667Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M6 8.66683V7.3335C6 6.27263 6.42143 5.25521 7.17157 4.50507C7.92172 3.75492 8.93913 3.3335 10 3.3335C11.0609 3.3335 12.0783 3.75492 12.8284 4.50507C13.5786 5.25521 14 6.27263 14 7.3335V8.66683"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M7.33337 12.667H7.33937M9.99404 12.667H10M12.6607 12.667H12.6667"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PasswordIcon;
