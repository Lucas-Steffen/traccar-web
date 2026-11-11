import { useEffect, useState } from 'react';
import fetchOrThrow from '../util/fetchOrThrow';

// GET /api/tenants é restrito a administradores; GET /api/tenants/{id}
// permite ao usuário comum ler o próprio tenant (id e name).
const cache = new Map();

const loadTenantName = (id) => {
  if (!cache.has(id)) {
    cache.set(
      id,
      fetchOrThrow(`/api/tenants/${id}`)
        .then((response) => response.json())
        .then((tenant) => tenant.name || '')
        .catch(() => {
          cache.delete(id);
          return '';
        }),
    );
  }
  return cache.get(id);
};

const TenantValue = ({ tenantId }) => {
  const [name, setName] = useState('');

  useEffect(() => {
    let active = true;
    loadTenantName(tenantId).then((value) => {
      if (active) {
        setName(value);
      }
    });
    return () => {
      active = false;
    };
  }, [tenantId]);

  return name;
};

export default TenantValue;
