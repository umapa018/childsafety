import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "../../components/map/NativeMap";
import { useChildLocation } from "../../hooks/useChildLocation";

const SAFE_ZONE = { latitude: 12.970713, longitude: 80.043253, radiusMetres: 200 };
const SAFE_ZONE_RADIUS_KM = 0.2;

function getDistanceInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapScreen() {
  const [activeTab, setActiveTab] = useState("Map");
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const { childData, isOutsideZone, loading } = useChildLocation();

  // Alert banner pulse animation
  const alertAnim = useRef(new Animated.Value(0)).current;
  const prevAlertRef = useRef(false);

  const childCoord = {
    latitude: childData?.location.lat ?? SAFE_ZONE.latitude,
    longitude: childData?.location.lng ?? SAFE_ZONE.longitude,
  };
  const distanceFromHome = getDistanceInKm(
    SAFE_ZONE.latitude, SAFE_ZONE.longitude,
    childCoord.latitude, childCoord.longitude
  );

  // Trigger alert notification when alert flag flips to true
  useEffect(() => {
    if (isOutsideZone && !prevAlertRef.current && alertsEnabled) {
      // In-app alert dialog
      Alert.alert(
        "🚨 CHILD SAFETY ALERT",
        `Your child has left the safe zone!\n\nCurrent distance: ${distanceFromHome.toFixed(2)} km from home.\n\nTake immediate action.`,
        [
          { text: "Dismiss", style: "cancel" },
          { text: "Call Emergency (100)", onPress: () => Linking.openURL("tel:100") },
        ]
      );
      // Vibrate pattern: --- . --- (SOS-like)
      Vibration.vibrate([500, 200, 500, 200, 500]);
    }
    prevAlertRef.current = isOutsideZone;
  }, [isOutsideZone]);

  // Fade-pulse animation for the alert banner
  useEffect(() => {
    if (isOutsideZone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(alertAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
          Animated.timing(alertAnim, { toValue: 0.5, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      alertAnim.stopAnimation();
      alertAnim.setValue(0);
    }
  }, [isOutsideZone]);

  const makeSOSCall = () => Linking.openURL("tel:100");

  // ── RENDERS ──────────────────────────────────────────────────────────────

  const renderMap = () => (
    <View style={styles.content}>
      {Platform.OS !== "web" ? (
        <MapView
          style={styles.map}
          provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          region={{
            latitude: childCoord.latitude,
            longitude: childCoord.longitude,
            latitudeDelta: 0.006,
            longitudeDelta: 0.006,
          }}
        >
          {/* Safe zone circle */}
          <Circle
            center={SAFE_ZONE}
            radius={SAFE_ZONE.radiusMetres}
            strokeColor={isOutsideZone ? "#ef4444" : "#10b981"}
            strokeWidth={2}
            fillColor={isOutsideZone ? "rgba(239,68,68,0.1)" : "rgba(16,185,129,0.15)"}
          />

          {/* Home marker */}
          <Marker coordinate={SAFE_ZONE} anchor={{ x: 0.5, y: 1 }}>
            <View style={styles.childMarkerWrapper}>
              <View style={styles.homeMarker}>
                <Ionicons name="home" size={22} color="white" />
              </View>
              <View style={styles.nameTag}>
                <Text style={styles.homeTagText}>Home (Safe Zone)</Text>
              </View>
            </View>
          </Marker>

          {/* Child live marker */}
          <Marker
            coordinate={childCoord}
            anchor={{ x: 0.5, y: 0.5 }}
            onPress={() =>
              Alert.alert(
                "Child's Location",
                `Lat: ${childCoord.latitude.toFixed(5)}\nLng: ${childCoord.longitude.toFixed(5)}\nDistance from home: ${distanceFromHome.toFixed(2)} km\nStatus: ${isOutsideZone ? "⚠️ Outside safe zone" : "✅ Inside safe zone"}`
              )
            }
          >
            <View style={[styles.liveMarker, isOutsideZone && styles.liveMarkerAlert]}>
              <Text style={{ fontSize: 22 }}>{isOutsideZone ? "🏃‍♂️" : "🧒"}</Text>
            </View>
          </Marker>
        </MapView>
      ) : (
        <View style={styles.map}>
          {/* @ts-ignore */}
          <iframe
            width="100%"
            height="100%"
            frameBorder="0"
            style={{ border: 0 }}
            src={`https://maps.google.com/maps?q=${childCoord.latitude},${childCoord.longitude}&z=15&output=embed`}
            allowFullScreen
            title="live-map-web"
          />
        </View>
      )}

      {/* Status floating header */}
      {isOutsideZone ? (
        <Animated.View style={[styles.floatingHeader, styles.headerAlert, { opacity: alertAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.7, 1] }) }]}>
          <Ionicons name="warning" size={16} color="white" style={{ marginRight: 6 }} />
          <Text style={styles.alertStatusText}>⚠️ CHILD OUTSIDE SAFE ZONE</Text>
        </Animated.View>
      ) : (
        <View style={styles.floatingHeader}>
          <Text style={styles.statusText}>
            {loading ? "🔄 Connecting…" : "🟢 Child is Safe"}
          </Text>
        </View>
      )}

      {/* Coordinate pill */}
      <View style={styles.coordPill}>
        <Text style={styles.coordText}>
          {childCoord.latitude.toFixed(5)}, {childCoord.longitude.toFixed(5)}
        </Text>
      </View>
    </View>
  );

  const renderActivity = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.pageTitle}>Live Activity</Text>

      {/* Alert banner */}
      {isOutsideZone && (
        <Animated.View style={[styles.alertBanner, { opacity: alertAnim.interpolate({ inputRange: [0.5, 1], outputRange: [0.7, 1] }) }]}>
          <Ionicons name="warning" size={22} color="white" />
          <Text style={styles.alertBannerText}>Child is OUTSIDE the safe zone!</Text>
        </Animated.View>
      )}

      <View style={styles.listCard}>
        <View style={styles.liveIndicator}>
          <View style={[styles.liveDot, !isOutsideZone && styles.liveDotGreen]} />
          <Text style={[styles.liveLabel, !isOutsideZone && { color: "#10b981" }]}>
            {loading ? "Connecting" : isOutsideZone ? "ALERT" : "LIVE"}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
          <Text style={styles.boldText}>
            Your Child • {isOutsideZone ? "⚠️ Outside Zone" : "✅ In Safe Zone"}
          </Text>
          <Text style={styles.subText}>
            {distanceFromHome.toFixed(2)} km from Home
          </Text>
          <Text style={styles.coordSubText}>
            {childCoord.latitude.toFixed(5)}, {childCoord.longitude.toFixed(5)}
          </Text>
        </View>
        <View style={[styles.statusBadgeContainer, isOutsideZone && styles.statusBadgeDanger]}>
          <Text style={[styles.statusBadge, isOutsideZone && styles.statusBadgeTextDanger]}>
            {isOutsideZone ? "ALERT" : "Safe"}
          </Text>
        </View>
      </View>

      {/* Timeline of status */}
      <Text style={styles.sectionTitle}>Device Info</Text>
      <View style={styles.infoCard}>
        <InfoRow icon="location" label="Latitude" value={childCoord.latitude.toFixed(6)} />
        <InfoRow icon="navigate" label="Longitude" value={childCoord.longitude.toFixed(6)} />
        <InfoRow icon="resize" label="Distance from Home" value={`${distanceFromHome.toFixed(3)} km`} />
        <InfoRow icon="shield-checkmark" label="Safe Zone Radius" value={`${SAFE_ZONE_RADIUS_KM * 1000} m`} />
        <InfoRow icon="warning" label="Alert Status" value={isOutsideZone ? "🔴 TRIGGERED" : "🟢 Normal"} />
      </View>
    </ScrollView>
  );

  const renderZones = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.pageTitle}>Geofence Zones</Text>
      <View style={[styles.listCard, { borderLeftColor: isOutsideZone ? "#ef4444" : "#10b981", borderLeftWidth: 6 }]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.boldText}>Home Safe Zone</Text>
          <Text style={styles.subText}>200 m Radius • ESP8266 Monitored</Text>
          <Text style={styles.subText}>
            Centre: {SAFE_ZONE.latitude}, {SAFE_ZONE.longitude}
          </Text>
        </View>
        <Ionicons
          name={isOutsideZone ? "warning" : "shield-checkmark"}
          size={28}
          color={isOutsideZone ? "#ef4444" : "#10b981"}
        />
      </View>
    </ScrollView>
  );

  const renderSettings = () => (
    <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 20 }}>
      <Text style={styles.pageTitle}>Security Settings</Text>
      <View style={styles.listCard}>
        <View>
          <Text style={styles.boldText}>Push Notifications</Text>
          <Text style={styles.subText}>Alert when child leaves safe zone</Text>
        </View>
        <Switch
          value={alertsEnabled}
          onValueChange={setAlertsEnabled}
          trackColor={{ true: "#4f46e5" }}
        />
      </View>

      <TouchableOpacity style={styles.sosButton} onPress={makeSOSCall}>
        <Ionicons name="call" size={24} color="white" />
        <Text style={styles.sosText}>IMMEDIATE SOS CALL (100)</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Global alert strip when child is outside */}
      {isOutsideZone && (
        <View style={styles.topAlertStrip}>
          <Ionicons name="warning" size={14} color="white" />
          <Text style={styles.topAlertText}>  ALERT: Child left safe zone — {distanceFromHome.toFixed(2)} km away</Text>
        </View>
      )}

      {activeTab === "Map" && renderMap()}
      {activeTab === "Activity" && renderActivity()}
      {activeTab === "Zones" && renderZones()}
      {activeTab === "Settings" && renderSettings()}

      <View style={styles.tabs}>
        <Tab icon="map" label="Map" active={activeTab === "Map"} onPress={() => setActiveTab("Map")} />
        <Tab icon="pulse" label="Activity" active={activeTab === "Activity"} onPress={() => setActiveTab("Activity")} />
        <Tab icon="location" label="Zones" active={activeTab === "Zones"} onPress={() => setActiveTab("Zones")} />
        <Tab icon="settings" label="Settings" active={activeTab === "Settings"} onPress={() => setActiveTab("Settings")} />
      </View>
    </SafeAreaView>
  );
}

