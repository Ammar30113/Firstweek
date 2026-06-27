import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  BackHandler,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { WebView, type WebViewNavigation } from "react-native-webview";
import * as LocalAuthentication from "expo-local-authentication";
import * as Notifications from "expo-notifications";
import * as Network from "expo-network";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Native shell around the deployed FirstWeek web app. All product logic lives
// in the Next.js site (firstweekapp.vercel.app); this gives it a real native
// container with native capabilities (biometric lock, notifications, offline
// detection, haptics) so it stands on its own as an app, not a repackaged site.
const APP_URL = "https://firstweekapp.vercel.app";
const APP_HOST = "firstweekapp.vercel.app";
const BRAND = "#c8472a";
const BG = "#fafaf9";
const INK = "#1c1917";
const MUTE = "#78716c";

const K_BIO = "firstweek.bioLock"; // "1" when the Face ID lock is enabled
const K_BIO_ASKED = "firstweek.bioAsked"; // "1" once we've offered the lock
const K_REMINDER = "firstweek.reminderScheduled"; // "1" once the nudge is set

// Show notifications even while the app is foregrounded.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// Ask for notification permission and schedule a one-time re-engagement nudge.
// Local-only (no remote push server needed); guarded so it's scheduled once.
async function setUpNotifications() {
  try {
    const current = await Notifications.getPermissionsAsync();
    let granted = current.granted;
    if (!granted && current.canAskAgain) {
      const req = await Notifications.requestPermissionsAsync();
      granted = req.granted;
    }
    if (!granted) return;
    if ((await AsyncStorage.getItem(K_REMINDER)) === "1") return;
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Your first week is waiting",
        body: "Pick up where you left off and prove you can do the job.",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 60 * 60 * 24,
        repeats: false,
      },
    });
    await AsyncStorage.setItem(K_REMINDER, "1");
  } catch {
    // Notifications are a nice-to-have; never block the app on them.
  }
}

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  // Trigger the system biometric prompt as soon as the lock screen appears.
  useEffect(() => {
    onUnlock();
  }, [onUnlock]);
  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.center}>
        <Text style={styles.lockMark}>🔒</Text>
        <Text style={styles.title}>FirstWeek is locked</Text>
        <Text style={styles.sub}>Unlock with Face ID or your passcode.</Text>
        <TouchableOpacity style={styles.btn} onPress={onUnlock} activeOpacity={0.85}>
          <Text style={styles.btnText}>Unlock</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function Shell() {
  const webRef = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const askedThisLaunch = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [offline, setOffline] = useState(false);

  const [bioEnabled, setBioEnabled] = useState(false);
  const [locked, setLocked] = useState(false);
  const [checking, setChecking] = useState(true);

  // Load the lock preference and kick off notification setup once.
  useEffect(() => {
    (async () => {
      try {
        if ((await AsyncStorage.getItem(K_BIO)) === "1") {
          setBioEnabled(true);
          setLocked(true);
        }
      } catch {}
      setChecking(false);
    })();
    setUpNotifications();
  }, []);

  // Re-lock whenever the app is backgrounded (only on "background" so the
  // Face ID system prompt — which makes us "inactive" — can't re-lock us).
  useEffect(() => {
    const sub = AppState.addEventListener("change", (next) => {
      if (next === "background" && bioEnabled) setLocked(true);
    });
    return () => sub.remove();
  }, [bioEnabled]);

  // Connectivity-aware offline screen.
  useEffect(() => {
    let mounted = true;
    const evaluate = (s: Network.NetworkState) =>
      setOffline(!(s.isConnected && s.isInternetReachable !== false));
    Network.getNetworkStateAsync()
      .then((s) => mounted && evaluate(s))
      .catch(() => {});
    const sub = Network.addNetworkStateListener(evaluate);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  // Auto-recover: when the connection returns after a failed load, reload.
  useEffect(() => {
    if (!offline && error) {
      setError(false);
      setLoading(true);
      webRef.current?.reload();
    }
  }, [offline, error]);

  const authenticate = useCallback(async () => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: "Unlock FirstWeek",
        fallbackLabel: "Use passcode",
      });
      if (res.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        setLocked(false);
      }
    } catch {}
  }, []);

  // Android hardware back navigates WebView history before exiting.
  useEffect(() => {
    if (Platform.OS !== "android") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (canGoBack.current) {
        webRef.current?.goBack();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, []);

  const onNavChange = useCallback((nav: WebViewNavigation) => {
    canGoBack.current = nav.canGoBack;
  }, []);

  // Keep our own pages in-app; hand everything else to the OS.
  const onShouldStart = useCallback((req: { url: string }): boolean => {
    const { url } = req;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      let host = "";
      try {
        host = new URL(url).host;
      } catch {}
      if (host === APP_HOST) return true;
      Linking.openURL(url).catch(() => {});
      return false;
    }
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  const reload = useCallback(() => {
    Haptics.selectionAsync().catch(() => {});
    setError(false);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  // Offer the Face ID lock once, after the first successful load.
  const offerBiometricLock = useCallback(async () => {
    if (askedThisLaunch.current) return;
    askedThisLaunch.current = true;
    try {
      if ((await AsyncStorage.getItem(K_BIO_ASKED)) === "1") return;
      const [hasHw, enrolled] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
      ]);
      if (!hasHw || !enrolled) {
        await AsyncStorage.setItem(K_BIO_ASKED, "1");
        return;
      }
      Alert.alert(
        "Lock FirstWeek?",
        "Require Face ID or your passcode each time you open FirstWeek, so your résumé and assessments stay private.",
        [
          {
            text: "Not now",
            style: "cancel",
            onPress: () => {
              AsyncStorage.setItem(K_BIO_ASKED, "1").catch(() => {});
            },
          },
          {
            text: "Enable",
            onPress: () => {
              AsyncStorage.multiSet([
                [K_BIO, "1"],
                [K_BIO_ASKED, "1"],
              ])
                .then(() => setBioEnabled(true))
                .catch(() => {});
            },
          },
        ],
      );
    } catch {}
  }, []);

  const onLoadEnd = useCallback(() => {
    setLoading(false);
    offerBiometricLock();
  }, [offerBiometricLock]);

  if (checking) {
    return (
      <SafeAreaView style={styles.safe}>
        <StatusBar style="dark" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color={BRAND} />
        </View>
      </SafeAreaView>
    );
  }

  if (locked) {
    return <LockScreen onUnlock={authenticate} />;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {offline ? (
        <View style={styles.center}>
          <Text style={styles.title}>You’re offline</Text>
          <Text style={styles.sub}>
            FirstWeek needs a connection. We’ll reconnect automatically.
          </Text>
          <ActivityIndicator color={BRAND} style={{ marginTop: 16 }} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.title}>Can’t reach FirstWeek</Text>
          <Text style={styles.sub}>Check your connection and try again.</Text>
          <TouchableOpacity style={styles.btn} onPress={reload} activeOpacity={0.85}>
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <WebView
            ref={webRef}
            source={{ uri: APP_URL }}
            onNavigationStateChange={onNavChange}
            onShouldStartLoadWithRequest={onShouldStart}
            onLoadEnd={onLoadEnd}
            onError={() => {
              setError(true);
              setLoading(false);
            }}
            onHttpError={() => setLoading(false)}
            pullToRefreshEnabled
            allowsBackForwardNavigationGestures
            originWhitelist={["https://*", "http://*", "mailto:*", "tel:*"]}
            style={styles.web}
          />
          {loading && (
            <View style={styles.loader} pointerEvents="none">
              <ActivityIndicator size="large" color={BRAND} />
            </View>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <Shell />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  web: { flex: 1, backgroundColor: BG },
  loader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BG,
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, backgroundColor: BG },
  lockMark: { fontSize: 44, marginBottom: 12 },
  title: { fontSize: 20, fontWeight: "700", color: INK, marginBottom: 8, textAlign: "center" },
  sub: { fontSize: 14, color: MUTE, textAlign: "center", marginBottom: 20 },
  btn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});
