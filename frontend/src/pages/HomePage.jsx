import Banner from '../components/Banner';

export default function HomePage() {
  return (
    <>
      <Banner />
      <div className="container">
        <div className="content-section">
          <div className="content-text">
            <h2>О проекте</h2>
            <p>
              4 ноября 1955 года вышло постановление ЦК КПСС и СМ СССР об устранении 
              излишеств в архитектуре. Эта дата является рождением советского модернизма.
            </p>
            <p>
              Советский архитектурный модернизм развивался по одному принципу, четко 
              фиксированному — в каждом городе и регионе существуют свои особенности 
              данного направления.
            </p>
          </div>
          <div className="content-image">
            {/* Вставьте сюда картинку, если есть */}
            [Фото здания]
          </div>
        </div>
      </div>
    </>
  );
}
