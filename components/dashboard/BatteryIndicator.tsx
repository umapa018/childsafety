import { View, Text, StyleSheet } from 'react-native';

export default function BatteryIndicator({ level = 78 }: any) {
  return (
    <View style={styles.container}>
      <Text>🔋 {level}%</Text>
      <View style={styles.bar}>
        <View style={[styles.fill, { width: `${level}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 5,
  },
  bar: {
    height: 6,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginTop: 3,
  },
  fill: {
    height: 6,
    backgroundColor: 'green',
    borderRadius: 5,
  },
});