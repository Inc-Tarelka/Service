import { SVGProps } from 'react';

const InfoIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g clip-path="url(#clip0_1673_5265)">
      <path
        d="M10 14.1668L10 9.16683M10 5.82516L9.99171 5.83433M10 1.66683C5.39754 1.66683 1.66671 5.39766 1.66671 10.0002C1.66671 14.6027 5.39754 18.3335 10 18.3335C14.6025 18.3335 18.3334 14.6027 18.3334 10.0002C18.3334 5.39766 14.6025 1.66683 10 1.66683Z"
        stroke="white"
        stroke-width="1.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </g>
    <defs>
      <clipPath id="clip0_1673_5265">
        <rect width="20" height="20" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default InfoIcon;
