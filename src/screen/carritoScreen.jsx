import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native'
import Titulo from '../components/Titulo'

export default function CarritoScreen({ titulo, subtitulo, carrito = [], onCambiarCantidad }) {
  const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0)

  return (
    <View style={styles.container}>
      <Titulo text={titulo} subtitulo={subtitulo} />
      {carrito.length === 0 ? (
        <Text style={styles.vacio}>Tu carrito está vacío</Text>
      ) : (
        <FlatList
          style={styles.lista}
          data={carrito}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.contenido}
          renderItem={({ item }) => (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.precio}>${item.precio.toFixed(2)} c/u</Text>
              <View style={styles.fila}>
                <Pressable
                  style={styles.control}
                  onPress={() => onCambiarCantidad(item.id, -1)}
                >
                  <Text style={styles.controlTexto}>-</Text>
                </Pressable>
                <Text style={styles.cantidad}>{item.cantidad}</Text>
                <Pressable
                  style={styles.control}
                  onPress={() => onCambiarCantidad(item.id, 1)}
                >
                  <Text style={styles.controlTexto}>+</Text>
                </Pressable>
                <Text style={styles.subtotal}>
                  ${(item.precio * item.cantidad).toFixed(2)}
                </Text>
              </View>
            </View>
          )}
          ListFooterComponent={
            <View style={styles.total}>
              <Text style={styles.totalEtiqueta}>Total</Text>
              <Text style={styles.totalValor}>${total.toFixed(2)}</Text>
            </View>
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
    paddingTop: 48,
  },
  vacio: {
    marginTop: 24,
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  lista: {
    flex: 1,
    width: '100%',
  },
  contenido: {
    paddingHorizontal: 20,
    paddingBottom: 88,
  },
  tarjeta: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 12,
    elevation: 3,
  },
  nombre: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161111',
    marginBottom: 4,
  },
  precio: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  fila: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  control: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cantidad: {
    minWidth: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#161111',
  },
  subtotal: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  total: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalEtiqueta: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#161111',
  },
  totalValor: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
