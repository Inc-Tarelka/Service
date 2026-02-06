import type { SearchPublication } from 'shared/api/service/Publication';
import s from './ProfileListingItem.module.scss';

interface ProfileListingItemProps {
  publication: SearchPublication;
  onClick?: (id: number) => void;
}

export const ProfileListingItem = (props: ProfileListingItemProps) => {
  const { publication, onClick } = props;
  const author = publication.coAuthors?.[0];
  const mainImage = publication.images?.[0]?.url;
  const tags = publication.tags?.length > 0 && (
    <div className={s.tags}>
      {publication.tags.slice(0, 3).map((tag) => (
        <span key={tag.id} className={s.tag}>
          {tag.name}
        </span>
      ))}
    </div>
  );

  return (
    <div className={s.container} onClick={() => onClick?.(publication.id)}>
      <div
        className={s.image}
        style={{
          backgroundImage: mainImage ? `url(${mainImage})` : undefined,
        }}
      />
      <div className={s.content}>
        <h3 className={s.name}>{author?.username || 'Аноним'}</h3>
        <p className={s.bio}>{author?.bio || publication.description}</p>
        {tags}
      </div>
    </div>
  );
};
