import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Platform,
  Dimensions,
  ScrollView,
  Switch,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";

const HOME_LOC = { latitude: 12.9977, longitude: 80.0972 }; // Kundrathur

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return (R * c).toFixed(1);
}

export default function MapScreen() {
  const [activeTab, setActiveTab] = useState("Map");
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // useMemo prevents children from getting new random photos on every small re-render
  const children = useMemo(() => {
    const kids = [
      { 
        id: 1, 
        name: "Arun", 
        loc: { latitude: 12.8904, longitude: 80.0779 }, // Vandalur
        status: "At School",
        seed: Math.floor(Math.random() * 1000) 
      },
      { 
        id: 2, 
        name: "Aditi", 
        loc: { latitude: 13.0541, longitude: 80.2836 }, // Marina Beach
        status: "At Beach",
        seed: Math.floor(Math.random() * 1000) 
      },
    ];
    return kids.map(k => ({
      ...k,
      distance: getDistanceInKm(HOME_LOC.latitude, HOME_LOC.longitude, k.loc.latitude, k.loc.longitude)
    }));
  }, []);

  const makeSOSCall = () => {
    Linking.openURL('tel:100'); // Triggers the dialer
  };

  // --- SCREEN RENDERS ---

  const renderMap = () => (
    <View style={styles.content}>
      {Platform.OS !== "web" ? (
        <MapView
          style={styles.map}
          // Only force Google on Android. iOS will default to Apple Maps which works instantly without an API key. 
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={{
            latitude: 12.9716,
            longitude: 80.18,
            latitudeDelta: 0.4,
            longitudeDelta: 0.4,
          }}
        >
          <Marker coordinate={HOME_LOC} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.childMarkerWrapper}>
              <View style={styles.homeMarker}>
                <Ionicons name="home" size={24} color="white" />
              </View>
              <View style={styles.nameTag}>
                <Text style={styles.homeTagText}>Kundrathur (Home)</Text>
              </View>
            </View>
          </Marker>

          {children.map((child) => (
            <React.Fragment key={child.id}>
              <Marker 
                coordinate={child.loc} 
                anchor={{ x: 0.5, y: 1 }}
                onPress={() => Alert.alert(`${child.name}'s Location`, `${child.distance} km away from Home (Kundrathur)`)}
              >
                <View style={styles.childMarkerWrapper}>
                  <Image 
                    source={{ uri: `https://picsum.photos/seed/${child.seed}/200/200` }} 
                    style={styles.childPhoto} 
                  />
                  <View style={styles.nameTag}>
                    <Text style={styles.nameTagText}>{child.name} • {child.distance} km</Text>
                  </View>
                </View>
              </Marker>
              <Circle 
                center={child.loc} 
                radius={1500} 
                fillColor="rgba(79, 70, 229, 0.1)" 
                strokeColor="#4f46e5" 
              />
            </React.Fragment>
          ))}
        </MapView>
      ) : (
        <View style={styles.webFallback}>
          <Text>Map View - Chennai (Mobile Only)</Text>
        </View>
      )}
      <View style={styles.floatingHeader}>
        <Text style={styles.statusText}>🟢 Both Children are Safe</Text>
      </View>
    </View>
  );

  const renderActivity = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.pageTitle}>Live Activity</Text>
      {children.map(child => (
        <View key={child.id} style={styles.listCard}>
          <View style={styles.activityAvatarWrapper}>
             <Image source={{ uri: `https://picsum.photos/seed/${child.seed}/100/100` }} style={styles.activityAvatar} />
          </View>
          <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.boldText}>{child.name} • {child.status}</Text>
            <Text style={styles.subText}>{child.distance} km from Home</Text>
          </View>
          <Text style={styles.statusBadge}>Live</Text>
        </View>
      ))}
    </ScrollView>
  );

  const renderZones = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.pageTitle}>Geofence Management</Text>
      <View style={[styles.listCard, { borderLeftColor: '#10b981', borderLeftWidth: 6 }]}>
        <View style={{flex: 1}}>
          <Text style={styles.boldText}>Vandalur School Zone</Text>
          <Text style={styles.subText}>Safe Zone • 1.5km Radius</Text>
        </View>
        <Ionicons name="shield-checkmark" size={24} color="#10b981" />
      </View>
      <View style={[styles.listCard, { borderLeftColor: '#ef4444', borderLeftWidth: 6 }]}>
        <View style={{flex: 1}}>
          <Text style={styles.boldText}>Marina Beach Coast</Text>
          <Text style={styles.subText}>Danger Zone • Alerts Enabled</Text>
        </View>
        <Ionicons name="warning" size={24} color="#ef4444" />
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.content}>
      <Text style={styles.pageTitle}>Security Settings</Text>
      <View style={styles.listCard}>
        <View>
          <Text style={styles.boldText}>Push Notifications</Text>
          <Text style={styles.subText}>Alert on zone entry/exit</Text>
        </View>
        <Switch value={alertsEnabled} onValueChange={setAlertsEnabled} trackColor={{ true: '#4f46e5' }} />
      </View>
      
      <TouchableOpacity style={styles.sosButton} onPress={makeSOSCall}>
        <Ionicons name="call" size={24} color="white" />
        <Text style={styles.sosText}>IMMEDIATE SOS CALL</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Dynamic Screen Area */}
      {activeTab === "Map" && renderMap()}
      {activeTab === "Activity" && renderActivity()}
      {activeTab === "Zones" && renderZones()}
      {activeTab === "Settings" && renderSettings()}

      {/* Bottom Navigation */}
      <View style={styles.tabs}>
        <Tab icon="map" label="Map" active={activeTab === "Map"} onPress={() => setActiveTab("Map")} />
        <Tab icon="pulse" label="Activity" active={activeTab === "Activity"} onPress={() => setActiveTab("Activity")} />
        <Tab icon="location" label="Zones" active={activeTab === "Zones"} onPress={() => setActiveTab("Zones")} />
        <Tab icon="settings" label="Settings" active={activeTab === "Settings"} onPress={() => setActiveTab("Settings")} />
      </View>
    </SafeAreaView>
  );
}

