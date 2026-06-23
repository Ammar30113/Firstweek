import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// Native shell around the deployed FirstWeek web app. All product logic lives
// in the Next.js site (firstweekapp.vercel.app); this gives it a real native
// container for the App Store / Play Store. Navigation inside our own domain
// stays in the WebView; anything else (mailto:, external links) opens in the
// system browser.
const APP_URL = "https://firstweekapp.vercel.app";
const APP_HOST = "firstweekapp.vercel.app";
const BRAND = "#c8472a";
const BG = "#fafaf9";

function Shell() {
  const webRef = useRef<WebView>(null);
  const canGoBack = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Android hardware back navigates the WebView history before exiting.
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
    // mailto:, tel:, etc.
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  const reload = useCallback(() => {
    setError(false);
    setLoading(true);
    webRef.current?.reload();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      {error ? (
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
            onLoadEnd={() => setLoading(false)}
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
  title: { fontSize: 20, fontWeight: "700", color: "#1c1917", marginBottom: 8 },
  sub: { fontSize: 14, color: "#78716c", textAlign: "center", marginBottom: 20 },
  btn: { backgroundColor: BRAND, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: "#ffffff", fontWeight: "600", fontSize: 15 },
});
