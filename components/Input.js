import React from 'react';
import {
    Text,
    View,
    TextInput,
    StyleSheet,
} from 'react-native';

class Input extends React.Component {
    render() {
        const { label, ...props } = this.props;
        return (
            <React.Fragment>
                <Text style={styles.label}>{label}</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        {...props}
                    />
                </View>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    label: {
        color: 'rgba(255,255,255,0.5)',
        paddingHorizontal: 20,
        marginBottom: 5,
        marginTop: 10,
        fontSize: 16,
    },
    inputContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        width: '100%',
        borderRadius: 3,
    },
    input: {
        color: '#000',
        fontSize: 16,
        paddingVertical: 10,
    },
});

export default Input;
