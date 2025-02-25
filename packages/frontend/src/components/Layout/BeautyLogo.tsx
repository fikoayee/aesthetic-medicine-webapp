import { SvgIcon, SvgIconProps } from '@mui/material';

export const BeautyLogo = (props: SvgIconProps) => (
  <SvgIcon {...props} viewBox="0 0 512 512" sx={{ fontSize: 'inherit', ...props.sx }}>
    <path
      fill="currentColor"
      d="M256 48c-37.7 0-72.4 10.8-102.6 29.3c-4.1 2.5-7.8 5.1-11.4 7.9c-3.6 2.8-7 5.7-10.3 8.7c-6.6 6-12.7 12.5-18.3 19.4C89.5 143.7 76 196.1 76 256c0 99.4 80.6 180 180 180s180-80.6 180-180S355.4 76 256 76c-29.6 0-57.5 7.3-82.2 20.2c-3.7 1.9-7.3 4-10.8 6.2c-3.5 2.2-6.9 4.6-10.2 7.1c-6.6 5-12.7 10.5-18.3 16.5C112.5 153.7 100 202.1 100 256c0 86.1 69.9 156 156 156s156-69.9 156-156S342.1 100 256 100c-21.5 0-41.8 4.3-60.4 12.1c-2.8 1.2-5.5 2.5-8.2 3.9c-2.7 1.4-5.3 2.9-7.8 4.5c-5 3.2-9.7 6.8-14.1 10.7C146.5 153.7 136 201.1 136 256c0 66.3 53.7 120 120 120s120-53.7 120-120S322.3 136 256 136"
    />
    <path
      fill="currentColor"
      d="M256 176c-44.2 0-80 35.8-80 80s35.8 80 80 80s80-35.8 80-80s-35.8-80-80-80zm0 40c22.1 0 40 17.9 40 40s-17.9 40-40 40s-40-17.9-40-40s17.9-40 40-40z"
    />
  </SvgIcon>
);
