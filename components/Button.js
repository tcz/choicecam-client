import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';

class Button extends React.Component {
    static defaultProps = {
        theme: 'default',
    };

    render() {
        const { onPress, text } = this.props;

        return (
            <TouchableOpacity onPress={onPress} style={styles.container}>
                <Text style={styles.text}>{text}</Text>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#000000',
        marginVertical: 10,
        marginHorizontal: 15,
        borderRadius: 3,
        width: '100%'
    },
    text: {
        textAlign: 'center',
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '600',
        fontSize: 16,
        padding: 15,
    },
});

export default Button;
