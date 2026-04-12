import { Carousel } from '@mantine/carousel';
import { Skeleton } from '@mantine/core';
import { observer } from 'mobx-react-lite';
import { useCallback, useMemo, useRef, useState } from 'react';
import TrashIcon from 'shared/assets/icons/trash';
import '@mantine/carousel/styles.css';
import { CarouselHeightStore } from 'shared/store/ui/ImageCarousel/carousel-store';
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
  onLoad: (url: string, height: number) => void;
}

const SlideImage = (props: SlideImageProps) => {
  const { src, alt, preloaded, onLoad } = props;
  const imageRef = useRef<HTMLImageElement>(null);

  const handleImageLoad = () => {
    if (imageRef.current) {
      const height = imageRef.current.offsetHeight;
      onLoad(src, height);
    }
  };

  return (
    <div className={classes.slideInner}>
      <Skeleton
        className={classes.skeleton}
        radius={0}
        animate={!preloaded}
        visible={!preloaded}
      />
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        draggable={false}
        className={`${classes.image} ${preloaded ? classes.imageLoaded : classes.imageLoading}`}
        onLoad={handleImageLoad}
      />
    </div>
  );
};

const ImageCarouselContent = observer((props: ImageCarouselProps) => {
  const {
    images,
    activeIndex: controlledIndex,
    onIndexChange,
    onDelete,
    showDeleteButton = false,
  } = props;

  const carouselStore = useMemo(() => new CarouselHeightStore(), []);
  const [loadedUrls, setLoadedUrls] = useState<Set<string>>(new Set());
  const [internalIndex, setInternalIndex] = useState(0);
  const activeIndex = controlledIndex ?? internalIndex;

  const handleImageLoad = useCallback(
    (url: string, height: number) => {
      const imageIndex = images.indexOf(url);
      if (imageIndex !== -1) {
        carouselStore.setSlideHeight(imageIndex, height);
      }
      setLoadedUrls((prev) => new Set([...prev, url]));
    },
    [images, carouselStore],
  );

  const handleSlideChange = useCallback(
    (index: number) => {
      setInternalIndex(index);
      carouselStore.setActiveIndex(index);
      onIndexChange?.(index);
    },
    [onIndexChange, carouselStore],
  );

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    onDelete(activeIndex);
    const newIndex =
      activeIndex >= images.length - 1 && activeIndex > 0
        ? activeIndex - 1
        : activeIndex;
    setInternalIndex(newIndex);
    carouselStore.setActiveIndex(newIndex);
    onIndexChange?.(newIndex);
  }, [onDelete, activeIndex, images.length, onIndexChange, carouselStore]);

  if (images.length === 0) {
    return null;
  }

  const carouselHeight = carouselStore.activeSlideHeight;

  return (
    <div className={classes.wrapper} data-tab-swipe-lock="true">
      <Carousel
        withControls={false}
        withIndicators={images.length > 1}
        emblaOptions={{
          loop: true,
          containScroll: 'trimSnaps',
          duration: 50,
          dragFree: false,
          inViewThreshold: 0.5,
        }}
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
        style={{
          height: carouselHeight > 0 ? carouselHeight : undefined,
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
});

export const ImageCarousel = (props: ImageCarouselProps) => {
  return <ImageCarouselContent {...props} />;
};
