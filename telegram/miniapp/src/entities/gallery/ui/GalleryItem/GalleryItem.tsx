import { Image } from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import { GalleryPhoto } from '../../model/types';
import classes from './GalleryItem.module.scss';

interface GalleryItemProps {
  photo: GalleryPhoto;
  selectionNumber: number;
  onToggle: (id: string) => void;
}

const LONG_PRESS_DURATION = 300;

export const GalleryItem = (props: GalleryItemProps) => {
  const { photo, selectionNumber, onToggle } = props;
  const [showPreview, setShowPreview] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPress = useRef(false);

  const handleTouchStart = useCallback(() => {
    isLongPress.current = false;
    longPressTimer.current = setTimeout(() => {
      isLongPress.current = true;
      setShowPreview(true);
    }, LONG_PRESS_DURATION);
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setShowPreview(false);
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLongPress.current) {
      onToggle(photo.id);
    }
  };

  return (
    <>
      <div
        className={classes.item}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src={photo.base64}
          alt={photo.name}
          className={classes.image}
          loading="lazy"
        />
        <div
          className={`${classes.numberBadge} ${selectionNumber > 0 ? classes.selected : ''}`}
        >
          {selectionNumber > 0 ? selectionNumber : ''}
        </div>
      </div>

      {showPreview && (
        <div className={classes.previewOverlay}>
          <div className={classes.previewContainer}>
            <Image
              src={photo.base64}
              alt={photo.name}
              className={classes.previewImage}
              fit="contain"
            />
          </div>
        </div>
      )}
    </>
  );
};
