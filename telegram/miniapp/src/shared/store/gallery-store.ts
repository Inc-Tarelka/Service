import WebApp from '@twa-dev/sdk';
import { makeAutoObservable, runInAction } from 'mobx';

export interface GalleryPhoto {
  id: string;
  base64: string;
  name: string;
  addedAt: number;
}

const STORAGE_KEY = 'gallery_photos';
const MAX_PHOTOS = 10;

export class GalleryStore {
  photos: GalleryPhoto[] = [];
  selectionOrder: string[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
    this.loadFromCloudStorage();
  }

  // === Cloud Storage Methods ===

  loadFromCloudStorage = async (): Promise<void> => {
    this.isLoading = true;

    try {
      if (
        WebApp.CloudStorage &&
        typeof WebApp.CloudStorage.getItems === 'function' &&
        (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
      ) {
        const items: Record<string, string> = await new Promise(
          (resolve, reject) => {
            WebApp.CloudStorage.getItems([STORAGE_KEY], (error, result) => {
              if (error) reject(error);
              else resolve(result || {});
            });
          },
        );

        const data = items?.[STORAGE_KEY];
        if (data && data !== '') {
          const parsed = JSON.parse(data);
          runInAction(() => {
            this.photos = parsed.photos || [];
            this.selectionOrder = parsed.selectionOrder || [];
          });
        }
      } else {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
          const parsed = JSON.parse(data);
          runInAction(() => {
            this.photos = parsed.photos || [];
            this.selectionOrder = parsed.selectionOrder || [];
          });
        }
      }
    } catch (error) {
      console.error('Error loading gallery from storage:', error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  };

  saveToCloudStorage = async (): Promise<void> => {
    try {
      const data = JSON.stringify({
        photos: this.photos,
        selectionOrder: this.selectionOrder,
      });

      if (
        WebApp.CloudStorage &&
        typeof WebApp.CloudStorage.setItem === 'function' &&
        (WebApp.version ? parseFloat(WebApp.version) > 6.0 : false)
      ) {
        await new Promise<void>((resolve, reject) => {
          WebApp.CloudStorage.setItem(STORAGE_KEY, data, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
      } else {
        // Fallback to localStorage
        localStorage.setItem(STORAGE_KEY, data);
      }
    } catch (error) {
      console.error('Error saving gallery to storage:', error);
    }
  };

  // === Photo Management ===

  addPhotos = async (files: File[]): Promise<void> => {
    const remainingSlots = MAX_PHOTOS - this.photos.length;
    const filesToAdd = files.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      try {
        const base64 = await this.fileToBase64(file);
        const photo: GalleryPhoto = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          base64,
          name: file.name,
          addedAt: Date.now(),
        };

        runInAction(() => {
          this.photos.push(photo);
        });
      } catch (error) {
        console.error('Error adding photo:', error);
      }
    }

    await this.saveToCloudStorage();
  };

  removePhoto = async (id: string): Promise<void> => {
    runInAction(() => {
      this.photos = this.photos.filter((p) => p.id !== id);
      this.selectionOrder = this.selectionOrder.filter((sid) => sid !== id);
    });
    await this.saveToCloudStorage();
  };

  toggleSelection = (id: string): void => {
    const index = this.selectionOrder.indexOf(id);
    if (index !== -1) {
      this.selectionOrder.splice(index, 1);
    } else {
      this.selectionOrder.push(id);
    }
    this.saveToCloudStorage();
  };

  getSelectionNumber = (id: string): number => {
    const index = this.selectionOrder.indexOf(id);
    return index !== -1 ? index + 1 : 0;
  };

  selectAll = (): void => {
    this.selectionOrder = this.photos.map((p) => p.id);
    this.saveToCloudStorage();
  };

  deselectAll = (): void => {
    this.selectionOrder = [];
    this.saveToCloudStorage();
  };

  clearAll = async (): Promise<void> => {
    runInAction(() => {
      this.photos = [];
      this.selectionOrder = [];
    });
    await this.saveToCloudStorage();
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
