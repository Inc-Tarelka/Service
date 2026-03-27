import { Carousel } from '@mantine/carousel';
import { Skeleton } from '@mantine/core';
import { useCallback, useState } from 'react';
import TrashIcon from 'shared/assets/icons/trash';
import '@mantine/carousel/styles.css';
import classes from './ImageCarousel.module.scss';

interface ImageCarouselProps {
  images: string[];
  activeIndex?: number;
  onIndexChange?: (index: number) => void;
  onDelete?: (index: number) => void;
  showDeleteButton?: boolean;
}

interface SlideImageProps {
  src: string;
  alt: string;
  preloaded: boolean;
  onLoad: (url: string) => void;
}

const SlideImage = (props: SlideImageProps) => {
  const { src, alt, preloaded, onLoad } = props;

  return (
    <div className={classes.slideInner}>
      {/* Skeleton держит высоту в потоке пока картинка не загружена */}
      <Skeleton
        className={classes.skeleton}
        radius={0}
        animate
        style={{ display: preloaded ? 'none' : undefined }}
      />
      {/* Картинка абсолютно поверх скелетона пока грузится, потом встаёт в поток */}
      <img
        src={src}
        alt={alt}
        draggable={false}
        className={`${classes.image} ${preloaded ? classes.imageLoaded : classes.imageLoading}`}
        onLoad={() => onLoad(src)}
      />
    </div>
  );
};

export const ImageCarousel = (props: ImageCarouselProps) => {
  const {
    images,
    activeIndex: controlledIndex,
    onIndexChange,
    onDelete,
    showDeleteButton = false,
  } = props;

  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;

  const handleImageLoad = useCallback((url: string) => {
    setLoadedUrls((prev) => new Set([...prev, url]));
  }, []);

  const handleSlideChange = useCallback(
    (index: number) => {
      setInternalIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange],
  );

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    onDelete(activeIndex);
    const newIndex =
      activeIndex >= images.length - 1 && activeIndex > 0
        ? activeIndex - 1
        : activeIndex;
    setInternalIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [onDelete, activeIndex, images.length, onIndexChange]);

  if (images.length === 0) {
    return null;
  }

  return (
    <div className={classes.wrapper}>
      <Carousel
        withControls={false}
        withIndicators={images.length > 1}
        emblaOptions={{ loop: true }}
        initialSlide={activeIndex}
        onSlideChange={handleSlideChange}
        classNames={{
          root: classes.carousel,
          viewport: classes.viewport,
          container: classes.container,
          slide: classes.slide,
          indicators: classes.indicators,
          indicator: classes.indicator,
        }}
      >
        {images.map((url, index) => (
          <Carousel.Slide key={url}>
            <SlideImage
              src={url}
              alt={`Image ${index + 1}`}
              preloaded={loadedUrls.has(url)}
              onLoad={handleImageLoad}
            />
          </Carousel.Slide>
        ))}
      </Carousel>

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
  );
};
