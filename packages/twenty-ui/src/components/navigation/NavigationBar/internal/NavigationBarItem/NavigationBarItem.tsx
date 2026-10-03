import { type IconComponent } from '@ui/icon/types/IconComponent';
import { themeCssVariables, useTheme } from '@ui/theme';

import styles from './NavigationBarItem.module.scss';

type NavigationBarItemProps = {
  Icon: IconComponent;
  isActive: boolean;
  onClick: () => void;
  ariaLabel: string;
  label?: string;
  variant?: 'default' | 'primary';
};

export const NavigationBarItem = ({
  Icon,
  isActive,
  onClick,
  ariaLabel,
  label,
  variant = 'default',
}: NavigationBarItemProps) => {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <button
      type="button"
      className={styles.iconButton}
      data-active={isActive ? '' : undefined}
      data-variant={variant}
      aria-label={ariaLabel}
      aria-pressed={isActive}
      onClick={onClick}
    >
      <span className={styles.icon}>
        <Icon
          color={
            isPrimary
              ? themeCssVariables.font.color.inverted
              : isActive
                ? themeCssVariables.font.color.primary
                : themeCssVariables.grayScale.gray10
          }
          size={theme.icon.size.lg}
          aria-hidden
        />
      </span>
      {label !== undefined && !isPrimary && (
        <span className={styles.label} aria-hidden>
          {label}
        </span>
      )}
    </button>
  );
};
