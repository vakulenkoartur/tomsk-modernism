import Card from './Card';

export default function Gallery({ items, type = 'object', title = '' }) {
  return (
    <div className="gallery">
      {title && <h2 className="gallery-title">{title}</h2>}
      <div className="gallery-grid">
        {items && items.map(item => (
          <Card key={item.id} item={item} type={type} />
        ))}
      </div>
    </div>
  );
}
