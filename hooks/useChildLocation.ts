import { off, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';

export interface ChildData {
  location: {
    lat: number;
    lng: number;
  };
  alert: boolean;
}

export function useChildLocation() {
  const [childData, setChildData] = useState<ChildData | null>(null);
  const [isOutsideZone, setIsOutsideZone] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Safe zone — must match ESP8266 config exactly
  const SAFE_ZONE = {
    latitude: 12.970713,   // actual location
    longitude: 80.043253,
    radiusKm: 0.2,         // 200 metres
  };

  useEffect(() => {
    const childRef = ref(db, 'child');

    const unsubscribe = onValue(
      childRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const parsed: ChildData = {
            location: {
              lat: Number(data.location?.lat ?? SAFE_ZONE.latitude),
              lng: Number(data.location?.lng ?? SAFE_ZONE.longitude),
            },
            alert: Boolean(data.alert),
          };
          setChildData(parsed);
          setIsOutsideZone(parsed.alert);
        }
        setLoading(false);
      },
      (err) => {
        console.error('Firebase RTDB error:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      off(childRef);
    };
  }, []);

  return { childData, isOutsideZone, loading, error };
}
