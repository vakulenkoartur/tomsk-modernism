import { useState, useEffect } from 'react';
import { apiGet, apiForm, apiDelete } from '../api/client';

export function useArchitects() {
  const [architects, setArchitects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchArchitects = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/architects');
      setArchitects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addArchitect = async (formData) => {
    try {
      const newArchitect = await apiForm('/api/architects', 'POST', formData);
      setArchitects((prev) => [...prev, newArchitect]);
      return newArchitect;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateArchitect = async (id, formData) => {
    try {
      const updated = await apiForm(`/api/architects/${id}`, 'PUT', formData);
      setArchitects((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteArchitect = async (id) => {
    try {
      await apiDelete(`/api/architects/${id}`);
      setArchitects((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchArchitects();
  }, []);

  return { architects, loading, error, addArchitect, updateArchitect, deleteArchitect, refetch: fetchArchitects };
}
