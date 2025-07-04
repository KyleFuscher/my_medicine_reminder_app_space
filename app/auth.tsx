import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const isWeb = Platform.OS === "web";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  icon: {
    fontSize: 80,
    color: "#4CAF50",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    width: width - 40,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#E5E5EA",
    marginBottom: 10,
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)",
  },
  biometricIcon: {
    marginRight: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  error: {
    color: "#FF3B30",
    textAlign: "center",
    marginTop: 10,
  },
  loading: {
    marginTop: 20,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  errorIcon: {
    marginRight: 8,
    fontSize: 14,
  },
  errorMessage: {
    marginLeft: 8,
    fontSize: 14,
  },
});

export default function AuthScreen() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasBiometrics, setHasBiometrics] = useState(false);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    if (isWeb) {
      setHasBiometrics(false);
      return;
    }

    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setHasBiometrics(hasHardware && isEnrolled);
  };

  const authenticate = async () => {
    try {
      setIsAuthenticating(true);
      setError(null);

      if (isWeb) {
        router.push("/enter-pin");
        return;
      }

      const auth = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access MedRemind",
        fallbackLabel: "Use PIN",
      });

      if (auth.success) {
        router.push("/home");
      } else {
        setError("Authentication failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred during authentication. Please try again.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <LinearGradient colors={["#4CAF50", "#2E7D32"]} style={styles.background}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="medical" size={80} color="white" />
        </View>
        <Text style={styles.title}>Welcome to MedRemind</Text>
        <Text style={styles.subtitle}>Your personal medication reminder</Text>

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#FF3B30" style={styles.errorIcon} />
            <Text style={styles.errorMessage}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, isAuthenticating && styles.buttonDisabled]}
          onPress={authenticate}
          disabled={isAuthenticating}
        >
          <Ionicons
            name={hasBiometrics ? "finger-print-outline" : "keypad-outline"}
            size={24}
            color="white"
            style={styles.biometricIcon}
          />
          <Text style={styles.buttonText}>
            {isAuthenticating
              ? "Authenticating..."
              : hasBiometrics
              ? "Use Biometrics"
              : "Enter PIN"}
          </Text>
        </TouchableOpacity>

        {isAuthenticating && (
          <ActivityIndicator size="small" color="white" style={styles.loading} />
        )}
      </View>
    </LinearGradient>
  );
}