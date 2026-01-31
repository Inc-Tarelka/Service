import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Image } from '@mantine/core';
import { GalleryPhoto } from '../../model/types';
import classes from './GalleryItem.module.scss';

interface GalleryItemProps {
  photo: GalleryPhoto;
  selectionNumber: number;
  onToggle: (id: string) => void;
}

export const GalleryItem = (props: GalleryItemProps) => {
  const { photo, selectionNumber, onToggle } = props;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(photo.id);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classes.item}
      onClick={handleClick}
      onContextMenu={(e) => e.preventDefault()}
      {...attributes}
      {...listeners}
    >
      <Image
        src={photo.base64}
        alt={photo.name}
        className={classes.image}
        loading="lazy"
        draggable={false}
      />
      <div
        className={`${classes.numberBadge} ${selectionNumber > 0 ? classes.selected : ''}`}
      >
        {selectionNumber > 0 ? selectionNumber : ''}
      </div>
    </div>
  );
};