// ── SUB-COMPONENTS ───────────────────────────────────────────────────────────

const Tab = ({ icon, label, active, onPress }: any) => (
  <TouchableOpacity style={styles.tabItem} onPress={onPress}>
    <Ionicons name={icon} size={24} color={active ? "#4f46e5" : "#9ca3af"} />
    <Text style={[styles.tabLabel, { color: active ? "#4f46e5" : "#9ca3af" }]}>{label}</Text>
  </TouchableOpacity>
);

const InfoRow = ({ icon, label, value }: { icon: any; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <Ionicons name={icon} size={16} color="#6b7280" style={{ marginRight: 10 }} />
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

// ── STYLES ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  content: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  webFallback: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Top alert strip
  topAlertStrip: { backgroundColor: "#ef4444", flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 6, paddingHorizontal: 12 },
  topAlertText: { color: "white", fontSize: 12, fontWeight: "700" },

  // Floating map header
  floatingHeader: { position: "absolute", top: 16, alignSelf: "center", backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 30, elevation: 6, shadowOpacity: 0.12, flexDirection: "row", alignItems: "center" },
  headerAlert: { backgroundColor: "#ef4444" },
  statusText: { fontWeight: "700", color: "#10b981" },
  alertStatusText: { fontWeight: "800", color: "white", fontSize: 13 },

  // Coordinate pill
  coordPill: { position: "absolute", bottom: 20, alignSelf: "center", backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  coordText: { color: "white", fontSize: 11 },

  // Page titles
  pageTitle: { fontSize: 26, fontWeight: "800", padding: 20, color: "#111827" },
  sectionTitle: { fontSize: 16, fontWeight: "700", paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6, color: "#6b7280" },

  // Alert banner in Activity
  alertBanner: { backgroundColor: "#ef4444", marginHorizontal: 15, marginBottom: 8, padding: 14, borderRadius: 16, flexDirection: "row", alignItems: "center", gap: 10, elevation: 4 },
  alertBannerText: { color: "white", fontWeight: "800", fontSize: 15, flex: 1 },

  // List / Info cards
  listCard: { backgroundColor: "white", marginHorizontal: 15, marginVertical: 8, padding: 18, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10 },
  infoCard: { backgroundColor: "white", marginHorizontal: 15, marginVertical: 4, padding: 16, borderRadius: 20, elevation: 2 },
  infoRow: { flexDirection: "row", alignItems: "center", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  infoLabel: { flex: 1, fontSize: 14, color: "#6b7280" },
  infoValue: { fontSize: 14, fontWeight: "700", color: "#1f2937" },

  boldText: { fontSize: 16, fontWeight: "700", color: "#1f2937" },
  subText: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  coordSubText: { fontSize: 11, color: "#9ca3af", marginTop: 2 },

  // Live indicator
  liveIndicator: { alignItems: "center", gap: 4 },
  liveDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#ef4444" },
  liveDotGreen: { backgroundColor: "#10b981" },
  liveLabel: { fontSize: 10, fontWeight: "800", color: "#ef4444" },

  // Status badge
  statusBadgeContainer: { backgroundColor: "#e0e7ff", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusBadgeDanger: { backgroundColor: "#fee2e2" },
  statusBadge: { color: "#4f46e5", fontSize: 12, fontWeight: "800" },
  statusBadgeTextDanger: { color: "#ef4444" },

  // Map markers
  homeMarker: { backgroundColor: "#10b981", padding: 8, borderRadius: 20, borderWidth: 2, borderColor: "white", elevation: 5 },
  childMarkerWrapper: { alignItems: "center" },
  nameTag: { backgroundColor: "white", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, marginTop: 4, elevation: 4 },
  homeTagText: { fontSize: 11, fontWeight: "800", color: "#10b981" },
  liveMarker: { backgroundColor: "#4f46e5", padding: 10, borderRadius: 25, borderWidth: 3, borderColor: "white", elevation: 6 },
  liveMarkerAlert: { backgroundColor: "#ef4444" },

  // SOS
  sosButton: { backgroundColor: "#ef4444", margin: 20, padding: 20, borderRadius: 20, flexDirection: "row", justifyContent: "center", alignItems: "center", elevation: 4 },
  sosText: { color: "white", fontWeight: "800", fontSize: 16, marginLeft: 10 },

  // Tabs
  tabs: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "white", paddingVertical: 12, paddingBottom: Platform.OS === "ios" ? 30 : 15, borderTopWidth: 1, borderColor: "#e5e7eb" },
  tabItem: { alignItems: "center" },
  tabLabel: { fontSize: 11, marginTop: 4, fontWeight: "600" },
});
