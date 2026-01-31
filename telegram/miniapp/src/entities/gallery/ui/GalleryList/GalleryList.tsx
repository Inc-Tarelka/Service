import {
  DndContext,
  DragEndEvent,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import PlusIcon from 'shared/assets/icons/plus';
import { GalleryPhoto } from '../../model/types';
import { GalleryItem } from '../GalleryItem/GalleryItem';
import classes from './GalleryList.module.scss';

interface GalleryListProps {
  photos: GalleryPhoto[];
  getSelectionNumber: (id: string) => number;
  onToggle: (id: string) => void;
  onReorder?: (oldIndex: number, newIndex: number) => void;
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
    onReorder,
    maxPhotos = 10,
    selectedCount,
    canAddMore = false,
    onAddMore,
  } = props;

  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 40,
        tolerance: 5,
      },
    }),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && onReorder) {
      const oldIndex = photos.findIndex((p) => p.id === active.id);
      const newIndex = photos.findIndex((p) => p.id === over.id);
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <div>
      <div className={classes.header}>
        <span className={classes.title}>Галлерея</span>
        <span className={classes.count}>
          {selectedCount}/{maxPhotos}
        </span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map((p) => p.id)}
          strategy={rectSortingStrategy}
        >
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
        </SortableContext>
      </DndContext>
    </div>
  );
};
