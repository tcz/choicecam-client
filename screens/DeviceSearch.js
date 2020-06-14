import React from 'react';
import {ActivityIndicator, View, Text, StyleSheet} from 'react-native';
import dgram from 'react-native-udp';
import base64 from 'react-native-base64';
import {vw} from "react-native-expo-viewport-units";

class DeviceSearch extends React.Component {

    constructor(props) {
        super(props);
        this.socket = null;
        this.searchInterval = null;
    }

    componentDidMount() {
        this.searchDevice();
    }

    componentDidUpdate() {
        this.searchDevice();
    }

    componentWillUnmount() {
        this.stopSearch();
    }

    searchDevice() {
        this.socket = dgram.createSocket('udp4');
        var publicKeyToSearch = this.props.navigation.state.params.publicKey;

        function byteArrayToString(array) {
            var result = "";
            for (var i = 0; i < array.length; i++) {
                result += String.fromCharCode(array[i]);
            }
            return result;
        }

        function parseHeader(message) {
            const lines = message.split("\r\n");
            const firstLine = lines.shift();

            if ("NOTIFY * HTTP/1.1" !== firstLine) {
                return null;
            }

            var headers = {};

            for (var i = 0; i < lines.length; i++) {
                const parts = lines[i].split(":", 2);
                if (parts.length !== 2) {
                    continue;
                }

                headers[parts[0].toLowerCase().trim()] = parts[1].trim();
            }

            return headers;
        }

        function emitSearch() {
            var message = "M-SEARCH * HTTP/1.1\r\n" +
                "HOST: 239.255.255.250:1901\r\n" +
                "MAN: \"ssdp:discover\"\r\n" +
                "MX: 1\r\n" +
                "ST: ssdp:choicecam";

            this.socket.send(base64.encode(message), 0, message.length, 1901, '239.255.255.250', function(err) {
                if (err) throw err;
            });
        }

        this.socket.on('message', function(messageBytes, serverInfo) {
            const message = byteArrayToString(messageBytes);
            const headers = parseHeader(message);
            if (!headers || !headers['usn']) {
                return;
            }

            if (headers['usn'] !== publicKeyToSearch) {
                return;
            }

            this.stopSearch();
            this.props.navigation.navigate('DeviceSetup', {
                publicKey: publicKeyToSearch,
                ipAddress: serverInfo.address,
            });

        }.bind(this));

        this.searchInterval = window.setInterval(emitSearch.bind(this), 1000);
        emitSearch.call(this);
    }

    stopSearch() {
        if (this.searchInterval) {
            clearInterval(this.searchInterval);
            this.searchInterval = null;
        }
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    render() {
        const { params } = this.props.navigation.state;

        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" />
                <Text style={styles.title}>Searching for camera...</Text>
                <Text style={styles.text}>Please make sure the camera is on the same network.</Text>
                <Text style={styles.publicKey}>Public key: {params.publicKey}</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: vw(10)
    },
    title: {
        fontSize: 20,
        marginTop: vw(10),
        marginBottom: vw(10),
        textAlign: 'center'
    },
    text: {
        textAlign: 'center',
        marginBottom: vw(10),
    },
    publicKey: {
        fontSize: 8,
        textAlign: 'center',
        color: '#999'
    },
});

export default DeviceSearch;
