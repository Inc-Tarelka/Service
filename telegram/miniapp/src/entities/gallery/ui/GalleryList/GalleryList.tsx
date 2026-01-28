import PlusIcon from 'shared/assets/icons/plus';
import { GalleryPhoto } from '../../model/types';
import { GalleryItem } from '../GalleryItem/GalleryItem';
import classes from './GalleryList.module.scss';

interface GalleryListProps {
  photos: GalleryPhoto[];
  getSelectionNumber: (id: string) => number;
  onToggle: (id: string) => void;
  maxPhotos?: number;
  selectedCount: number;
  canAddMore?: boolean;
  onAddMore?: () => void;
}

export const GalleryList = (props: GalleryListProps) => {
  const {
    photos,
    getSelectionNumber,
    onToggle,
    maxPhotos = 10,
    selectedCount,
    canAddMore = false,
    onAddMore,
  } = props;

  return (
    <div>
      <div className={classes.header}>
        <span className={classes.title}>Галлерея</span>
        <span className={classes.count}>
          {selectedCount}/{maxPhotos}
        </span>
      </div>
      <div className={classes.grid}>
        {photos.map((photo) => (
          <GalleryItem
            key={photo.id}
            photo={photo}
            selectionNumber={getSelectionNumber(photo.id)}
            onToggle={onToggle}
          />
        ))}
        {canAddMore && onAddMore && (
          <button className={classes.addMoreButton} onClick={onAddMore}>
            <PlusIcon />
          </button>
        )}
      </div>
    </div>
  );
};
