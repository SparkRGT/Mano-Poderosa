import { Text, View, StyleSheet } from 'react-native';

export default function Titulo({ text, subtitulo }) {
    return (
        <View style={styles.contenedor}>
            <Text style={styles.titulo}>{text}</Text>
            <Text style={styles.subtitulo}>{subtitulo}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    contenedor: {
        marginBottom: 16,
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
        color: '#161111',
    },
    subtitulo: {
        fontSize: 16,
        fontWeight: 'normal',
        marginBottom: 8,
        textAlign: 'center',
        paddingHorizontal: 20,
        color: '#666',
    },
});
