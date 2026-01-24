import { useState } from 'react';
import { API_URL } from '../../api/client';

const MAX_IMAGES = 5;

export default function ArticleEditor({ value, onChange, type }) {
  const [uploadingId, setUploadingId] = useState(null);
  const blocks = Array.isArray(value) ? value : [];

  const updateBlocks = (next) => {
    if (onChange) onChange(next);
  };

  const handleAddBlock = () => {
    updateBlocks([...blocks, { id: Date.now(), text: '', images: [] }]);
  };

  const handleRemoveBlock = (id) => {
    updateBlocks(blocks.filter((block) => block.id !== id));
  };

  const handleTextChange = (id, text) => {
    updateBlocks(blocks.map((block) => (block.id === id ? { ...block, text } : block)));
  };

  const handleRemoveImage = (id, index) => {
    updateBlocks(
      blocks.map((block) => {
        if (block.id !== id) return block;
        const nextImages = block.images.filter((_, i) => i !== index);
        return { ...block, images: nextImages };
      })
    );
  };

  const handleImagesChange = async (id, files) => {
    const block = blocks.find((item) => item.id === id);
    if (!block) return;
    const currentCount = block.images.length;
    const fileList = Array.from(files).slice(0, MAX_IMAGES - currentCount);
    if (fileList.length === 0) return;

    const formData = new FormData();
    formData.append('type', type);
    fileList.forEach((file) => formData.append('images', file));

    try {
      setUploadingId(id);
      const response = await fetch(`${API_URL}/api/uploads`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Не удалось загрузить изображения.');
      }
      const data = await response.json();
      const newImages = Array.isArray(data.files) ? data.files : [];
      updateBlocks(
        blocks.map((item) => {
          if (item.id !== id) return item;
          return { ...item, images: [...item.images, ...newImages] };
        })
      );
    } catch (error) {
      alert(error.message);
    } finally {
      setUploadingId(null);
    }
  };

  const resolveImageUrl = (value) => {
    if (!value) return '';
    return value.startsWith('http') ? value : `${API_URL}${value}`;
  };

  return (
    <div className="article-editor">
      <div className="article-editor-header">
        <h4 className="card-form-title">Статья</h4>
        <button type="button" className="btn btn-small" onClick={handleAddBlock}>
          Добавить абзац
        </button>
      </div>

      {blocks.length === 0 && <div className="article-empty">Абзацев пока нет.</div>}

      {blocks.map((block, index) => (
        <div key={block.id} className="article-editor-block">
          <div className="article-editor-top">
            <div className="article-editor-title">Абзац {index + 1}</div>
            <button
              type="button"
              className="btn btn-small btn-delete"
              onClick={() => handleRemoveBlock(block.id)}
            >
              Удалить
            </button>
          </div>

          <div className="article-editor-media">
            {block.images.length > 0 && (
              <div className="article-editor-thumbs">
                {block.images.map((img, imgIndex) => (
                  <div key={`${block.id}-${imgIndex}`} className="article-thumb">
                    <img src={resolveImageUrl(img)} alt="" />
                    <button
                      type="button"
                      className="article-thumb-remove"
                      onClick={() => handleRemoveImage(block.id, imgIndex)}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="article-upload">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(event) => handleImagesChange(block.id, event.target.files)}
                disabled={uploadingId === block.id || block.images.length >= MAX_IMAGES}
              />
              {uploadingId === block.id
                ? 'Загрузка...'
                : block.images.length >= MAX_IMAGES
                  ? `Можно до ${MAX_IMAGES} фото`
                  : 'Загрузить фото'}
            </label>
          </div>

          <textarea
            className="form-textarea"
            placeholder="Текст абзаца"
            value={block.text}
            onChange={(event) => handleTextChange(block.id, event.target.value)}
          />
        </div>
      ))}
    </div>
  );
}
