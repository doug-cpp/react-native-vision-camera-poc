import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, useColorScheme, StatusBar, Button, Alert, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Camera, useCameraDevice, CameraPermissionStatus, useCodeScanner } from 'react-native-vision-camera';

function Cam({ onClose }: { onClose: () => void }) {
  const device = useCameraDevice('back');
  const [permission, setPermission] = useState<CameraPermissionStatus>('not-determined');
  const [isActive, setIsActive] = useState(true);

  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'ean-13'],  // QR codes e códigos de barras EAN-13
    onCodeScanned: (codes) => {
      setIsActive(false);
      console.log(`Scanned ${codes.length} codes!`, codes);
      Alert.alert(
        'Código escaneado',
        codes.map(code => `Tipo: ${code.type}, Dado: ${code.value}`).join('\n'),
        [{
          text: 'Ok',
          onPress: () => {
            onClose(); // Notifica o componente pai que câmera deve fechar
          }
        }]
      );
    },
  });

  useEffect(() => {
    async function getPermission() {
      const status = await Camera.requestCameraPermission();
      setPermission(status);
    }
    getPermission();
  }, []);

  if (permission !== 'granted') {
    return (
      <>
        <Text>Sem permissão para câmera</Text>
        <Button title="Pedir permissão para acessar câmera" onPress={async () => {
          const status = await Camera.requestCameraPermission();
          setPermission(status);
        }} />
      </>
    );
  }

  if (device == null) return <Text>Nenhum dispositivo de câmera encontrado</Text>;

  // Exibe a câmera somente se estiver ativa
  if (!isActive) return null;

  return (
    <Camera
      style={StyleSheet.absoluteFill}
      device={device}
      isActive={isActive}
      codeScanner={codeScanner}
    />
  );
}

function AppContent() {
  const isDarkMode = useColorScheme() === 'dark';
  const textColor = isDarkMode ? 'white' : 'black';
  const [showCamera, setShowCamera] = useState(false); // inicia com a câmera fechada

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Text style={{ color: textColor, fontSize: 24 }}>
        Android POC
      </Text>
      <Text style={{ color: textColor, fontSize: 16, marginBottom: 20 }}>
        Leitura de códigos de barras e QR codes
      </Text>
      {showCamera ? (
        <Cam onClose={() => setShowCamera(false)} />
      ) : (
        <View style={{ marginTop: 20 }}>
          <Button title="Abrir Câmera" onPress={() => setShowCamera(true)} />
        </View>
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
