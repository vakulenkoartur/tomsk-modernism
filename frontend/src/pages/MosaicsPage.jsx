import { useMosaics } from '../hooks/useMosaics';
import Gallery from '../components/Gallery';
import Banner from '../components/Banner';

export default function MosaicsPage() {
  const { mosaics, loading } = useMosaics();

  if (loading) return <div className="container" style={{padding: '40px 0'}}>Загрузка...</div>;

  return (
    <>
      <div className="container">
        <Gallery items={mosaics} type="mosaic" title="МОЗАИКИ" />
      </div>
    </>
  );
}
