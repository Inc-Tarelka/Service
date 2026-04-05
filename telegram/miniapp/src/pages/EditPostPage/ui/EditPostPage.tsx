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
import { Activity, type ChangeEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import type { PostCollaborator, PostNeed } from 'shared/api/service/Post/types';
import type { UpdatePublicationRequest } from 'shared/api/service/Publication';
import PlusIcon from 'shared/assets/icons/plus';
import XIcon from 'shared/assets/icons/x';
import SearchIcon from 'shared/assets/tabbar-icons/search';
import { useBackButton } from 'shared/hooks/useBackButton';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { ImageCarousel } from 'shared/ui/ImageCarousel';
import { Page } from 'widgets/Page';
import {
  DEFAULT_STEP,
  PostStep,
  VALID_STEPS,
} from '../../PostPage/lib/constants';
import classes from './EditPostPage.module.scss';

export const EditPostPage = observer(() => {
  const { id } = useParams<{ id: string }>();
  const {
    galleryStore,
    postStore,
    publicationStore,
    publicationDetailsStore,
    notificationTeamInviteStore,
    searchUsersStore,
  } = useStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useBackButton();

  const rawStep = searchParams.get('step');
  const step: PostStep = VALID_STEPS.includes(rawStep as PostStep)
    ? (rawStep as PostStep)
    : DEFAULT_STEP;

  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      publicationDetailsStore.getPublicationDetailsAction(Number(id));
    }
    return () => {
      galleryStore.clearAll();
      postStore.resetPostData();
    };
  }, [galleryStore, id, postStore, publicationDetailsStore]);

  useEffect(() => {
    if (initialized) return;
    const data = publicationDetailsStore.data;
    if (!data) return;

    const pub = data.publication;

    postStore.setFormValue('title', pub.name);
    postStore.setFormValue('description', pub.description ?? '');
    postStore.setFormValue(
      'type',
      pub.type === 'PROJECT' ? 'project' : 'service',
    );
    postStore.setFormValue('cityId', pub.cityId ? String(pub.cityId) : '');
    postStore.setFormValue('tagIds', pub.tags?.map((t) => String(t.id)) ?? []);

    const urls = pub.images?.map((img) => img.url) ?? [];
    setExistingImageUrls(urls);

    const coAuthors = data.team?.filter((m) => !m.isAuthor) ?? [];
    postStore.collaborators.splice(0, postStore.collaborators.length);
    coAuthors.forEach((member) => {
      postStore.addCollaborator({
        id: String(member.userId),
        name: `${member.firstName} ${member.lastName}`.trim(),
        avatarUrl: member.avatarUrl,
        profession: member.specialization,
        city: member.cityName,
        status: 'confirmed',
      });
    });

    setInitialized(true);
  }, [publicationDetailsStore.data, initialized, postStore]);

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

  const filteredUsers = searchUsersStore.users;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imageFiles = Array.from(files).filter((f) =>
        f.type.startsWith('image/'),
      );
      if (imageFiles.length > 0) {
        galleryStore.addPhotos(imageFiles);
        openGallerySheet();
      }
    }
    e.target.value = '';
  };

  const handleAddMore = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteExistingImage = (index: number) => {
    setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
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

  const handleSaveEditedNeed = () => {
    closeEditNeed();
  };

  const handleDeleteNeed = () => {
    closeEditNeed();
    closeNeedPreview();
  };

  const handleSave = async () => {
    if (!id) return;
    try {
      const isProjectPublication = postStore.formValues.type === 'project';
      const pendingCollaboratorIds = postStore.collaborators
        .filter((collaborator) => collaborator.status === 'pending')
        .map((collaborator) => Number(collaborator.id))
        .filter((value) => Number.isFinite(value));
      const confirmedCollaboratorIds = postStore.collaborators
        .filter((collaborator) => collaborator.status === 'confirmed')
        .map((collaborator) => Number(collaborator.id))
        .filter((value) => Number.isFinite(value));
      const collaboratorIds = postStore.collaborators
        .map((collaborator) => Number(collaborator.id))
        .filter((value) => Number.isFinite(value));
      const newImageFiles = await Promise.all(
        galleryStore.selectedPhotos.map(async (photo, index) => {
          const response = await fetch(photo.base64);
          const blob = await response.blob();
          return new File([blob], photo.name || `image-${index}.jpg`, {
            type: blob.type || 'image/jpeg',
          });
        }),
      );

      const publicationData: Omit<UpdatePublicationRequest, 'imageUrls'> = {
        name: postStore.formValues.title,
        type: postStore.formValues.type === 'project' ? 'PROJECT' : 'SERVICE',
        description: postStore.formValues.description || undefined,
        cityId: postStore.formValues.cityId
          ? Number(postStore.formValues.cityId)
          : undefined,
        tagIds: postStore.formValues.tagIds.map(Number),
        coAuthorIds: isProjectPublication
          ? confirmedCollaboratorIds
          : collaboratorIds,
        needs: postStore.needs.map((need) => ({
          name: need.title,
          description: need.description,
          budget: need.budget ? Number(need.budget) : undefined,
          deadlineStart: need.startDate?.toISOString(),
          deadlineEnd: need.endDate?.toISOString(),
          tagIds: need.tagIds ? need.tagIds.map(Number) : [],
        })),
      };

      await publicationStore.updatePublicationAction(
        Number(id),
        newImageFiles,
        existingImageUrls,
        publicationData,
      );

      if (isProjectPublication && pendingCollaboratorIds.length > 0) {
        const result = await notificationTeamInviteStore.sendTeamInvitesAction(
          Number(id),
          pendingCollaboratorIds,
        );

        if (result.failedReceiverIds.length > 0) {
          console.error(
            'Failed to send some team invite notifications:',
            result.failedReceiverIds,
          );
        }
      }

      galleryStore.clearAll();
      postStore.resetPostData();
      navigate(-1);
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const allImages = [
    ...existingImageUrls,
    ...galleryStore.selectedPhotos.map((p) => p.base64),
  ];

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
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic,image/heif,image/bmp,image/tiff"
        multiple
        className={classes.fileInput}
        onChange={handleFileChange}
      />

      <Activity mode={step === 'creating' ? 'visible' : 'hidden'}>
        <div className={classes.scrollContent}>
          {allImages.length === 0 ? (
            <div className={classes.emptyPhotoState} onClick={handleAddMore}>
              <PlusIcon />
            </div>
          ) : (
            <ImageCarousel
              images={allImages}
              activeIndex={postStore.carouselIndex}
              onIndexChange={postStore.setCarouselIndex}
              onDelete={(index) => {
                if (index < existingImageUrls.length) {
                  handleDeleteExistingImage(index);
                } else {
                  const newIndex = index - existingImageUrls.length;
                  const photoId = galleryStore.selectedPhotos[newIndex]?.id;
                  if (photoId) galleryStore.removePhoto(photoId);
                }
              }}
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
                name: `${user.name ?? ''} ${user.surname ?? ''}`.trim(),
                avatarUrl: user.logo_url,
                profession: user.specialisation,
                city: user.city?.name,
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
            onClick={handleSave}
            fullWidth
            radius="xl"
            variant="filled"
            size="lg"
            disabled={
              !postStore.formValues.title ||
              !postStore.formValues.cityId ||
              allImages.length === 0
            }
            bg="var(--accent-color)"
            c="var(--bg-color)"
          >
            Сохранить
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

export default EditPostPage;
