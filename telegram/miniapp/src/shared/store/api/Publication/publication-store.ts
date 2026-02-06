import { makeAutoObservable } from 'mobx';
import {
  CreatePublicationRequest,
  PresignItem,
  PresignRequest,
  Publication,
  createPublication,
  presignImages,
} from 'shared/api/service/Publication';

export type LoadingStep =
  | 'idle'
  | 'presigning'
  | 'uploading'
  | 'creating'
  | 'success';

export class PublicationStore {
  isLoading = false;
  loadingStep: LoadingStep = 'idle';
  uploadProgress = 0; // 0-100
  error: string | null = null;
  createdPublication: Publication | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  createPublicationAction = async (
    imageFiles: File[],
    publicationData: Omit<CreatePublicationRequest, 'imageUrls'>,
  ): Promise<void> => {
    try {
      this.isLoading = true;
      this.error = null;
      this.uploadProgress = 0;

      this.loadingStep = 'presigning';

      const presignRequest: PresignRequest = {
        files: imageFiles.map((file) => ({
          contentType: file.type || 'image/jpeg',
        })),
      };

      const presignResponse = await presignImages(presignRequest);

      this.uploadProgress = 25;

      this.loadingStep = 'uploading';

      const publicUrls = await this.uploadFilesToS3(
        imageFiles,
        presignResponse.items,
      );

      this.uploadProgress = 75;

      this.loadingStep = 'creating';

      const finalRequest: CreatePublicationRequest = {
        ...publicationData,
        imageUrls: publicUrls,
      };

      const publication = await createPublication(finalRequest);

      this.createdPublication = publication;
      this.uploadProgress = 100;
      this.loadingStep = 'success';
    } catch (error) {
      this.error =
        error instanceof Error ? error.message : 'Неизвестная ошибка';
      this.loadingStep = 'idle';
      throw error;
    } finally {
      this.isLoading = false;
    }
  };

  private uploadFilesToS3 = async (
    files: File[],
    presignItems: PresignItem[],
  ): Promise<string[]> => {
    if (files.length !== presignItems.length) {
      throw new Error('Files and presign items count mismatch');
    }

    const publicUrls: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const item = presignItems[i];

      try {
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.open('PUT', item.uploadUrl, true);
          xhr.setRequestHeader('Content-Type', item.headers['Content-Type']);

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              publicUrls.push(item.publicUrl);
              resolve();
            } else {
              reject(new Error(`S3 upload failed: ${xhr.statusText}`));
            }
          };

          xhr.onerror = () => {
            reject(new Error('Network error during upload'));
          };

          xhr.send(file);
        });

        const progressIncrement = 50 / files.length;
        this.uploadProgress = 25 + progressIncrement * (i + 1);
      } catch (error) {
        throw new Error(`Не удалось загрузить файл ${file.name}`);
      }
    }

    return publicUrls;
  };

  reset = (): void => {
    this.isLoading = false;
    this.loadingStep = 'idle';
    this.uploadProgress = 0;
    this.error = null;
    this.createdPublication = null;
  };

  get loadingText(): string {
    switch (this.loadingStep) {
      case 'presigning':
        return 'Подготовка загрузки...';
      case 'uploading':
        return 'Загрузка изображений...';
      case 'creating':
        return 'Создание публикации...';
      case 'success':
        return 'Готово!';
      default:
        return '';
    }
  }
}
