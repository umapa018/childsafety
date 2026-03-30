import { Text, StyleSheet } from 'react-native';

export default function StatusBadge({ status }: any) {
  return (
    <Text style={[styles.badge, status === "SAFE" ? styles.safe : styles.alert]}>
      {status}
    </Text>
  );
}

const styles = StyleSheet.create({
  badge: {
    padding: 5,
    borderRadius: 5,
    fontWeight: 'bold',
  },
  safe: {
    backgroundColor: '#d4edda',
    color: 'green',
  },
  alert: {
    backgroundColor: '#f8d7da',
    color: 'red',
  },
});