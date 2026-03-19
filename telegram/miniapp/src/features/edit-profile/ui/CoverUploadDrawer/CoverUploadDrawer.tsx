import { ActionIcon, Button, Drawer, Group, Loader, Text } from '@mantine/core';
import { useStore } from 'app/StoreProvider';
import { observer } from 'mobx-react-lite';
import { useCallback, useEffect, useRef, useState } from 'react';
import XIcon from 'shared/assets/icons/x';
import classes from './CoverUploadDrawer.module.scss';

interface CoverUploadDrawerProps {
  opened: boolean;
  onClose: () => void;
  userId: number;
  currentCoverUrl?: string;
  autoOpenPicker?: boolean;
}

interface ImageState {
  url: string;
  file: File;
  offsetX: number;
  offsetY: number;
  scale: number;
}

const CROP_W = 340;
const CROP_H = Math.round(CROP_W * (583 / 1500));
const EXPORT_W = 1500;
const EXPORT_H = 583;
const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
];

export const CoverUploadDrawer = observer((props: CoverUploadDrawerProps) => {
  const { opened, onClose, userId, currentCoverUrl, autoOpenPicker } = props;
  const { userMediaStore, userStore } = useStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [imageState, setImageState] = useState<ImageState | null>(null);
  const dragStart = useRef<{
    x: number;
    y: number;
    offsetX: number;
    offsetY: number;
  } | null>(null);
  const lastTouchDist = useRef<number | null>(null);
  const autoPickerFired = useRef(false);

  useEffect(() => {
    if (!opened) {
      setImageState(null);
      autoPickerFired.current = false;
    }
  }, [opened]);

  useEffect(() => {
    if (opened && autoOpenPicker && !autoPickerFired.current) {
      autoPickerFired.current = true;
      const timer = setTimeout(() => fileInputRef.current?.click(), 350);
      return () => clearTimeout(timer);
    }
  }, [opened, autoOpenPicker]);

  const clampOffset = useCallback(
    (offsetX: number, offsetY: number, scale: number) => {
      const img = imgRef.current;
      if (!img) return { offsetX, offsetY };
      const maxX = Math.max(0, (img.offsetWidth * scale - CROP_W) / 2);
      const maxY = Math.max(0, (img.offsetHeight * scale - CROP_H) / 2);
      return {
        offsetX: Math.min(Math.max(offsetX, -maxX), maxX),
        offsetY: Math.min(Math.max(offsetY, -maxY), maxY),
      };
    },
    [],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) return;
    const url = URL.createObjectURL(file);
    const tempImg = new Image();
    tempImg.onload = () => {
      const cw = containerRef.current?.offsetWidth ?? window.innerWidth;
      const renderedH = cw * (tempImg.naturalHeight / tempImg.naturalWidth);
      const initialScale = Math.max(1, CROP_W / cw, CROP_H / renderedH);
      setImageState({ url, file, offsetX: 0, offsetY: 0, scale: initialScale });
    };
    tempImg.src = url;
    e.target.value = '';
  };

  const handleAreaClick = () => {
    if (!imageState) fileInputRef.current?.click();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageState) return;
    e.preventDefault();
    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: imageState.offsetX,
      offsetY: imageState.offsetY,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragStart.current || !imageState) return;
    const { offsetX, offsetY } = clampOffset(
      dragStart.current.offsetX + e.clientX - dragStart.current.x,
      dragStart.current.offsetY + e.clientY - dragStart.current.y,
      imageState.scale,
    );
    setImageState((prev) => (prev ? { ...prev, offsetX, offsetY } : prev));
  };

  const handleMouseUp = () => {
    dragStart.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!imageState) return;
    if (e.touches.length === 1) {
      dragStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        offsetX: imageState.offsetX,
        offsetY: imageState.offsetY,
      };
    } else if (e.touches.length === 2) {
      lastTouchDist.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!imageState) return;
    e.preventDefault();
    if (e.touches.length === 1 && dragStart.current) {
      const { offsetX, offsetY } = clampOffset(
        dragStart.current.offsetX + e.touches[0].clientX - dragStart.current.x,
        dragStart.current.offsetY + e.touches[0].clientY - dragStart.current.y,
        imageState.scale,
      );
      setImageState((prev) => (prev ? { ...prev, offsetX, offsetY } : prev));
    } else if (e.touches.length === 2 && lastTouchDist.current !== null) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      const delta = dist / lastTouchDist.current;
      lastTouchDist.current = dist;
      setImageState((prev) => {
        if (!prev || !imgRef.current) return prev;
        const img = imgRef.current;
        const minScale = Math.max(
          CROP_W / img.offsetWidth,
          CROP_H / img.offsetHeight,
        );
        const newScale = Math.min(Math.max(prev.scale * delta, minScale), 5);
        const { offsetX, offsetY } = clampOffset(
          prev.offsetX,
          prev.offsetY,
          newScale,
        );
        return { ...prev, scale: newScale, offsetX, offsetY };
      });
    }
  };

  const handleTouchEnd = () => {
    dragStart.current = null;
    lastTouchDist.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (!imageState || !imgRef.current) return;
    const img = imgRef.current;
    const minScale = Math.max(
      CROP_W / img.offsetWidth,
      CROP_H / img.offsetHeight,
    );
    const factor = e.deltaY > 0 ? 0.93 : 1.07;
    setImageState((prev) => {
      if (!prev) return prev;
      const newScale = Math.min(Math.max(prev.scale * factor, minScale), 5);
      const { offsetX, offsetY } = clampOffset(
        prev.offsetX,
        prev.offsetY,
        newScale,
      );
      return { ...prev, scale: newScale, offsetX, offsetY };
    });
  };

  const handleSave = async () => {
    if (!imageState || !imgRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = EXPORT_W;
    canvas.height = EXPORT_H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const viewW = containerRef.current?.offsetWidth ?? window.innerWidth;
    const viewH = containerRef.current?.offsetHeight ?? window.innerHeight;
    const img = imgRef.current;
    const renderedW = img.offsetWidth * imageState.scale;
    const renderedH = img.offsetHeight * imageState.scale;
    const srcX =
      ((viewW - CROP_W) / 2 -
        (viewW / 2 + imageState.offsetX) +
        renderedW / 2) *
      (img.naturalWidth / renderedW);
    const srcY =
      ((viewH - CROP_H) / 2 -
        (viewH / 2 + imageState.offsetY) +
        renderedH / 2) *
      (img.naturalHeight / renderedH);
    const srcW = CROP_W * (img.naturalWidth / renderedW);
    const srcH = CROP_H * (img.naturalHeight / renderedH);

    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, EXPORT_W, EXPORT_H);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        const croppedFile = new File([blob], 'cover.jpg', {
          type: 'image/jpeg',
        });
        await userMediaStore.uploadWallpaper(userId, croppedFile);
        if (userMediaStore.wallpaperUrl) {
          userStore.setLocalOverride({
            wallpaper_url: userMediaStore.wallpaperUrl,
          });
        }
        userStore.getProfileAction();
        onClose();
      },
      'image/jpeg',
      0.92,
    );
  };

  const isLoading = userMediaStore.isLoading;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="bottom"
      size="100%"
      withCloseButton={false}
      classNames={{ content: 'drawer-fulldevice' }}
      styles={{
        content: { borderRadius: '32px 32px 0 0', overflow: 'hidden' },
        body: { padding: 0, height: '100%' },
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className={classes.wrapper}>
        <div className={classes.header}>
          <Text className={classes.sizeHint}>
            Рекомендуемый размер 1500×583 px
          </Text>
          <ActionIcon
            variant="transparent"
            onClick={onClose}
            className={classes.closeBtn}
          >
            <XIcon />
          </ActionIcon>
        </div>

        <div
          ref={containerRef}
          className={classes.canvasArea}
          onClick={handleAreaClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onWheel={handleWheel}
        >
          {imageState ? (
            <img
              ref={imgRef}
              src={imageState.url}
              className={classes.image}
              draggable={false}
              style={{
                transform: `translate(calc(-50% + ${imageState.offsetX}px), calc(-50% + ${imageState.offsetY}px)) scale(${imageState.scale})`,
              }}
              alt=""
            />
          ) : currentCoverUrl ? (
            <img
              src={currentCoverUrl}
              className={classes.image}
              draggable={false}
              style={{ transform: 'translate(-50%, -50%)' }}
              alt=""
            />
          ) : (
            <div className={classes.placeholder}>
              <Text className={classes.placeholderText}>
                Нажмите, чтобы выбрать фото
              </Text>
            </div>
          )}

          <div
            className={classes.cropOverlay}
            style={{ width: CROP_W, height: CROP_H }}
          />

          {imageState && (
            <Text className={classes.hint}>
              Перетащите для изменения позиции
            </Text>
          )}
        </div>

        <div className={classes.footer}>
          <Group gap={12}>
            <Button
              flex={1}
              radius={16}
              h={52}
              variant="outline"
              className={classes.secondaryBtn}
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {imageState ? 'Выбрать другое' : 'Выбрать фото'}
            </Button>

            {imageState && (
              <Button
                flex={1}
                radius={16}
                h={52}
                className={classes.primaryBtn}
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader size={20} color="var(--bg-color)" />
                ) : (
                  'Сохранить'
                )}
              </Button>
            )}
          </Group>

          {userMediaStore.error && (
            <Text className={classes.errorText}>{userMediaStore.error}</Text>
          )}
        </div>
      </div>
    </Drawer>
  );
});