// --- SUB-COMPONENTS ---

const Tab = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? "#4f46e5" : "#9ca3af"} />
    <Text style={[styles.tabLabel, { color: active ? "#4f46e5" : "#9ca3af" }]}>{label}</Text>
  </TouchableOpacity>
);

// --- STYLES ---

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  webFallback: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Header
  floatingHeader: { position: 'absolute', top: 20, alignSelf: 'center', backgroundColor: 'white', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, elevation: 5, shadowOpacity: 0.1 },
  statusText: { fontWeight: 'bold', color: '#10b981' },
  
  // Page Titles
  pageTitle: { fontSize: 26, fontWeight: '800', padding: 20, color: '#111827' },
  
  // List Items
  listCard: { backgroundColor: 'white', marginHorizontal: 15, marginVertical: 8, padding: 20, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  boldText: { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  subText: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  statusBadge: { backgroundColor: '#e0e7ff', color: '#4f46e5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  
  // Activity Avatars
  activityAvatarWrapper: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#eee', overflow: 'hidden' },
  activityAvatar: { width: '100%', height: '100%' },

  // Marker Styles
  homeMarker: { backgroundColor: '#10b981', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 5 },
  childMarkerWrapper: { alignItems: 'center', justifyContent: 'center', paddingBottom: 5 },
  childPhoto: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: 'white', backgroundColor: '#ddd' },
  nameTag: { backgroundColor: 'white', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, elevation: 4 },
  nameTagText: { fontSize: 12, fontWeight: '800', color: '#1f2937' },
  homeTagText: { fontSize: 12, fontWeight: '800', color: '#10b981' },

  // Settings & Buttons
  sosButton: { backgroundColor: '#ef4444', margin: 20, padding: 20, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  sosText: { color: 'white', fontWeight: '800', fontSize: 18, marginLeft: 10 },

  // Navigation Tabs
  tabs: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "white", paddingVertical: 12, paddingBottom: Platform.OS === 'ios' ? 30 : 15, borderTopWidth: 1, borderColor: "#e5e7eb" },
  tabItem: { alignItems: "center" },
  tabLabel: { fontSize: 11, marginTop: 4, fontWeight: '600' }
});
