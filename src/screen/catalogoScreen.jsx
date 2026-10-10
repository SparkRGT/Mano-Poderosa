import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native'
import Titulo from '../components/Titulo'
const productos = [
  { id: '1', nombre: 'Queso x lb', precio: 3.25, stock: 20 },
  { id: '2', nombre: 'fideos', precio: 0.45, stock: 15 },
  { id: '3', nombre: 'cola 1ltr', precio: 1.2, stock: 8 },
  { id: '4', nombre: 'Jugo delvalle', precio: 1.35, stock: 12 },
  { id: '5', nombre: 'cuveta de huevo x30', precio: 4.5, stock: 6 },
]

export default function CatalogoScreen({ titulo, subtitulo, carrito = [], onAgregar }) {
  const cantidadEnCarrito = (id) =>
    carrito.find((item) => item.id === id)?.cantidad ?? 0

  return (
    <View style={styles.container}>
      <Titulo text={titulo} subtitulo={subtitulo} />
      <FlatList
        style={styles.lista}
        data={productos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.contenido}
        renderItem={({ item }) => {
          const cantidad = cantidadEnCarrito(item.id)
          const sinStock = cantidad >= item.stock

          return (
            <View style={styles.tarjeta}>
              <Text style={styles.nombre}>{item.nombre}</Text>
              <Text style={styles.precio}>${item.precio.toFixed(2)}</Text>
              <Text style={styles.stock}>Disponibles: {item.stock}</Text>
              <Pressable
                style={[styles.boton, sinStock && styles.botonDeshabilitado]}
                onPress={() => onAgregar(item)}
              >
                <Text style={styles.textoBoton}>
                  {cantidad > 0 ? `Agregar al carrito (${cantidad})` : 'Agregar al carrito'}
                </Text>
              </Pressable>
            </View>
          )
        }}
      />
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
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  stock: {
    fontSize: 14,
    color: '#666',
  },
  boton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  botonDeshabilitado: {
    backgroundColor: '#9ec7f5',
  },
  textoBoton: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 15,
  },
});
