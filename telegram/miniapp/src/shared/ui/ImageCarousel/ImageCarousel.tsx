import { Image } from '@mantine/core';
import { AnimatePresence, motion } from 'motion/react';
import { useCallback, useEffect, useState } from 'react';
import TrashIcon from 'shared/assets/icons/trash';
import classes from './ImageCarousel.module.scss';

interface ImageCarouselProps {
  images: string[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  onDelete?: (index: number) => void;
  showDeleteButton?: boolean;
}

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 320 : -320,
    opacity: 0,
    scale: 0.9,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 320 : -320,
    opacity: 0,
    scale: 0.9,
  }),
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

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
  const [direction, setDirection] = useState(0);

  const [prevIndex, setPrevIndex] = useState(activeIndex);

  useEffect(() => {
    if (activeIndex !== prevIndex) {
      if (prevIndex === images.length - 1 && activeIndex === 0) {
        setDirection(1);
      } else if (prevIndex === 0 && activeIndex === images.length - 1) {
        setDirection(-1);
      } else {
        setDirection(activeIndex > prevIndex ? 1 : -1);
      }
      setPrevIndex(activeIndex);
    }
  }, [activeIndex, prevIndex, images.length]);

  const paginate = useCallback(
    (newDirection: number) => {
      let newIndex = activeIndex + newDirection;

      if (newIndex < 0) {
        newIndex = images.length - 1;
      } else if (newIndex >= images.length) {
        newIndex = 0;
      }

      setDirection(newDirection);
      if (onIndexChange) {
        onIndexChange(newIndex);
      } else {
        setInternalIndex(newIndex);
      }
    },
    [activeIndex, images.length, onIndexChange],
  );

  const handleDotClick = useCallback(
    (index: number) => {
      setDirection(index > activeIndex ? 1 : -1);
      if (onIndexChange) {
        onIndexChange(index);
      } else {
        setInternalIndex(index);
      }
    },
    [onIndexChange, activeIndex],
  );

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(activeIndex);
      if (activeIndex >= images.length - 1 && activeIndex > 0) {
        if (onIndexChange) onIndexChange(activeIndex - 1);
        else setInternalIndex(activeIndex - 1);
      }
    }
  }, [onDelete, activeIndex, images.length, onIndexChange]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={classes.carousel}>
      <div className={classes.imageContainer}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={activeIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 30 },
              opacity: { duration: 0.2 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, { offset, velocity }) => {
              const swipe = swipePower(offset.x, velocity.x);

              if (swipe < -swipeConfidenceThreshold) {
                paginate(1);
              } else if (swipe > swipeConfidenceThreshold) {
                paginate(-1);
              } else if (Math.abs(offset.x) > 50) {
                paginate(offset.x > 0 ? -1 : 1);
              }
            }}
            className={classes.motionWrapper}
            style={{ position: 'absolute', width: '100%', height: '100%' }}
          >
            <Image
              src={images[activeIndex]}
              alt={`Image ${activeIndex + 1}`}
              className={classes.image}
              fit="cover"
              draggable={false}
            />
          </motion.div>
        </AnimatePresence>

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
