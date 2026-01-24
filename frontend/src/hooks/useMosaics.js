import { useState, useEffect } from 'react';
import { apiGet, apiForm, apiDelete } from '../api/client';

export function useMosaics() {
  const [mosaics, setMosaics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMosaics = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/mosaics');
      setMosaics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addMosaic = async (formData) => {
    try {
      const newMosaic = await apiForm('/api/mosaics', 'POST', formData);
      setMosaics([...mosaics, newMosaic]);
      return newMosaic;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateMosaic = async (id, formData) => {
    try {
      const updated = await apiForm(`/api/mosaics/${id}`, 'PUT', formData);
      setMosaics(mosaics.map(m => m.id === id ? updated : m));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteMosaic = async (id) => {
    try {
      await apiDelete(`/api/mosaics/${id}`);
      setMosaics(mosaics.filter(m => m.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchMosaics();
  }, []);

  return { mosaics, loading, error, addMosaic, updateMosaic, deleteMosaic, refetch: fetchMosaics };
}
