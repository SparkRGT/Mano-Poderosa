import { View, Text, StyleSheet, Image, TextInput, Alert, Pressable, ScrollView } from 'react-native';
import { useState } from 'react';
import * as imagePeacker from 'expo-image-picker';
import Titulo from '../components/Titulo'

export default function InicioScreen({titulo, subtitulo}) {
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [cedula, setCedula] = useState('');
  const [imagen, setImagen] = useState(null);

  const seleccionarImagen = async () => {
    try {
      const permiso = await imagePeacker.requestMediaLibraryPermissionsAsync();
      // en caso de que el usuario no conceda el permiso 
      if (!permiso.granted) {
        Alert.alert(
          'se requiere del permiso del usuario ',
          'para acceder a la galeria de imagenes'

        );
        return;
      }
      const resultado = await imagePeacker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });

      if (!resultado.canceled && resultado.assets?.length) {
        setImagen(resultado.assets[0].uri);
      }
    } catch (error) {
        console.log('Error al seleccionar la imagen:', error);
        Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  const toamrFoto = async () => {
    try {
      const permiso = await imagePeacker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          'se requiere del permiso del usuario ',
          'para acceder a la camara de imagenes'
        );
        return;
      }
      const resultado = await imagePeacker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });
      if (!resultado.canceled && resultado.assets?.length) {
        setImagen(resultado.assets[0].uri);
      }
    } catch (error) {
      console.log('Error al tomar la foto:', error);
      Alert.alert('Error', 'No se pudo tomar la foto');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Titulo 
        text={titulo}
        subtitulo={subtitulo}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
      />
      <TextInput
        style={styles.input}
        placeholder="Correo"
        value={correo}
        onChangeText={setCorreo}
      />
      <TextInput
        style={styles.input}
        placeholder="Teléfono"
        value={telefono}
        onChangeText={setTelefono}
      />
      <TextInput
        style={styles.input}
        placeholder="Dirección"
        value={direccion}
        onChangeText={setDireccion}
      />
      <TextInput
        style={styles.input}
        placeholder="Cédula"
        value={cedula}
        onChangeText={setCedula}
      />
      <Pressable style={styles.boton} onPress={seleccionarImagen}>
        <Text style={styles.textBoton}>Seleccionar Imagen</Text>
      </Pressable>
      <Pressable style={styles.boton} onPress={toamrFoto}>
        <Text style={styles.textBoton}>Tomar Foto</Text>
      </Pressable>
      {imagen && (
        <View>
          <Text>imagen selecionada </Text>
          <Image source={{ uri: imagen }} style={styles.imagen} />
        </View>
      )}
    </ScrollView>
    
  )
};

const styles = StyleSheet.create({
  logo : {
    width: 200,
    height: 200,
    marginTop: 20,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    width: '100%',
    paddingVertical: 24,
  },
  input: {
    width: '85%', height: 45, backgroundColor: '#fff', borderColor: '#ccc',
    borderWidth: 1, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12,
  },
  tarjeta: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginTop: 12,
    alignItems: 'center',
    elevation: 3,
  },
  numero: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'rgb(69, 34, 211)',
  },
  boton: {
    backgroundColor: 'rgb(69, 34, 211)',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  textBoton: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagen: {
    width: 100,
    height: 150,
    marginTop: 20,
  },
});
