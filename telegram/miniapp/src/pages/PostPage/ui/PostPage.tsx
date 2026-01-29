import { Button, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useStore } from 'app/StoreProvider';
import { CollaboratorsList } from 'entities/collaborator';
import { GalleryList } from 'entities/gallery';
import { PostForm } from 'entities/post';
import { AddCollaborators, AddNeeds, NeedDrawer } from 'features/post';
import { observer } from 'mobx-react-lite';
import { motion } from 'motion/react';
import { Activity, useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PostCollaborator,
  PostNeed,
  PostType,
} from 'shared/api/service/Post/types';
import SearchIcon from 'shared/assets/tabbar-icons/search';
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
  const { galleryStore } = useStore();
  const [searchParams, setSearchParams] = useSearchParams();
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

  const [formValues, setFormValues] = useState({
    title: '',
    description: '',
    type: 'project' as PostType,
    tagIds: [] as string[],
    cityId: '',
  });

  const [collaborators, setCollaborators] = useState<PostCollaborator[]>([]);
  const [needs, setNeeds] = useState<PostNeed[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const citiesData = referenceStore.cities.map((c) => ({
    value: String(c.id),
    label: c.name,
  }));

  const filteredUsers = searchQuery
    ? MOCK_USERS.filter((u) =>
        `${u.firstName} ${u.lastName}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      )
    : MOCK_USERS;

  useEffect(() => {
    if (step === 'gallery') {
      const timer = setTimeout(() => {
        if (galleryStore.photos.length === 0) {
          fileInputRef.current?.click();
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [step, galleryStore.photos.length]);

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

  const handleFormChange = <K extends keyof typeof formValues>(
    field: K,
    value: (typeof formValues)[K],
  ) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleDeleteImage = (index: number) => {
    const photoId = galleryStore.selectedPhotos[index]?.id;
    if (photoId) {
      galleryStore.toggleSelection(photoId);
    }
  };

  const handleAddCollaborator = () => {
    setSearchQuery('');
    goToStep('collaborators');
  };

  const handleSelectCollaborator = (userId: string) => {
    const user = MOCK_USERS.find((u) => u.id === userId);
    if (user && !collaborators.find((c) => c.id === userId)) {
      const newCollaborator: PostCollaborator = {
        id: String(user.id),
        name: `${user.firstName} ${user.lastName}`,
        profession: user.profession || '',
        city: user.city || '',
        avatarUrl: user.avatarUrl,
        status: 'pending',
      };
      setCollaborators((prev) => [...prev, newCollaborator]);
    }
    goToStep('creating');
  };

  const handleRemoveCollaborator = (id: string) => {
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
  };

  const [needDrawerOpened, { open: openNeedDrawer, close: closeNeedDrawer }] =
    useDisclosure(false);

  const handleAddNeed = () => {
    openNeedDrawer();
  };

  const handleSubmitNeed = (need: PostNeed) => {
    setNeeds((prev) => [...prev, need]);
  };

  const handleRemoveNeed = (index: number) => {
    setNeeds((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePublish = () => {
    console.log('Publishing:', {
      images: galleryStore.selectedPhotos.map((p) => p.base64),
      ...formValues,
      collaboratorIds: collaborators.map((c) => c.id),
      needs,
    });
  };

  const selectedImages = galleryStore.selectedPhotos.map((p) => p.base64);

  return (
    <Page className={classes.page}>
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
              onToggle={galleryStore.toggleSelection}
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
            activeIndex={carouselIndex}
            onIndexChange={setCarouselIndex}
            onDelete={handleDeleteImage}
            showDeleteButton
          />

          <PostForm
            values={formValues}
            onChange={handleFormChange}
            citiesData={citiesData}
            tagsData={tagsData}
            onCitiesDropdownOpen={() => referenceStore.getCitiesAction()}
            citiesLoading={referenceStore.citiesData?.state === 'pending'}
          />

          <AddCollaborators
            collaborators={collaborators}
            onAdd={handleAddCollaborator}
            onRemove={handleRemoveCollaborator}
          />

          <AddNeeds
            needs={needs}
            onAdd={handleAddNeed}
            onRemove={handleRemoveNeed}
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
            disabled={!formValues.title || !formValues.cityId}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
        onSubmit={handleSubmitNeed}
        tagsData={tagsData}
      />
    </Page>
  );
});

export default PostPage;
