import { useNavigate } from 'react-router-dom';
import { API_URL } from '../api/client';

export default function Card({ item, type = 'object' }) {
  const navigate = useNavigate();

  const getImageUrl = () => {
    if (item.image) {
      return item.image.startsWith('http') ? item.image : `${API_URL}${item.image}`;
    }
    return null;
  };

  const handleClick = () => {
    if (type === 'object') navigate(`/objects/${item.id}`);
    if (type === 'architect') navigate(`/architects/${item.id}`);
    if (type === 'mosaic') navigate(`/mosaics/${item.id}`);
  };

  return (
    <div className="card" onClick={handleClick}>
      <div className="card-image">
        {getImageUrl() ? (
          <img src={getImageUrl()} alt={item.name} />
        ) : (
          <div className="card-image-placeholder">[Фото: {item.name}]</div>
        )}
      </div>
      <div className="card-content">
        <div className="card-title">{item.name}</div>
        <div className="card-desc">
          {type === 'object' && item.desc}
          {type === 'architect' && item.bio}
          {type === 'mosaic' && item.desc}
        </div>
        <div className="card-meta">
          {type === 'object' && item.year}
          {type === 'architect' && item.years}
          {type === 'mosaic' && item.location}
        </div>
      </div>
    </div>
  );
}
