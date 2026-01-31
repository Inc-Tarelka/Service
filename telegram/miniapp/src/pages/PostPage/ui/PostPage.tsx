import { Button, LoadingOverlay, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { CollaboratorsList } from 'entities/collaborator';
import { GalleryList } from 'entities/gallery';
import { PostForm } from 'entities/post';
import { AddCollaborators, AddNeeds, NeedDrawer } from 'features/post';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Activity, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PostCollaborator } from 'shared/api/service/Post/types';
import type { CreatePublicationRequest } from 'shared/api/service/Publication';
import SearchIcon from 'shared/assets/tabbar-icons/search';
import { RoutePath } from 'shared/config/routeConfig/routeConfig';
import { useBackButton } from 'shared/hooks/useBackButton';
import { tagsData } from 'shared/mocks/tagsMock';
import { MOCK_USERS } from 'shared/mocks/userListMocks';
import { referenceStore } from 'shared/store/api/Reference/reference-store';
import { ImageCarousel } from 'shared/ui/ImageCarousel';
import { Page } from 'widgets/Page';
import classes from './PostPage.module.scss';

type PostStep = 'gallery' | 'creating' | 'collaborators';

const VALID_STEPS: PostStep[] = ['gallery', 'creating', 'collaborators'];
const DEFAULT_STEP: PostStep = 'gallery';

export const PostPage = observer(() => {
  const { galleryStore, postStore, publicationStore } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  useBackButton();

  const rawStep = searchParams.get('step');
  const step: PostStep = VALID_STEPS.includes(rawStep as PostStep)
    ? (rawStep as PostStep)
    : DEFAULT_STEP;

  const goToStep = useCallback(
    (nextStep: PostStep) => {
      setSearchParams({ step: nextStep });
    },
    [setSearchParams],
  );

  const citiesData = referenceStore.cities.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const filteredUsers = postStore.searchQuery
    ? MOCK_USERS.filter((u) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(postStore.searchQuery.toLowerCase()),
      )
    : MOCK_USERS;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await galleryStore.addPhotos(Array.from(files));
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

  const handleAddCollaborator = () => {
    postStore.setSearchQuery('');
    goToStep('collaborators');
  };

  const handleSelectCollaborator = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user) {
      const newCollaborator: PostCollaborator = {
        id: String(user.id),
        name: `${user.firstName} ${user.lastName}`,
        profession: user.profession || '',
        city: user.city || '',
        avatarUrl: user.avatarUrl,
        status: 'pending',
      };
      postStore.addCollaborator(newCollaborator);
    }
    goToStep('creating');
  };

  const [needDrawerOpened, { open: openNeedDrawer, close: closeNeedDrawer }] =
    useDisclosure(false);

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

      <Activity mode={step === 'gallery' ? 'visible' : 'hidden'}>
        <div className={classes.content}>
          {galleryStore.photos.length > 0 ? (
            <GalleryList
              photos={galleryStore.photos}
              getSelectionNumber={galleryStore.getSelectionNumber}
              onToggle={() => {}}
              onReorder={galleryStore.reorderPhotos}
              selectedCount={galleryStore.selectedCount}
              canAddMore={galleryStore.canAddMore}
              onAddMore={handleAddMore}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '32px' }}>
              <p style={{ color: 'var(--text-color-secondary)' }}>
                Выберите фотографии для публикации
              </p>
              <Button onClick={handleAddMore} style={{ marginTop: '16px' }}>
                Выбрать фото
              </Button>
            </div>
          )}
        </div>

        {galleryStore.selectedCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={classes.footer}
          >
            <Button
              onClick={() => goToStep('creating')}
              fullWidth
              radius="xl"
              variant="filled"
              size="lg"
            >
              Дальше
            </Button>
          </motion.div>
        )}
      </Activity>

      <Activity mode={step === 'creating' ? 'visible' : 'hidden'}>
        <div className={classes.scrollContent}>
          <ImageCarousel
            images={selectedImages}
            activeIndex={postStore.carouselIndex}
            onIndexChange={postStore.setCarouselIndex}
            onDelete={handleDeleteImage}
            showDeleteButton
          />

          <PostForm
            values={postStore.formValues}
            onChange={postStore.setFormValue}
            citiesData={citiesData}
            tagsData={tagsData}
            onCitiesDropdownOpen={() => referenceStore.getCitiesAction()}
            citiesLoading={referenceStore.citiesData?.state === 'pending'}
          />

          <AddCollaborators
            collaborators={postStore.collaborators}
            onAdd={handleAddCollaborator}
            onRemove={postStore.removeCollaborator}
          />

          <AddNeeds
            needs={postStore.needs}
            onAdd={openNeedDrawer}
            onRemove={postStore.removeNeed}
            tagsData={tagsData}
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
            onChange={(e) => postStore.setSearchQuery(e.target.value)}
            placeholder="Поиск"
            rightSection={<SearchIcon className={classes.searchIcon} />}
            radius={40}
            size="lg"
            classNames={{ input: classes.searchInput }}
          />
        </div>

        <div className={classes.scrollContent}>
          <CollaboratorsList
            collaborators={filteredUsers}
            onItemClick={handleSelectCollaborator}
          />
        </div>
      </Activity>

      <NeedDrawer
        opened={needDrawerOpened}
        onClose={closeNeedDrawer}
        onSubmit={postStore.addNeed}
        tagsData={tagsData}
      />
    </Page>
  );
});

export default PostPage;
