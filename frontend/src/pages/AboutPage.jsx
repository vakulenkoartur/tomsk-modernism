import Banner from '../components/Banner';

export default function AboutPage() {
  return (
    <>
      <Banner title="О ПРОЕКТЕ" />
      <div className="container">
        <div className="gallery">
          <div style={{padding: '40px 0', textAlign: 'center', fontSize: '14px', lineHeight: '1.8'}}>
            <p>Этот сайт посвящен исследованию и популяризации советского модернизма в Томске.</p>
            <p>Здесь вы найдете информацию о зданиях, архитекторах и деталях модернистской архитектуры.</p>
          </div>
        </div>
      </div>
    </>
  );
}
