import { useEffect, useState } from 'react';
import { Alert, Button, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ES_EXPO_GO, diagnosticarNotificaciones, obtenerNotificaciones, notificarSolicitudRegistrada, registrarDispositivo, solicitarPermisos } from '../services/notificaciones';

export default function NotificacionesPush() {
  const diagnostico = diagnosticarNotificaciones();
  const [token, setToken] = useState('');
  const [mostrarToken, setMostrarToken] = useState(false);
  const [estado, setEstado] = useState('Pendiente: solicita permiso para comenzar.');
  const [ultimoAviso, setUltimoAviso] = useState(null);
  const [interaccion, setInteraccion] = useState(null);
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'android') return;
    if (diagnostico) {
      setEstado(diagnostico);
      return;
    }
    let Notifications;
    try {
      Notifications = obtenerNotificaciones();
    } catch (error) {
      setEstado(error.message);
      return;
    }
    // La pantalla permanece montada al cambiar de pestaña para conservar los avisos.
    const recibida = Notifications.addNotificationReceivedListener((n) => setUltimoAviso(n.request.content));
    const actualizarInteraccion = (r) => {
      if (r) setInteraccion(r.notification.request.content);
    };
    const pulsada = Notifications.addNotificationResponseReceivedListener(actualizarInteraccion);
    actualizarInteraccion(Notifications.getLastNotificationResponse());
    return () => { recibida.remove(); pulsada.remove(); };
  }, [diagnostico]);

  async function ejecutar(tarea) {
    setOcupado(true);
    try {
      await tarea();
    } catch (error) {
      // Evita mostrar tokens o datos internos del proveedor en capturas de errores.
      const mensaje = String(error.message || error).replace(/(?:ExponentPushToken|ExpoPushToken)\[[^\]]+\]/g, '[token oculto]');
      setEstado(`Error: ${mensaje}`);
      Alert.alert('Notificaciones', mensaje);
    } finally {
      setOcupado(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.contenido}>
      <Text style={styles.titulo}>Notificaciones push</Text>
      <Text style={styles.descripcion}>Práctica Android · permisos, avisos locales y token Expo.</Text>
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>1. Permisos y prueba local</Text>
        {diagnostico ? <Text style={styles.descripcion}>{diagnostico}</Text> : null}
        <Button title="Solicitar permisos" disabled={ocupado || Boolean(diagnostico)} onPress={() => ejecutar(async () => {
          await solicitarPermisos();
          setEstado('Permiso concedido. Ya puedes probar el aviso local.');
        })} />
        <Button title="Probar notificación local" disabled={ocupado || Boolean(diagnostico)} onPress={() => ejecutar(async () => {
          await solicitarPermisos();
          await notificarSolicitudRegistrada();
          setEstado('Notificación local enviada. Esta es una prueba; no se guardó una solicitud.');
        })} />
        <Button title="Abrir ajustes del teléfono" disabled={ocupado} onPress={() => ejecutar(() => Linking.openSettings())} />
      </View>
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>2. Registro push remoto</Text>
        <Text style={styles.descripcion}>{ES_EXPO_GO ? 'Estás en Expo Go. El registro remoto está deshabilitado: instala la APK de desarrollo y configura Firebase para obtener el token.' : 'El registro remoto necesita Firebase configurado en esta build de desarrollo.'}</Text>
        <Button title="Obtener token Expo" disabled={ocupado || ES_EXPO_GO || Boolean(diagnostico)} onPress={() => ejecutar(async () => {
          setToken('');
          setMostrarToken(false);
          setEstado('Registrando dispositivo…');
          const nuevoToken = await registrarDispositivo();
          setToken(nuevoToken);
          setEstado('Token obtenido. Envía una push desde la herramienta de Expo.');
        })} />
        <Text selectable style={styles.token}>Expo Push Token: {token ? (mostrarToken ? token : `${token.slice(0, 22)}…${token.slice(-5)}`) : 'Aún no disponible'}</Text>
        {token ? <Button title={mostrarToken ? 'Ocultar token para captura' : 'Mostrar token para copiar'} onPress={() => setMostrarToken(!mostrarToken)} /> : null}
        <Button title="Abrir herramienta de envío Expo" onPress={() => ejecutar(() => Linking.openURL('https://expo.dev/notifications'))} disabled={ocupado} />
      </View>
      <View style={styles.tarjeta}>
        <Text style={styles.subtitulo}>Estado</Text>
        <Text accessibilityLiveRegion="polite">{ocupado ? 'Procesando…' : estado}</Text>
        <Text style={styles.subtitulo}>Último aviso recibido</Text>
        <Text>{ultimoAviso ? `${ultimoAviso.title || 'Sin título'}\n${ultimoAviso.body || ''}` : 'Sin notificaciones recibidas en primer plano.'}</Text>
        <Text style={styles.subtitulo}>Último aviso pulsado</Text>
        <Text>{interaccion ? `${interaccion.title || 'Sin título'}\n${interaccion.body || ''}` : 'Pulsa una notificación para ver su contenido aquí.'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  contenido: { padding: 20, gap: 16, paddingBottom: 32 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#161111' },
  descripcion: { fontSize: 14, color: '#555', lineHeight: 21 },
  tarjeta: { backgroundColor: '#fff', padding: 18, borderRadius: 12, gap: 14 },
  subtitulo: { fontSize: 17, fontWeight: '600', color: '#161111' },
  token: { color: '#333', fontSize: 13, lineHeight: 20 },
});
