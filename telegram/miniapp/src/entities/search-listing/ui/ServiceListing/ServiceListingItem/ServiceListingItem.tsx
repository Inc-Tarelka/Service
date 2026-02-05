import type { SearchPublication } from 'shared/api/service/Publication';
import LikeIcon from 'shared/assets/icons/like';
import s from './ServiceListingItem.module.scss';

interface ServiceListingItemProps {
  publication: SearchPublication;
  onClick?: (id: number) => void;
}

export const ServiceListingItem = (props: ServiceListingItemProps) => {
  const { publication, onClick } = props;
  const mainImage = publication.images?.[0]?.url;
  return (
    <div className={s.container} onClick={() => onClick?.(publication.id)}>
      <div
        className={s.image}
        style={{
          backgroundImage: mainImage ? `url(${mainImage})` : undefined,
        }}
      />
      <div className={s.content}>
        <h3 className={s.title}>{publication.name}</h3>
        {publication.description && (
          <p className={s.description}>{publication.description}</p>
        )}
        <div className={s.footer}>
          {publication.tags?.length > 0 && (
            <div className={s.tags}>
              {publication.tags.slice(0, 2).map((tag) => (
                <span key={tag.id} className={s.tag}>
                  {tag.name}
                </span>
              ))}
            </div>
          )}
          <span className={s.likes}>
            <LikeIcon ClassNames={s.icon} /> {publication.likesCount}
          </span>
        </div>
      </div>
    </div>
  );
};
