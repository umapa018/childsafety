import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
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

  // Safe zone definition — matches what the ESP8266 checks against
  const SAFE_ZONE = {
    latitude: 12.9977,
    longitude: 80.0972,
    radiusKm: 0.5, // 500 metres
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
