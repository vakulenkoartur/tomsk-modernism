import { useObjects } from '../hooks/useObjects';
import Gallery from '../components/Gallery';
import Banner from '../components/Banner';

export default function ObjectsPage() {
  const { objects, loading } = useObjects();

  if (loading) return <div className="container" style={{padding: '40px 0'}}>Загрузка...</div>;

  return (
    <>
      <div className="container">
        <Gallery items={objects} type="object" title="ОБЪЕКТЫ" />
      </div>
    </>
  );
}
