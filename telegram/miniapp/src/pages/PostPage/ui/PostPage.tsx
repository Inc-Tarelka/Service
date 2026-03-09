import {
  ActionIcon,
  Button,
  Drawer,
  LoadingOverlay,
  TextInput,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { CollaboratorsList } from 'entities/collaborator';
import { GalleryList } from 'entities/gallery';
import { PostForm } from 'entities/post';
import { AddCollaborators, AddNeeds, NeedDrawer } from 'features/post';
import { EditNeedPreviewDrawer } from 'features/post/ui/EditNeedPreviewDrawer/EditNeedPreviewDrawer';
import { NeedPreviewDrawer } from 'features/post/ui/NeedPreviewDrawer/NeedPreviewDrawer';
import { observer } from 'mobx-react-lite';
import { Activity, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PostCollaborator, PostNeed } from 'shared/api/service/Post/types';
import type { CreatePublicationRequest } from 'shared/api/service/Publication';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import SearchIcon from 'shared/assets/tabbar-icons/search';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useBackButton } from 'shared/hooks/useBackButton';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { ImageCarousel } from 'shared/ui/ImageCarousel';
import { Page } from 'widgets/Page';
import { DEFAULT_STEP, PostStep, VALID_STEPS } from '../lib/constants';
import classes from './PostPage.module.scss';

