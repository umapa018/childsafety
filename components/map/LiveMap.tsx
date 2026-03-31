import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { useChildLocation } from '../../hooks/useChildLocation';
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from './NativeMap';

const SAFE_ZONE = {
    latitude: 12.970713,   // actual location
    longitude: 80.043253,
    radiusMetres: 200,     // 200m
};

export default function LiveMap() {
    const { childData, isOutsideZone, loading, error } = useChildLocation();
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Pulse animation on alert
    useEffect(() => {
        if (isOutsideZone) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.3, duration: 600, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
                ])
            ).start();
        } else {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
        }
    }, [isOutsideZone]);

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#4f46e5" />
                <Text style={styles.loadingText}>Connecting to device…</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.center}>
                <Ionicons name="cloud-offline" size={48} color="#ef4444" />
                <Text style={styles.errorText}>Firebase connection failed</Text>
                <Text style={styles.errorSub}>{error}</Text>
            </View>
        );
    }

    const childCoord = {
        latitude: childData?.location.lat ?? SAFE_ZONE.latitude,
        longitude: childData?.location.lng ?? SAFE_ZONE.longitude,
    };

    return (
        <View style={styles.container}>
            {Platform.OS !== 'web' ? (
                <MapView
                    style={styles.map}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
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
                        strokeColor={isOutsideZone ? '#ef4444' : '#10b981'}
                        strokeWidth={2}
                        fillColor={isOutsideZone ? 'rgba(239,68,68,0.12)' : 'rgba(16,185,129,0.15)'}
                    />

                    {/* Home / safe-zone centre marker */}
                    <Marker coordinate={SAFE_ZONE} anchor={{ x: 0.5, y: 1 }}>
                        <View style={styles.homeWrapper}>
                            <View style={styles.homeMarker}>
                                <Ionicons name="home" size={20} color="white" />
                            </View>
                            <View style={styles.nameTag}>
                                <Text style={styles.homeTagText}>Safe Zone</Text>
                            </View>
                        </View>
                    </Marker>

                    {/* Child's live marker */}
                    <Marker coordinate={childCoord} anchor={{ x: 0.5, y: 0.5 }}>
                        <Animated.View style={[
                            styles.childMarker,
                            isOutsideZone && styles.childMarkerAlert,
                            { transform: [{ scale: pulseAnim }] }
                        ]}>
                            <Text style={{ fontSize: 22 }}>
                                {isOutsideZone ? '🏃‍♂️' : '🧒'}
                            </Text>
                        </Animated.View>
                    </Marker>
                </MapView>
            ) : (
                <View style={styles.center}>
                    <Text>Map only available on mobile</Text>
                </View>
            )}

            {/* Status banner */}
            <View style={[styles.banner, isOutsideZone ? styles.bannerAlert : styles.bannerSafe]}>
                <Ionicons
                    name={isOutsideZone ? 'warning' : 'shield-checkmark'}
                    size={18}
                    color="white"
                />
                <Text style={styles.bannerText}>
                    {isOutsideZone ? '⚠️ ALERT: Child outside safe zone!' : '✅ Child is within safe zone'}
                </Text>
            </View>

            {/* Coords overlay */}
            <View style={styles.coordPill}>
                <Text style={styles.coordText}>
                    {childCoord.latitude.toFixed(5)}, {childCoord.longitude.toFixed(5)}
                </Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    map: { ...StyleSheet.absoluteFillObject },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 10, padding: 20 },
    loadingText: { color: '#6b7280', fontSize: 15, marginTop: 8 },
    errorText: { color: '#ef4444', fontSize: 18, fontWeight: '700', marginTop: 8 },
    errorSub: { color: '#9ca3af', fontSize: 13, textAlign: 'center' },

    // Markers
    homeWrapper: { alignItems: 'center' },
    homeMarker: { backgroundColor: '#10b981', padding: 8, borderRadius: 20, borderWidth: 2, borderColor: 'white', elevation: 5 },
    nameTag: { backgroundColor: 'white', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, marginTop: 3, elevation: 4 },
    homeTagText: { fontSize: 11, fontWeight: '800', color: '#10b981' },
    childMarker: { backgroundColor: '#4f46e5', padding: 10, borderRadius: 25, borderWidth: 3, borderColor: 'white', elevation: 6 },
    childMarkerAlert: { backgroundColor: '#ef4444' },

    // Banners
    banner: { position: 'absolute', top: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 30, elevation: 8, shadowOpacity: 0.2, shadowRadius: 10 },
    bannerSafe: { backgroundColor: '#10b981' },
    bannerAlert: { backgroundColor: '#ef4444' },
    bannerText: { color: 'white', fontWeight: '700', fontSize: 13 },

    // Coordinate pill
    coordPill: { position: 'absolute', bottom: 20, alignSelf: 'center', backgroundColor: 'rgba(0,0,0,0.65)', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
    coordText: { color: 'white', fontSize: 12, fontFamily: 'monospace' },
});