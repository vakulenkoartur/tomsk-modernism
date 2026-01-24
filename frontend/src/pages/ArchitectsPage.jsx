import { useArchitects } from '../hooks/useArchitects';
import Gallery from '../components/Gallery';
import Banner from '../components/Banner';

export default function ArchitectsPage() {
  const { architects, loading } = useArchitects();

  if (loading) return <div className="container" style={{padding: '40px 0'}}>Загрузка...</div>;

  return (
    <>
      <div className="container">
        <Gallery items={architects} type="architect" title="АРХИТЕКТОРЫ" />
      </div>
    </>
  );
}
