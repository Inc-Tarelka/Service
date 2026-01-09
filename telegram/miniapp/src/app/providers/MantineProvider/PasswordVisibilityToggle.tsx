import EyeCloseIcon from 'shared/assets/icons/EyeClose';
import EyeOpenIcon from 'shared/assets/icons/EyeOpen';

export const PasswordVisibilityToggle = ({ reveal }: { reveal: boolean }) =>
  reveal ? <EyeCloseIcon /> : <EyeOpenIcon />;
