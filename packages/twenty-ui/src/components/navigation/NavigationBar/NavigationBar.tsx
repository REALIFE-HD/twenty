import { type IconComponent } from '@ui/icon/types/IconComponent';
import { Fragment, type ReactNode } from 'react';

import { NavigationBarItem } from '@ui/components/navigation/NavigationBar/internal/NavigationBarItem/NavigationBarItem';

import styles from './NavigationBar.module.scss';

type NavigationBarProps = {
  activeItemName: string;
  isHidden?: boolean;
  items: {
    name: string;
    label: string;
    Icon: IconComponent;
    onClick: () => void;
    variant?: 'default' | 'primary';
    // Lets the caller anchor something to the item, such as a dropdown that
    // opens from it.
    renderWrapper?: (item: ReactNode) => ReactNode;
  }[];
};

export const NavigationBar = ({
  activeItemName,
  isHidden = false,
  items,
}: NavigationBarProps) => {
  return (
    <nav
      className={styles.container}
      data-hidden={isHidden ? '' : undefined}
      aria-hidden={isHidden}
    >
      {items.map(({ Icon, name, label, onClick, variant, renderWrapper }) => {
        const item = (
          <NavigationBarItem
            Icon={Icon}
            isActive={activeItemName === name}
            onClick={onClick}
            ariaLabel={label}
            label={label}
            variant={variant}
          />
        );

        return (
          <Fragment key={name}>
            {renderWrapper ? (
              <div className={styles.itemWrapper}>{renderWrapper(item)}</div>
            ) : (
              item
            )}
          </Fragment>
        );
      })}
    </nav>
  );
};
