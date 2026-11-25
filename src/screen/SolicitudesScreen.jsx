import { View, StyleSheet } from 'react-native';
import SolicitudesLocales from '../components/SolicitudesLocales';

export default function SolicitudesScreen() {
  return (
    <View style={styles.contenedor}>
      <SolicitudesLocales />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1 },
});
