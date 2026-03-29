import { useState } from 'react';
import { Platform, StyleSheet, Switch, Image } from 'react-native';

import { Collapsible } from '@/components/ui/collapsible';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';

export default function GuideScreen() {
  const [emergencyEnabled, setEmergencyEnabled] = useState(true);

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A7C7E7', dark: '#1F3A5F' }}
      headerImage={
        <Image
          source={require('@/assets/images/safety.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Parent Guide
        </ThemedText>
      </ThemedView>
      <ThemedText>Welcome to the Child Safety App. Here is a quick guide to help you navigate and use the essential features for your child's security.</ThemedText>
      
      <Collapsible title="App Navigation Flow">
        <ThemedText>
          When you first open the app, you will start at the <ThemedText type="defaultSemiBold">Login</ThemedText> or <ThemedText type="defaultSemiBold">Signup</ThemedText> page.
        </ThemedText>
        <ThemedText style={{ marginTop: 8 }}>
          Once authenticated, you will be directed to the <ThemedText type="defaultSemiBold">Live Tracking Map</ThemedText> where you can see your child's real-time location. From there, you can access the <ThemedText type="defaultSemiBold">Activity</ThemedText> dashboard to view their movement history and track exact times.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Live Tracking & Activity">
        <ThemedText>
          The <ThemedText type="defaultSemiBold">Live Tracking</ThemedText> page continuously updates the geographical position of your child's device using high-precision GPS.
        </ThemedText>
        <ThemedText style={{ marginTop: 8 }}>
          In the <ThemedText type="defaultSemiBold">Activity</ThemedText> tab, you can intuitively review historical routes, the duration spent at specific locations, and overall movement trends.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Safe Zones & Help Areas">
        <ThemedText>
          You can define <ThemedText type="defaultSemiBold">Safe Zones</ThemedText> such as home or school. If your child leaves these boundaries, you will receive an instant alert.
        </ThemedText>
        <ThemedText style={{ marginTop: 8 }}>
          The app automatically highlights public <ThemedText type="defaultSemiBold">Help Zones</ThemedText>, including nearby Police Stations, Hospitals, and designated safe shelters, so your child knows exactly where to go in an emergency.
        </ThemedText>
      </Collapsible>

      <Collapsible title="Emergency Call Settings">
        <ThemedText>
          Configure the quick SOS trigger for your child's device. When enabled, a designated combination of button presses on their phone will immediately call the authorities and alert you.
        </ThemedText>
        <ThemedView style={styles.settingRow}>
          <ThemedText type="defaultSemiBold">Enable Emergency SOS</ThemedText>
          <Switch 
            value={emergencyEnabled} 
            onValueChange={setEmergencyEnabled} 
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={Platform.OS === 'ios' ? '#FFFFFF' : emergencyEnabled ? '#f5dd4b' : '#f4f3f4'}
          />
        </ThemedView>
        <ThemedText style={{ marginTop: 8, fontSize: 13, color: 'gray' }}>
          * When disabled, the emergency shortcut on the child's device will be inactive.
        </ThemedText>
      </Collapsible>

    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    bottom: 0,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(150, 150, 150, 0.1)',
    borderRadius: 8,
  }
});
