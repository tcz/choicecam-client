import React from 'react';
import {View, StyleSheet, Image, ActivityIndicator} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { NativeModules, Platform } from 'react-native'
var Aes = NativeModules.Aes;
import base64 from 'react-native-base64'
import md5 from 'md5'

class Aes128EncryptedImage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            key: props.symmetricKey,
            decryptedImagePath: null,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            key: nextProps.symmetricKey,
        });
        if (this.props.source != nextProps.source) {
            this.processSource(nextProps.source);
        }
    }

    processSource(source) {
        var uri = source['uri'];
        var uriHash = md5(uri);

        var extension = uri.split('.').pop();
        var localUri = FileSystem.cacheDirectory + uriHash + '.' + extension;
        var localUriDecoded = FileSystem.cacheDirectory + uriHash + '.decoded.' + extension;

        FileSystem.getInfoAsync(localUriDecoded).then(function (results) {
            if (results.exists) {
                this.setState({decryptedImagePath: localUriDecoded});
                return;
            }

            FileSystem.downloadAsync(
                uri,
                localUri
            )
                .then(function (result) {
                    return FileSystem.readAsStringAsync(result.uri, {
                        encoding: FileSystem.EncodingType.Base64
                    });
                }.bind(this))
                .then(function (contents) {
                    if (!this.state.key) {
                        throw new Error("Missing symmetric key.");
                    }
                    var iv = contents.substring(0, 48); // First 36 bytes in base64, chopped to 32
                    iv = base64.decode(iv).substring(0, 32);
                    var cipherText = contents.substring(48);
                    return Aes.decrypt(cipherText, this.state.key, iv);
                }.bind(this))
                .then(function (decryptData) {
                    return FileSystem.writeAsStringAsync(localUriDecoded, decryptData, {
                        encoding: FileSystem.EncodingType.Base64
                    });
                }.bind(this))
                .then(function (contents) {
                    this.setState({decryptedImagePath: localUriDecoded});
                }.bind(this))
                .catch(function (error) {
                    Promise.all([
                        FileSystem.deleteAsync(localUriDecoded),
                        FileSystem.deleteAsync(localUri),
                    ]);

                    this.onError(error);
                }.bind(this));
        }.bind(this));
    }

    onError(error) {
        console.log(error);
        if (this.props.onError) {
            this.props.onError(error);
        }
    }

    render() {
        if (!this.state.decryptedImagePath) {
            return <View style={[{ alignItems: 'center', justifyContent: 'center' }, this.props.style]}>
                <ActivityIndicator size="large" />
            </View>;
        }

        var imageProps = this.props;
        delete imageProps['source'];
        delete imageProps['onError'];
        delete imageProps['key'];

        return <Image {...this.props} source={{uri: this.state.decryptedImagePath}} onError={this.onError.bind(this)} />
    }
}


export default Aes128EncryptedImage;
