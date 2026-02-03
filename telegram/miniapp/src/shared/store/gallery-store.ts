import { makeAutoObservable, runInAction } from 'mobx';

export interface GalleryPhoto {
  id: string;
  base64: string;
  name: string;
  addedAt: number;
  isLoading?: boolean;
}

const MAX_PHOTOS = 10;

export class GalleryStore {
  photos: GalleryPhoto[] = [];
  selectionOrder: string[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // === Photo Management ===

  addPhotos = async (files: File[]): Promise<void> => {
    const remainingSlots = MAX_PHOTOS - this.photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    const placeholders: GalleryPhoto[] = filesToAdd.map((file) => ({
      id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      base64: '',
      name: file.name,
      addedAt: Date.now(),
      isLoading: true,
    }));

    runInAction(() => {
      this.photos.push(...placeholders);
      this.selectionOrder.push(...placeholders.map((p) => p.id));
    });

    filesToAdd.forEach(async (file, index) => {
      try {
        const base64 = await this.fileToBase64(file);
        const placeholderId = placeholders[index].id;

        runInAction(() => {
          const photo = this.photos.find((p) => p.id === placeholderId);
          if (photo) {
            photo.base64 = base64;
            photo.isLoading = false;
          }
        });
      } catch (error) {
        console.error('Error adding photo:', error);
        this.removePhoto(placeholders[index].id);
      }
    });
  };

  removePhoto = (id: string): void => {
    runInAction(() => {
      this.photos = this.photos.filter((p) => p.id !== id);
      this.selectionOrder = this.selectionOrder.filter((sid) => sid !== id);
    });
  };

  toggleSelection = (id: string): void => {
    const index = this.selectionOrder.indexOf(id);
    if (index !== -1) {
      this.selectionOrder.splice(index, 1);
    } else {
      this.selectionOrder.push(id);
    }
  };

  getSelectionNumber = (id: string): number => {
    const index = this.selectionOrder.indexOf(id);
    return index !== -1 ? index + 1 : 0;
  };

  selectAll = (): void => {
    this.selectionOrder = this.photos.map((p) => p.id);
  };

  deselectAll = (): void => {
    this.selectionOrder = [];
  };

  reorderPhotos = (oldIndex: number, newIndex: number): void => {
    if (oldIndex === newIndex) return;

    runInAction(() => {
      const reordered = [...this.photos];
      const [movedItem] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, movedItem);
      this.photos = reordered;
      this.selectionOrder = this.photos.map((p) => p.id);
    });

    console.log('completed');
  };

  clearAll = (): void => {
    runInAction(() => {
      this.photos = [];
      this.selectionOrder = [];
    });
  };

  // === Computed ===

  get selectedPhotos(): GalleryPhoto[] {
    return this.selectionOrder
      .map((id) => this.photos.find((p) => p.id === id))
      .filter((p): p is GalleryPhoto => p !== undefined);
  }

  get selectedCount(): number {
    return this.selectionOrder.length;
  }

  get canAddMore(): boolean {
    return this.photos.length < MAX_PHOTOS;
  }

  get remainingSlots(): number {
    return MAX_PHOTOS - this.photos.length;
  }

  // === Helpers ===

  private fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxSize = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = reader.result as string;
      };
      reader.onerror = reject;
    });
  };
}

export const galleryStore = new GalleryStore();
