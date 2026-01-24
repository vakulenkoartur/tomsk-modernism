import { useParams, useNavigate } from 'react-router-dom';
import { useObjects } from '../hooks/useObjects';
import { useArchitects } from '../hooks/useArchitects';
import { useMosaics } from '../hooks/useMosaics';
import { API_URL } from '../api/client';
import ArticleBlocks from '../components/ArticleBlocks';

const TYPE_CONFIG = {
  object: {
    itemsKey: 'objects',
    title: 'Объект не найден',
    hasMap: true,
  },
  architect: {
    itemsKey: 'architects',
    title: 'Архитектор не найден',
    hasMap: false,
  },
  mosaic: {
    itemsKey: 'mosaics',
    title: 'Мозаика не найдена',
    hasMap: true,
  },
};

export default function DetailsPage({ type }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { objects } = useObjects();
  const { architects } = useArchitects();
  const { mosaics } = useMosaics();

  const config = TYPE_CONFIG[type] || TYPE_CONFIG.object;
  const itemsMap = { objects, architects, mosaics };
  const items = itemsMap[config.itemsKey] || [];

  const item = items.find((i) => String(i.id) === String(id));

  if (!item) {
    return (
      <div className="container" style={{ padding: '40px 0' }}>
        <p>{config.title}. Проверьте ссылку или вернитесь в список.</p>
      </div>
    );
  }

  const imageUrl = item.image
    ? item.image.startsWith('http')
      ? item.image
      : `${API_URL}${item.image}`
    : null;

  const recommended = items
    .filter((i) => i.id !== item.id)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const handleAddressClick = () => {
    if (type === 'object' || type === 'mosaic') {
      navigate('/map', { state: { focusItemId: item.id, focusItemType: type } });
    }
  };

  const renderMeta = () => {
    if (type === 'object') {
      return (
        <>
          <p><b>Архитектор:</b> {item.architect || 'N/A'}</p>
          <p><b>Год:</b> {item.year || 'N/A'}</p>
          <p>
            <b>Адрес:</b>{' '}
            <button
              type="button"
              className="link-button"
              onClick={handleAddressClick}
            >
              {item.address}
            </button>
          </p>
        </>
      );
    }

    if (type === 'architect') {
      return <p><b>Годы жизни:</b> {item.years || 'N/A'}</p>;
    }

    return (
      <p>
        <b>Адрес:</b>{' '}
        {item.location ? (
          <button type="button" className="link-button" onClick={handleAddressClick}>
            {item.location}
          </button>
        ) : (
          'N/A'
        )}
      </p>
    );
  };

  const renderDesc = () => {
    if (type === 'architect') return item.bio;
    return item.desc;
  };

  const renderRecommendedMeta = (rec) => {
    if (type === 'object') {
      return (
        <>
          {rec.architect} {rec.year && `- ${rec.year}`}
        </>
      );
    }
    if (type === 'architect') return rec.years;
    return rec.location;
  };

  const recommendedPath = (rec) => {
    if (type === 'architect') return `/architects/${rec.id}`;
    if (type === 'mosaic') return `/mosaics/${rec.id}`;
    return `/objects/${rec.id}`;
  };

  return (
    <main className="details-page">
      {imageUrl && (
        <section className="details-hero">
          <div className="details-hero-media">
            <img src={imageUrl} alt={item.name} />
          </div>
        </section>
      )}

      <section className="details-info">
        <div className="details-col">
          <h2 className="details-title">{item.name}</h2>
          <div className="details-meta">{renderMeta()}</div>
          {renderDesc() && <p className="details-desc">{renderDesc()}</p>}
        </div>
      </section>

      <section className="details-article">
        <ArticleBlocks blocks={item.articleBlocks} />
      </section>

      {recommended.length > 0 && (
        <section className="details-recommended">
          <div className="details-col">
            <h3 className="detail-subtitle">Рекомендуем</h3>
            <div className="gallery-grid">
              {recommended.map((rec) => (
                <div
                  key={rec.id}
                  className="card"
                  onClick={() => navigate(recommendedPath(rec))}
                >
                  <div className="card-image">
                    {rec.image ? (
                      <img
                        src={rec.image.startsWith('http') ? rec.image : `${API_URL}${rec.image}`}
                        alt={rec.name}
                      />
                    ) : (
                      <div className="card-image-placeholder">Нет изображения: {rec.name}</div>
                    )}
                  </div>
                  <div className="card-content">
                    <div className="card-title">{rec.name}</div>
                    <div className="card-meta">
                      {renderRecommendedMeta(rec)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
