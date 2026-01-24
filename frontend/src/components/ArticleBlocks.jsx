import { API_URL } from '../api/client';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const resolveImageUrl = (value) => {
  if (!value) return '';
  return value.startsWith('http') ? value : `${API_URL}${value}`;
};

function ArticleBlock({ block }) {
  const images = Array.isArray(block.images) ? block.images : [];
  const slides = images.length === 2 ? [...images, ...images] : images;
  const hasSlider = images.length > 1;
  const sliderSettings = {
    arrows: true,
    centerMode: true,
    centerPadding: '100px',
    infinite: slides.length > 1,
    slidesToShow: 1,
    slidesToScroll: 1,
    adaptiveHeight: true,
    speed: 400,
    focusOnSelect: true,
    responsive: [
      { breakpoint: 768, settings: { centerPadding: '50px' } },
    ],
  };

  return (
    <div className="article-block">
      {slides.length > 0 && (
        hasSlider ? (
          <div className="article-media-full">
            <div className="article-media article-media--slider">
              <Slider className="article-slider" {...sliderSettings}>
                {slides.map((img, idx) => (
                  <div key={`${block.id || 'block'}-${idx}`}>
                    <div className="article-slide">
                      <img src={resolveImageUrl(img)} alt="" />
                    </div>
                  </div>
                ))}
              </Slider>
            </div>
          </div>
        ) : (
          <div className="details-col">
            <div className="article-media article-media--single">
              <img src={resolveImageUrl(slides[0])} alt="" />
            </div>
          </div>
        )
      )}
      {block.text && (
        <div className="details-col">
          <p className="article-text">{block.text}</p>
        </div>
      )}
    </div>
  );
}

export default function ArticleBlocks({ blocks }) {
  if (!Array.isArray(blocks) || blocks.length === 0) return null;

  return (
    <section className="article-section">
      {blocks.map((block, idx) => (
        <ArticleBlock key={block.id || idx} block={block} />
      ))}
    </section>
  );
}
