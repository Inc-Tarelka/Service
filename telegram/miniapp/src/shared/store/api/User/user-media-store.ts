import { makeAutoObservable } from 'mobx';
import {
  confirmUserLogo,
  confirmUserWallpaper,
  presignUserLogo,
  presignUserWallpaper,
  setUserLogoUrl,
  setUserWallpaperUrl,
} from 'shared/api/service/User';

export type UserMediaLoadingStep =
  | 'idle'
  | 'presigning'
  | 'uploading'
  | 'confirming'
  | 'success';

export class UserMediaStore {
  isLoading = false;
  loadingStep: UserMediaLoadingStep = 'idle';
  error: string | null = null;
  logoUrl: string | null = null;
  wallpaperUrl: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  uploadLogo = async (userId: number, file: File): Promise<void> => {
    try {
      this.isLoading = true;
      this.error = null;

      this.loadingStep = 'presigning';
      const presign = await presignUserLogo(userId, {
        contentType: file.type || 'image/jpeg',
      });

      this.loadingStep = 'uploading';
      await this.uploadToS3(file, presign.uploadUrl, presign.headers);

      this.loadingStep = 'confirming';
      const result = await confirmUserLogo(userId, {
        key: presign.key,
        mimeType: file.type || 'image/jpeg',
        size: file.size,
      });

      this.logoUrl = result.logoUrl;
      this.loadingStep = 'success';
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Не удалось загрузить логотип';
      this.loadingStep = 'idle';
      throw error;
    } finally {
      this.isLoading = false;
    }
  };

  uploadWallpaper = async (userId: number, file: File): Promise<void> => {
    try {
      this.isLoading = true;
      this.error = null;

      this.loadingStep = 'presigning';
      const presign = await presignUserWallpaper(userId, {
        contentType: file.type || 'image/jpeg',
      });

      this.loadingStep = 'uploading';
      await this.uploadToS3(file, presign.uploadUrl, presign.headers);

      this.loadingStep = 'confirming';
      const result = await confirmUserWallpaper(userId, {
        key: presign.key,
        mimeType: file.type || 'image/jpeg',
        size: file.size,
      });

      this.wallpaperUrl = result.wallpaperUrl;
      this.loadingStep = 'success';
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Не удалось загрузить обложку';
      this.loadingStep = 'idle';
      throw error;
    } finally {
      this.isLoading = false;
    }
  };

  setLogoFromUrl = async (userId: number, logoUrl: string): Promise<void> => {
    try {
      this.isLoading = true;
      this.error = null;
      await setUserLogoUrl(userId, logoUrl);
      this.logoUrl = logoUrl;
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Не удалось установить логотип';
      throw error;
    } finally {
      this.isLoading = false;
    }
  };

  setWallpaperFromUrl = async (
    userId: number,
    wallpaperUrl: string,
  ): Promise<void> => {
    try {
      this.isLoading = true;
      this.error = null;
      await setUserWallpaperUrl(userId, wallpaperUrl);
      this.wallpaperUrl = wallpaperUrl;
    } catch (error) {
      this.error =
        error instanceof Error
          ? error.message
          : 'Не удалось установить обложку';
      throw error;
    } finally {
      this.isLoading = false;
    }
  };

  private uploadToS3 = async (
    file: File,
    uploadUrl: string,
    headers: Record<string, string>,
  ): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadUrl, true);

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value);
      });

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`S3 upload failed: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => reject(new Error('Network error during upload'));
      xhr.send(file);
    });
  };

  reset = (): void => {
    this.isLoading = false;
    this.loadingStep = 'idle';
    this.error = null;
    this.logoUrl = null;
    this.wallpaperUrl = null;
  };

  get loadingText(): string {
    switch (this.loadingStep) {
      case 'presigning':
        return 'Подготовка загрузки...';
      case 'uploading':
        return 'Загрузка файла...';
      case 'confirming':
        return 'Сохранение...';
      case 'success':
        return 'Готово!';
      default:
        return '';
    }
  }
}
