import { Image } from '@mantine/core';
import { useCallback, useRef, useState } from 'react';
import classes from './ImageCarousel.module.scss';
import TrashIcon from 'shared/assets/icons/trash';

interface ImageCarouselProps {
  images: string[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  onDelete?: (index: number) => void;
  showDeleteButton?: boolean;
}

export const ImageCarousel = (props: ImageCarouselProps) => {
  const {
    images,
    activeIndex: controlledIndex,
    onIndexChange,
    onDelete,
    showDeleteButton = false,
  } = props;

  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;

  // Swipe handling
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const minSwipeDistance = 50;

  const handleDotClick = useCallback(
    (index: number) => {
      if (onIndexChange) {
        onIndexChange(index);
      } else {
        setInternalIndex(index);
      }
    },
    [onIndexChange],
  );

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const distance = touchStartX.current - touchEndX.current;

    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0 && activeIndex < images.length - 1) {
        handleDotClick(activeIndex + 1);
      } else if (distance < 0 && activeIndex > 0) {
        handleDotClick(activeIndex - 1);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(activeIndex);
      if (activeIndex >= images.length - 1 && activeIndex > 0) {
        handleDotClick(activeIndex - 1);
      }
    }
  }, [onDelete, activeIndex, images.length, handleDotClick]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={classes.carousel}>
      <div
        className={classes.imageContainer}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={images[activeIndex]}
          alt={`Image ${activeIndex + 1}`}
          className={classes.image}
          fit="cover"
        />
        {showDeleteButton && onDelete && (
          <button
            className={classes.deleteButton}
            onClick={handleDelete}
            type="button"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className={classes.dots}>
          {images.map((_, index) => (
            <button
              key={index}
              className={`${classes.dot} ${index === activeIndex ? classes.active : ''}`}
              onClick={() => handleDotClick(index)}
              type="button"
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
