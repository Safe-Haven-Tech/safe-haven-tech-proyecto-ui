import React, { useEffect, useState } from 'react';
import { obtenerSeguidores } from '../../../services/redSocialServices';

export default function FollowersList({ usuarioId }) {
  const [seguidores, setSeguidores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    obtenerSeguidores(usuarioId)
      .then(data => setSeguidores(data.seguidores || []))
      .finally(() => setLoading(false));
  }, [usuarioId]);

  if (loading) return <div>Cargando seguidores...</div>;
 

  return (
    <div>
      
      <ul>
        
      </ul>
    </div>
  );
}