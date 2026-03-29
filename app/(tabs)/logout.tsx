import { useEffect } from 'react';
import { useRouter } from 'expo-router';

export default function LogoutScreen() {
  const router = useRouter();

  useEffect(() => {
    // Instantly replace the route to the login screen without saving history.
    router.replace('/');
  }, []);

  return null;
}