export const PostPage = observer(() => {
  const { galleryStore, postStore, publicationStore } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useBackButton();

  const rawStep = searchParams.get('step');
  const step: PostStep = VALID_STEPS.includes(rawStep as PostStep)
    ? (rawStep as PostStep)
    : DEFAULT_STEP;

  const citiesData = referenceStore.cities.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const publicationTagsData = referenceStore.publicationTags.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  const needsTagsData = referenceStore.needsTags.map((t) => ({
    value: String(t.id),
    label: t.name,
  }));

  const { searchUsersStore } = useStore();

  const filteredUsers = searchUsersStore.users;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      galleryStore.addPhotos(Array.from(files));
      openGallerySheet();
    }
    e.target.value = '';
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteImage = (index: number) => {
    const photoId = galleryStore.selectedPhotos[index]?.id;
    if (photoId) {
      galleryStore.removePhoto(photoId);
    }
  };

  const [needDrawerOpened, { open: openNeedDrawer, close: closeNeedDrawer }] =
    useDisclosure(false);

  const [
    gallerySheetOpened,
    { open: openGallerySheet, close: closeGallerySheet },
  ] = useDisclosure(false);

  const handleCloseGallerySheet = () => {
    galleryStore.clearAll();
    closeGallerySheet();
  };

  const [
    needPreviewOpened,
    { open: openNeedPreview, close: closeNeedPreview },
  ] = useDisclosure(false);

  const [editNeedOpened, { open: openEditNeed, close: closeEditNeed }] =
    useDisclosure(false);

  const [selectedNeed, setSelectedNeed] = useState<PostNeed | null>(null);

  const handleNeedClick = (need: PostNeed) => {
    setSelectedNeed(need);
    openNeedPreview();
  };

  const handleEditNeed = () => {
    openEditNeed();
  };

  const handleSaveEditedNeed = (updatedNeed: PostNeed) => {
    console.log('Save edited need:', updatedNeed);
    // TODO: Update logic here
    closeEditNeed();
  };

  const handleDeleteNeed = () => {
    console.log('Delete need');
    // TODO: Delete logic here
    closeEditNeed();
    closeNeedPreview();
  };

  const handlePublish = async () => {
    try {
      const imageFiles = await Promise.all(
        galleryStore.selectedPhotos.map(async (photo, index) => {
          const response = await fetch(photo.base64);
          const blob = await response.blob();
          return new File([blob], photo.name || `image-${index}.jpg`, {
            type: blob.type || 'image/jpeg',
          });
        }),
      );

      const publicationData: Omit<CreatePublicationRequest, 'imageUrls'> = {
        name: postStore.formValues.title,
        type: postStore.formValues.type === 'project' ? 'PROJECT' : 'SERVICE',
        description: postStore.formValues.description || undefined,
        cityId: postStore.formValues.cityId
          ? Number(postStore.formValues.cityId)
          : undefined,
        tagIds: [],
        coAuthorIds: [],
        needs: postStore.needs.map((need) => ({
          name: need.title,
          description: need.description,
          budget: need.budget ? Number(need.budget) : undefined,
          deadlineStart: need.startDate?.toISOString(),
          deadlineEnd: need.endDate?.toISOString(),
          tagIds: [],
        })),
      };
      await publicationStore.createPublicationAction(
        imageFiles,
        publicationData,
      );
      galleryStore.clearAll();
      postStore.resetPostData();
      navigate(RoutePath.profile);
    } catch (error) {
      console.error('Failed to publish:', error);
    }
  };

  const selectedImages = galleryStore.selectedPhotos.map((p) => p.base64);

  return (
    <Page noPaddingBottom className={classes.page}>
      <LoadingOverlay
        visible={publicationStore.isLoading}
        overlayProps={{ blur: 2 }}
        loaderProps={{
          children: (
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 500,
                  marginBottom: '8px',
                }}
              >
                {publicationStore.loadingText}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  color: 'var(--text-color-secondary)',
                }}
              >
                {Math.round(publicationStore.uploadProgress)}%
              </div>
            </div>
          ),
        }}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className={classes.fileInput}
        onChange={handleFileChange}
      />

      <Activity mode={step === 'creating' ? 'visible' : 'hidden'}>
        <div className={classes.scrollContent}>
          {selectedImages.length === 0 ? (
            <div className={classes.emptyPhotoState} onClick={handleAddMore}>
              <PlusIcon />
            </div>
          ) : (
            <ImageCarousel
              images={selectedImages}
              activeIndex={postStore.carouselIndex}
              onIndexChange={postStore.setCarouselIndex}
              onDelete={handleDeleteImage}
              showDeleteButton
            />
          )}

          <PostForm
            values={postStore.formValues}
            onChange={postStore.setFormValue}
            citiesData={citiesData}
            tagsData={publicationTagsData}
            onCitiesDropdownOpen={() => referenceStore.getCitiesAction()}
            onTagsDropdownOpen={() => {
              referenceStore.getPublicationTagsAction();
            }}
            citiesLoading={referenceStore.citiesData?.state === 'pending'}
            tagsLoading={
              referenceStore.publicationTagsData?.state === 'pending'
            }
          />

          <AddCollaborators
            collaborators={postStore.collaborators}
            onUserSelect={(user) => {
              const newCollaborator: PostCollaborator = {
                id: user.id.toString(),
                name: user.person
                  ? `${user.person.name} ${user.person.surname}`.trim()
                  : user.username,
                avatarUrl: user.logo_url,
                profession: user.specializations?.[0]?.name,
                city: user.cities?.[0]?.name,
                status: 'pending',
              };
              postStore.addCollaborator(newCollaborator);
            }}
            onRemove={postStore.removeCollaborator}
          />

          <AddNeeds
            needs={postStore.needs}
            onAdd={openNeedDrawer}
            onRemove={postStore.removeNeed}
            tagsData={needsTagsData}
            onNeedClick={handleNeedClick}
          />
        </div>

        <div className={classes.footer}>
          <Button
            onClick={handlePublish}
            fullWidth
            radius="xl"
            variant="filled"
            size="lg"
            disabled={
              !postStore.formValues.title || !postStore.formValues.cityId
            }
            bg="var(--accent-color)"
            c="var(--bg-color)"
          >
            Опубликовать
          </Button>
        </div>
      </Activity>

      <Activity mode={step === 'collaborators' ? 'visible' : 'hidden'}>
        <div className={classes.searchHeader}>
          <TextInput
            value={postStore.searchQuery}
            onChange={(e) => {
              postStore.setSearchQuery(e.target.value);
              searchUsersStore.searchUsersAction({ q: e.target.value });
            }}
            placeholder="Поиск"
            rightSection={<SearchIcon className={classes.searchIcon} />}
            radius={16}
            size="lg"
            classNames={{ input: classes.searchInput }}
          />
        </div>

        <div className={classes.scrollContent}>
          <CollaboratorsList collaborators={filteredUsers} />
        </div>
      </Activity>

      <NeedDrawer
        opened={needDrawerOpened}
        onClose={closeNeedDrawer}
        onSubmit={postStore.addNeed}
        tagsData={needsTagsData}
        onTagsDropdownOpen={() => referenceStore.getNeedsTagsAction()}
        tagsLoading={referenceStore.needsTagsData?.state === 'pending'}
      />

      <NeedPreviewDrawer
        opened={needPreviewOpened}
        onClose={closeNeedPreview}
        onEdit={handleEditNeed}
        need={selectedNeed}
        tagsData={needsTagsData}
      />

      <EditNeedPreviewDrawer
        opened={editNeedOpened}
        onClose={closeEditNeed}
        onSave={handleSaveEditedNeed}
        onDelete={handleDeleteNeed}
        need={selectedNeed}
        tagsData={needsTagsData}
        onTagsDropdownOpen={() => referenceStore.getNeedsTagsAction()}
        tagsLoading={referenceStore.needsTagsData?.state === 'pending'}
      />

      <Drawer
        opened={gallerySheetOpened}
        onClose={handleCloseGallerySheet}
        position="bottom"
        size="100%"
        withCloseButton={false}
        classNames={{
          body: classes.gallerySheetBody,
          content: 'drawer-fulldevice',
        }}
      >
        {galleryStore.photos.length > 0 && (
          <GalleryList
            photos={galleryStore.photos}
            getSelectionNumber={galleryStore.getSelectionNumber}
            onToggle={() => {}}
            onReorder={galleryStore.reorderPhotos}
            selectedCount={galleryStore.selectedCount}
            canAddMore={galleryStore.canAddMore}
            onAddMore={handleAddMore}
          />
        )}

        <div className={classes.gallerySheetFooter}>
          <ActionIcon
            onClick={handleCloseGallerySheet}
            variant="outline"
            size={48}
            radius="16"
          >
            <XIcon />
          </ActionIcon>
          <Button
            onClick={closeGallerySheet}
            fullWidth
            radius="xl"
            variant="filled"
            size="lg"
            bg="var(--accent-color)"
            c="var(--bg-color)"
          >
            Добавить
          </Button>
        </div>
      </Drawer>
    </Page>
  );
});

export default PostPage;
