import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Alert, Pressable } from 'react-native';
import Titulo from './Titulo';
import * as Location from 'expo-location';
import { Accelerometer } from 'expo-sensors';

export default function Sensores({ activo = true }) {
  const [ubicacion, setUbicacion] = useState(null);
  const [consultandoUbicacion, setConsultandoUbicacion] = useState(false);
  const [aceleracion, setAceleracion] = useState(null);
  const [leyendo, setLeyendo] = useState(false);
  const [iniciando, setIniciando] = useState(false);
  const suscripcion = useRef(null);
  const vigente = useRef(false);

  useEffect(() => {
    vigente.current = activo;
    return () => {
      vigente.current = false;
      suscripcion.current?.remove();
      suscripcion.current = null;
      setLeyendo(false);
    };
  }, [activo]);

  const alternarAcelerometro = async () => {
    if (suscripcion.current) {
      suscripcion.current.remove();
      suscripcion.current = null;
      setLeyendo(false);
      return;
    }
    setIniciando(true);
    try {
      const permiso = await Accelerometer.requestPermissionsAsync();
      if (!vigente.current) return;
      if (!permiso.granted) {
        Alert.alert('Permiso requerido', 'Autoriza el acceso al movimiento del dispositivo');
        return;
      }
      const disponible = await Accelerometer.isAvailableAsync();
      if (!vigente.current) return;
      if (!disponible) {
        Alert.alert('Acelerómetro no disponible', 'Este dispositivo no permite leer el acelerómetro');
        return;
      }
      Accelerometer.setUpdateInterval(250);
      suscripcion.current = Accelerometer.addListener(setAceleracion);
      setLeyendo(true);
    } catch (error) {
      Alert.alert('Acelerómetro no disponible', 'No se pudo iniciar la lectura del acelerómetro');
    } finally {
      setIniciando(false);
    }
  };

  const obtenerUbicacion = async () => {
    try {
      setConsultandoUbicacion(true);
      const permiso = await Location.requestForegroundPermissionsAsync();
      if (permiso.status !== 'granted') {
        Alert.alert('Permiso requerido', 'Autoriza el acceso a tu ubicación para continuar');
        return;
      }
      const posicion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setUbicacion({
        latitud: posicion.coords.latitude,
        longitud: posicion.coords.longitude,
        precision: posicion.coords.accuracy,
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Ubicación no disponible', 'No se pudo obtener la ubicación actual en este momento');
    } finally {
      setConsultandoUbicacion(false);
    }
  };

  return (

    <View style={styles.container}>
      <Titulo text="mano poderosa" subtitulo="Ubicación del dispositivo" />
      <Pressable onPress={obtenerUbicacion} disabled={consultandoUbicacion} style={styles.boton}>
        <Text style={styles.textoBoton}>
          {consultandoUbicacion ? 'Consultando ubicación...' : 'Obtener ubicación'}
        </Text>
      </Pressable>
      {ubicacion && (
        <View style={styles.tarjetaUbicacion}>
          <Text>Latitud: {ubicacion.latitud.toFixed(6)}</Text>
          <Text>Longitud: {ubicacion.longitud.toFixed(6)}</Text>
          <Text>Precisión aproximada: {ubicacion.precision == null ? 'No disponible' : `${Math.round(ubicacion.precision)} m`}</Text>
        </View>
      )}
      <Pressable onPress={alternarAcelerometro} disabled={iniciando} style={styles.boton}>
        <Text style={styles.textoBoton}>
          {iniciando ? 'Iniciando acelerómetro...' : leyendo ? 'Detener acelerómetro' : 'Activar acelerómetro'}
        </Text>
      </Pressable>
      {aceleracion && (
        <View style={styles.tarjetaUbicacion}>
          <Text>X: {aceleracion.x.toFixed(3)} g</Text>
          <Text>Y: {aceleracion.y.toFixed(3)} g</Text>
          <Text>Z: {aceleracion.z.toFixed(3)} g</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 24,
  },
  boton: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  textoBoton: { color: '#fff', fontWeight: 'bold' },
  tarjetaUbicacion: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16 },
});
