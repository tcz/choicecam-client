import React from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, View} from 'react-native';
import { writeConfig } from '../Configuration';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import { RSA, RSAKeychain } from 'react-native-rsa-native';
import { NativeModules } from 'react-native'
var Aes = NativeModules.Aes;

import AwsProviderForm from '../components/provider-forms/AwsProviderForm';
import DigitalOceanProviderForm from '../components/provider-forms/DigitalOceanProviderForm';
import GoogleCloudProviderForm from '../components/provider-forms/GoogleCloudProviderForm';
import AzureProviderForm from '../components/provider-forms/AzureProviderForm';

class DeviceSetup extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
        }
    }

    handleSave(providerData) {
        function verifyResponse(response, publicKey) {
            return new Promise(function(resolve, reject) {
                const headers = response.headers.entries();

                for (var pair of headers) {
                    if (pair[0] !== 'signature') {
                        continue;
                    }
                    var signature = pair[1];
                    break;
                }

                if (!signature) {
                    reject();
                    return;
                }

                response.text().then(function (responseText) {
                    RSAKeychain.verify(signature, responseText, publicKey)
                        .then(function (verified) {
                            if (verified) {
                                resolve({
                                    response: response,
                                    responseText: responseText
                                });
                                return;
                            }
                            reject();
                        }).catch(function () {
                        reject();
                    });
                });
            });
        }

        function saveBasePathAndKey(basePath, symmetricKey) {
            Promise.all([
                writeConfig('base_path', basePath),
                writeConfig('symmetric_key', symmetricKey),
            ]).then((values) => {
                this.props.navigation.navigate('StartupRouter');
            });
        }

        function showError(message) {
            alert(message);
            this.setState({
                loading: false,
            });
        }

        this.setState({
            loading: true,
        });

        var component = this;
        var publicKey = this.props.navigation.state.params.publicKey;
        var ipAddress = this.props.navigation.state.params.ipAddress;

        Aes.randomKey(16).then(function (symmetricKey) {
            var message = {
                'symmetric_key': symmetricKey,
                'provider_data': providerData
            };

            message = JSON.stringify(message);
            publicKey = "-----BEGIN PUBLIC KEY-----" + publicKey + "-----END PUBLIC KEY-----";

            RSA.encrypt(message, publicKey)
                .then(encodedMessage => {
                    return fetch('http://' + ipAddress + ':8000/', {
                        method: 'POST',
                        body: encodedMessage
                    });
                }).catch(function () {
                    throw new Error("Unexpected error happened. Please try again.");
                })
                .then(function (response) {
                    return verifyResponse(response, publicKey)
                }).catch(function () {
                    throw new Error("The identity of the webServer could not be verified.");
                }).then(function (result) {
                    var response = result.response;
                    var responseText = result.responseText;
                    if (!response.ok) {
                        throw new Error(responseText);
                    }

                    saveBasePathAndKey.call(component, responseText, symmetricKey);
                }).catch(function(error) {
                    showError.call(component, error.message);
                });
        });
    }

    render() {
        return (
            <View style={ styles.container }>
                <ScrollView style={ styles.providerList }>
                    <AwsProviderForm onSave={this.handleSave.bind(this)} />
                    <DigitalOceanProviderForm onSave={this.handleSave.bind(this)} />
                    <GoogleCloudProviderForm onSave={this.handleSave.bind(this)} />
                    <AzureProviderForm onSave={this.handleSave.bind(this)} />

                    <View style={ styles.listBottomPad } />
                </ScrollView>
                <View style={[styles.loadingScreen, this.state.loading ? {} : {display: 'none'}]}>
                    <ActivityIndicator size="large" />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    providerList: {
        flex: 1,
    },
    listBottomPad: {
        height: vh(50),
    },
    listItem: {
        flex: 1,
        flexDirection: 'row'
    },
    loadingScreen: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        backgroundColor: '#fff',
    }
});


export default DeviceSetup;
