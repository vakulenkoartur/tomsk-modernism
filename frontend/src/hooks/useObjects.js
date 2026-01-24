import { useState, useEffect } from 'react';
import { apiGet, apiForm, apiDelete } from '../api/client';

export function useObjects() {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchObjects = async () => {
    setLoading(true);
    try {
      const data = await apiGet('/api/objects');
      setObjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addObject = async (formData) => {
    try {
      const newObject = await apiForm('/api/objects', 'POST', formData);
      setObjects([...objects, newObject]);
      return newObject;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateObject = async (id, formData) => {
    try {
      const updated = await apiForm(`/api/objects/${id}`, 'PUT', formData);
      setObjects(objects.map(o => o.id === id ? updated : o));
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteObject = async (id) => {
    try {
      await apiDelete(`/api/objects/${id}`);
      setObjects(objects.filter(o => o.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  return { objects, loading, error, addObject, updateObject, deleteObject, refetch: fetchObjects };
}
