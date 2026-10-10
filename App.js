import { StatusBar } from 'expo-status-bar';
import { Alert } from 'react-native';
import { useState } from 'react';

//importar las screens construidas
import LoginScreen from './src/screen/loginScreen';
import InicioScreen from './src/screen/inicio';
import CarritoScreen from './src/screen/carritoScreen';
import CatalogoScreen from './src/screen/catalogoScreen';
import MenuInferior from './src/components/menuAbajo';



export default function App() {
  const [ usuarioAutenticado, setUsuarioAutenticado ] = useState(false);
  const [ pantallaActual, setPantallaActual ] = useState('inicio');
  const [ carrito, setCarrito ] = useState([]);

  const agregarAlCarrito = (producto) => {
    const existente = carrito.find((item) => item.id === producto.id);
    if (existente && existente.cantidad >= producto.stock) {
      Alert.alert('Sin stock', 'No hay más unidades disponibles de este producto');
      return;
    }

    setCarrito((actual) => {
      const yaEsta = actual.find((item) => item.id === producto.id);
      if (yaEsta) {
        return actual.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...actual, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) => {
    const item = carrito.find((producto) => producto.id === id);
    if (!item) {
      return;
    }
    if (delta > 0 && item.cantidad >= item.stock) {
      Alert.alert('no hay mas unidades de este producto');
      return;
    }

    setCarrito((actual) =>
      actual
        .map((producto) =>
          producto.id === id
            ? { ...producto, cantidad: producto.cantidad + delta }
            : producto
        )
        .filter((producto) => producto.cantidad > 0)
    );
  };

  //si no ha iniciado sesion, muestre el login
  if (!usuarioAutenticado) {
    return (
      <>
        <LoginScreen onLogin={() => setUsuarioAutenticado(true)} />
      </>
    )
  }

  //determinar qué pantalla debe mostrar la app

  let pantalla;
  if (pantallaActual === 'solicitudes' || pantallaActual === 'catalogo') {
    pantalla = (
      <CatalogoScreen
        titulo="Catálogo"
        subtitulo="Productos disponibles"
        carrito={carrito}
        onAgregar={agregarAlCarrito}
      />
    );
  }
  else if (pantallaActual === 'carrito' || pantallaActual === 'perfil') {
    pantalla = (
      <CarritoScreen
        titulo="Carrito"
        subtitulo="Productos seleccionados"
        carrito={carrito}
        onCambiarCantidad={cambiarCantidad}
      />
    );
  }
  else {
    pantalla = <InicioScreen titulo="Bienvenido" subtitulo="Sistema de pedidos Online" />;
  }
  

  return (
    <>
      {pantalla}
      <MenuInferior
        pantallaActual={pantallaActual}
        setPantallaActual={setPantallaActual}
        cantidadCarrito={carrito.reduce((total, item) => total + item.cantidad, 0)}
      />
      <StatusBar style="auto" />
    </>
  );
}