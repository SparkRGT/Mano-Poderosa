import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text,
  TextInput, View } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function SolicitudesLocales() {
  const [db, setDb] = useState(null);
  const [solicitudes, setSolicitudes] = useState([]);
  const [asunto, setAsunto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editandoId, setEditandoId] = useState(null);

  useEffect(() => {
    let activo = true;
    async function iniciar() {
      try {
        const conexion = await SQLite.openDatabaseAsync('solicitudes.db');
        await conexion.execAsync(`
          CREATE TABLE IF NOT EXISTS solicitudes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            asunto TEXT NOT NULL,
            descripcion TEXT NOT NULL,
            sincronizado INTEGER NOT NULL DEFAULT 0
          );
        `);
        if (activo) {
          setDb(conexion);
          await cargar(conexion);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo abrir la base de datos.');
        console.error(error);
      }
    }
    iniciar();
    return () => { activo = false; };
  }, []);

  async function cargar(conexion = db) {
    if (!conexion) return;
    try {
      const filas = await conexion.getAllAsync(
        'SELECT * FROM solicitudes ORDER BY id DESC'
      );
      setSolicitudes(filas);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudieron leer las solicitudes.');
    }
  }

  async function guardar() {
    if (!db) return;
    if (!asunto.trim() || !descripcion.trim()) {
      Alert.alert('Validación', 'Complete asunto y descripción.');
      return;
    }
    try {
      if (editandoId === null) {
        await db.runAsync(
          'INSERT INTO solicitudes (asunto, descripcion, sincronizado) VALUES (?, ?, 0)',
          asunto.trim(), descripcion.trim()
        );
      } else {
        await db.runAsync(
          'UPDATE solicitudes SET asunto = ?, descripcion = ?, sincronizado = 0 WHERE id = ?',
          asunto.trim(), descripcion.trim(), editandoId
        );
      }
      setAsunto('');
      setDescripcion('');
      setEditandoId(null);
      await cargar();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar la solicitud.');
    }
  }

  function editar(item) {
    setEditandoId(item.id);
    setAsunto(item.asunto);
    setDescripcion(item.descripcion);
  }

  function eliminar(id) {
    Alert.alert('Eliminar solicitud', '¿Desea eliminar este registro local?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        try {
          await db.runAsync('DELETE FROM solicitudes WHERE id = ?', id);
          if (editandoId === id) {
            setEditandoId(null); setAsunto(''); setDescripcion('');
          }
          await cargar();
        } catch (error) {
          console.error(error);
          Alert.alert('Error', 'No se pudo eliminar.');
        }
      }}
    ]);
  }

  const pendientes = solicitudes.filter(s => s.sincronizado === 0).length;

  return (
    <View style={styles.contenedor}>
      <Text style={styles.titulo}>Solicitudes locales</Text>
      <Text>Sincronización pendiente: {pendientes}</Text>
      <TextInput style={styles.campo} placeholder="Asunto"
        value={asunto} onChangeText={setAsunto} />
      <TextInput style={styles.campo} placeholder="Descripción"
        value={descripcion} onChangeText={setDescripcion} multiline />
      <Pressable style={styles.boton} onPress={guardar} disabled={!db}>
        <Text style={styles.botonTexto}>
          {editandoId === null ? 'Guardar solicitud' : 'Actualizar solicitud'}
        </Text>
      </Pressable>
      <FlatList
        style={styles.lista}
        data={solicitudes}
        keyExtractor={item => String(item.id)}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={<Text>No existen solicitudes guardadas.</Text>}
        renderItem={({ item }) => (
          <View style={styles.tarjeta}>
            <Text style={styles.negrita}>{item.asunto}</Text>
            <Text>{item.descripcion}</Text>
            <Text>Estado: {item.sincronizado === 0 ? 'Pendiente' : 'Sincronizado'}</Text>
            <View style={styles.fila}>
              <Pressable onPress={() => editar(item)}>
                <Text style={styles.accion}>Editar</Text>
              </Pressable>
              <Pressable onPress={() => eliminar(item.id)}>
                <Text style={styles.accion}>Eliminar</Text>
              </Pressable>
            </View>
          </View>
        )} />
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: { flex: 1, padding: 18, backgroundColor: '#f3f7fa' },
  titulo: { fontSize: 23, fontWeight: 'bold', marginBottom: 10 },
  campo: { borderWidth: 1, borderColor: '#b8c8d0', borderRadius: 8,
    padding: 10, backgroundColor: 'white', marginTop: 10 },
  boton: { backgroundColor: '#087e85', padding: 13, borderRadius: 8,
    marginVertical: 12, alignItems: 'center' },
  botonTexto: { color: 'white', fontWeight: 'bold' },
  tarjeta: { backgroundColor: 'white', padding: 12, borderRadius: 8,
    marginBottom: 10 },
  negrita: { fontWeight: 'bold', fontSize: 16 },
  fila: { flexDirection: 'row', gap: 22, marginTop: 10 },
  accion: { color: '#087e85', fontWeight: 'bold' },
  lista: { flex: 1 }
});

