import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';

class CodeScanner extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            hasPermission: null,
            scanned: false,
        };
    }

    componentDidMount() {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            this.setState({ hasPermission: status === 'granted' });
        })();
    }

    handleBarCodeScanned ({ type, data }) {
        function validatePublicKeyBase64 (data) {
            var base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

            if (!base64regex.test(data)) {
                return false;
            }
            if (data.length !== 392) {
                return false;
            }
            return true;
        }

        if (!validatePublicKeyBase64(data)) {
            console.log('Invalid QR code: ' + data);
            return;
        }

        this.setState({ scanned: true });

        this.props.navigation.navigate('DeviceSearch', {
            publicKey: data,
        });
    }

    render() {

        if (this.state.hasPermission === null) {
            return <Text>Requesting for camera permission</Text>;
        }
        if (this.state.hasPermission === false) {
            return <Text>No access to camera</Text>;
        }


        return (
            <View
                style={{
                    flex: 1,
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                }}>
                <BarCodeScanner
                    onBarCodeScanned={this.state.scanned ? undefined : this.handleBarCodeScanned.bind(this)}
                    style={StyleSheet.absoluteFillObject}
                    barCodeTypes={[BarCodeScanner.Constants.BarCodeType.qr]}
                />
            </View>
        );
    }
}

export default CodeScanner;
