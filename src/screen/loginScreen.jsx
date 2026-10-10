import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert, StyleSheet } from 'react-native';


export default function LoginScreen({onLogin}) {
    const [correo, setCorreo ] = useState('');
    const [clave, setClave ] = useState('');

    //credenciales de prueba sin BD
    const correoCorrecto = 'spark@cliente.com';
    const claveCorrecta = '12345';

    const inniciarSesion = () => {
        if (!correo.trim() || !clave) {
            Alert.alert(
                'Datos incompletos',
                'Ingrese correo y contraseña'
            );
            return;
        }
        if (correo === correoCorrecto && clave === claveCorrecta) {
            onLogin();
        } else {
            Alert.alert(
                'Credenciales incorrectas',
                'Ingrese correo y contraseña correctos'
            );
        }
    };
    return (
        <View style={styles.container}>
            <View style={styles.tarjeta}>
                <Text style={styles.titulo}>
                    Mano poderosa login
                </Text>
                <Text style={styles.subtitulo}>
                    Pedidos de clientes
                </Text>
                <Text style={styles.instrucciones}>
                    Ingresa con tus credenciales
                </Text>
                <TextInput 
                    style={styles.input}
                    placeholder="Ingrese su correo"
                    value={correo}
                    onChangeText={setCorreo}
                    autoCapitalize="none"
                />
                <TextInput 
                    style={styles.input}
                    placeholder="Ingrese su contraseña"
                    value={clave}
                    onChangeText={setClave}
                    secureTextEntry
                />
                <Pressable 
                    style = {styles.boton}
                    onPress={inniciarSesion}
                >
                    <Text style={styles.textBoton}>
                        Iniciar Sesion
                    </Text>
                </Pressable>

                <Text style={styles.ayuda}>
                    Utiliza tus credenciales 
                </Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
     container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        width: '100%',
     },
     tarjeta: {
        width: '85%',
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 30,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4, 
        elevation: 3,
     },
     titulo: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
        textAlign: 'center',
        color: '#161111'
     },
     subtitulo: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 4,
        textAlign: 'center',
        color: '#666'
     },
     instrucciones: {
        fontSize: 14,
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
     },
     input: {
        height: 45,
        borderColor: '#ccc',
        borderWidth: 1,
        marginBottom: 16,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: '#fff',
     },
     boton: {
        backgroundColor: '#007AFF',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
     },
     textBoton: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 16,
     },
     ayuda: {
        fontSize: 12,
        color: '#999',
        textAlign: 'center',
        marginTop: 20,
     },
});