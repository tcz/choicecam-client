import * as React from 'react';
import {FlatList, StyleSheet, Text, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import Aes128EncryptedImage from '../components/Aes128EncryptedImage';
import {Video} from 'expo-av';
import Moment from 'moment';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';
import VideoServer from "../VideoServer";
import Button from "../components/Button";

class CameraMonitor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: props.navigation.state.params.symmetricKey,
            playlistUri: null,
            thumbnailList: [],
            isLive: null,
            isLoading: true,
            videoIsLoading: true,
        };

        this.video = null;
        this.videoServer = new VideoServer(
            props.navigation.state.params.symmetricKey,
            props.navigation.state.params.basePath
        );

        this.videoServer.onUrlChange(this.setVideoSource.bind(this));
        this.videoServer.onThumbnailListChange(this.setThumbnailList.bind(this));
        this.videoServer.onLiveStatusChange(this.setLiveStatus.bind(this));
        this.videoServer.start();
    }

    handleVideoRef(ref) {
        this.video = ref;
    }

    setVideoSource(uri) {
        if (this.video) {
            this.video.stopAsync().then(function() {
                this.setState({playlistUri: uri});
            }.bind(this));
        } else {
            this.setState({playlistUri: uri});
        }
    }

    setThumbnailList(list) {
        if (list.length > 0 && this.state.isLoading) {
            this.setState({isLoading: false});
        }
        this.setState({thumbnailList: list.reverse()});
    }

    setLiveStatus(isLive) {
        this.setState({isLive: isLive});
    }

    onListItemPress(item) {
        this.videoServer.seekTo(item.sequence);
    }

    onGoLiveButtonPress() {
        this.videoServer.goLive();
    }

    onPlaybackStatusUpdate(playbackStatus) {
        this.setState({
            videoIsLoading: !playbackStatus.isPlaying
        });
    }

    render() {
        if (this.state.isLoading) {
            return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
                <Text style={styles.loadingText}>Waiting for video feed...</Text>
            </View>
        }
        Moment.locale('en');
        return (
            <View style={styles.container}>
                <View style={[styles.videoLoading, this.state.videoIsLoading === true ? {} : {display: 'none'}]}>
                    <ActivityIndicator size="large" />
                </View>
                <Video
                    ref={this.handleVideoRef.bind(this)}
                    source={{uri: this.state.playlistUri}}
                    shouldPlay
                    useNativeControls={false}
                    style={[styles.video, this.state.videoIsLoading === true ? {display: 'none'} : {}]}
                    onPlaybackStatusUpdate={this.onPlaybackStatusUpdate.bind(this)}
                />
                <View style={[styles.liveIndicator, this.state.isLive === true ? styles.liveIndicatorLive : {}]}>
                    <Text style={styles.liveIndicatorText}>
                        {this.state.isLive === true ? 'Live' : ''}
                        {this.state.isLive === false ? 'Watching Recording' : ''}
                        {this.state.isLive === null ? 'Loading...' : ''}
                    </Text>
                    <TouchableOpacity style={styles.goLiveButton} onPress={this.onGoLiveButtonPress.bind(this)}>
                        <Text style={[
                                styles.goLiveButtonText,
                                this.state.isLive !== false ? {display: 'none'} : {}
                            ]}>Go Live</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    style={styles.list}
                    data={this.state.thumbnailList}
                    renderItem={({item, index}) =>
                        <TouchableOpacity onPress={ () => this.onListItemPress(item)}>
                            <View style={[styles.listItem, index === 0 ? {display: 'none'} : {}]}>
                                <Aes128EncryptedImage
                                    style={styles.thumbnail}
                                    source={{uri: item.thumbnailFile}}
                                    symmetricKey={this.state.key}/>
                            </View>
                        </TouchableOpacity>
                    }
                    keyExtractor={(item, index) => item.sequence}
                />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    video: {
        width: vw(100),
        height: vw(56.25),
    },
    videoLoading: {
        width: vw(100),
        height: vw(56.25),
        alignItems: 'center',
        justifyContent: 'center',
    },
    listItem: {
        flex: 1,
        flexDirection: 'row'
    },
    list: {
        width: '100%'
    },
    thumbnail: {
        width: vw(100),
        height: vw(56.25),
    },
    liveIndicator: {
        backgroundColor: '#000000',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    liveIndicatorLive: {
        backgroundColor: '#008800',
    },
    liveIndicatorText: {
        textAlign: 'center',
        color: 'white',
        fontSize: 16,
        padding: 15,
    },
    goLiveButton: {
        backgroundColor: 'blue',
        borderRadius: 3,
    },
    goLiveButtonText: {
        fontSize: 16,
        padding: 10,
        color: 'white',
        fontWeight: '600',
    },
    loadingText: {
        fontSize: 20,
        marginTop: vw(10),
        marginBottom: vw(10),
        textAlign: 'center'
    },
});

export default CameraMonitor;
