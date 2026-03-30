import { View, Text, StyleSheet } from 'react-native';

export default function ChildCard() {
  const status = "SAFE"; // change to ALERT to test

  return (
    <View style={styles.card}>
      <Text style={styles.name}>👦 Arun</Text>

      <Text style={[styles.status, status === "SAFE" ? styles.safe : styles.alert]}>
        {status}
      </Text>

      <View style={styles.row}>
        <Text>🔋 Battery: 78%</Text>
        <Text>📡 GPS: Strong</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    margin: 10,
    padding: 15,
    borderRadius: 12,
    elevation: 3,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  status: {
    marginTop: 5,
    fontSize: 14,
  },

  safe: {
    color: 'green',
  },

  alert: {
    color: 'red',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});