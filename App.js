import { useState } from 'react';
import { KeyboardAvoidingView, Platform, SafeAreaView, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from './src/screen/loginScreen';
import InicioScreen from './src/screen/InicioScreen';
import CatalogoScreen from './src/screen/catalogoScreen';
import CarritoScreen from './src/screen/carritoScreen';
import Sensores from './src/components/sensores';
import MenuInferior from './src/components/menuInferior';
import NotificacionesPush from './src/screen/NotificacionesPush';
import SolicitudesScreen from './src/screen/SolicitudesScreen';

export default function App() {
  const [sesionIniciada, setSesionIniciada] = useState(false);
  const [pantallaActual, setPantallaActual] = useState('inicio');
  const [carrito, setCarrito] = useState([]);

  const agregarProducto = (producto) => {
    setCarrito((actual) => {
      const existente = actual.find((item) => item.id === producto.id);
      if ((existente?.cantidad ?? 0) >= producto.stock) return actual;
      return existente
        ? actual.map((item) => item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item)
        : [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, cambio) => {
    setCarrito((actual) => actual.map((item) => item.id === id
      ? { ...item, cantidad: Math.min(item.stock, item.cantidad + cambio) }
      : item).filter((item) => item.cantidad > 0));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView style={styles.contenido} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {!sesionIniciada ? <LoginScreen onLogin={() => setSesionIniciada(true)} /> : (
          <>
            <View style={[styles.contenido, pantallaActual !== 'inicio' && styles.oculta]}>
              <InicioScreen titulo="Nuevo perfil" subtitulo="Ingrese sus datos" />
            </View>
            {pantallaActual === 'catalogo' && <CatalogoScreen titulo="Catálogo" subtitulo="Selecciona tus productos" carrito={carrito} onAgregar={agregarProducto} />}
            {pantallaActual === 'carrito' && <CarritoScreen titulo="Mi carrito" subtitulo="Revisa tus productos" carrito={carrito} onCambiarCantidad={cambiarCantidad} />}
            <View style={[styles.contenido, pantallaActual !== 'sensores' && styles.oculta]}>
              <Sensores activo={pantallaActual === 'sensores'} />
            </View>
            <View style={[styles.contenido, pantallaActual !== 'notificaciones' && styles.oculta]}>
              <NotificacionesPush />
            </View>
            {pantallaActual === 'solicitudes' && <SolicitudesScreen />}
            <MenuInferior pantallaActual={pantallaActual} setPantallaActual={setPantallaActual} cantidadCarrito={carrito.reduce((total, item) => total + item.cantidad, 0)} />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', paddingTop: Platform.OS === 'android' ? 32 : 0, paddingBottom: Platform.OS === 'android' ? 24 : 0 },
  contenido: { flex: 1 },
  oculta: { display: 'none' },
});
