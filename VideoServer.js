import StaticServer from "react-native-static-server";
import * as FileSystem from "expo-file-system";
import {hexToBase64} from './Utilities'

export default class VideoServer
{
    PORT = 7777;

    constructor(key, basePath) {
        this.key = key;
        this.basePath = basePath;
        this.playlistFilename = null;
        this.segments = [];
        this.currentSequence = null;
        this.onUrlChangeCallback = function() {};
        this.onThumbnailListChangeCallback = function() {};
        this.onLiveStatusChangeCallback = function() {};
    }

    start() {
        this.webServer = this.startWebServer();

        this.newPlaylistFileName();
        this.refreshSegmentList()
            .then(function () {
                return this.rewritePlaylistFile();
            }.bind(this)).then(function () {
                this.onUrlChangeCallback(this.currentPlaylistUri());
                this.onThumbnailListChangeCallback(this.segments.slice());
                this.onLiveStatusChangeCallback(true);
            }.bind(this))
            .catch(function (error) {
                console.log(error);
            });

        setInterval(function() {
            this.refreshSegmentList()
                .then(function () {
                    return this.rewritePlaylistFile();
                }.bind(this)).then(function () {
                    this.onThumbnailListChangeCallback(this.segments.slice());
                }.bind(this))
        }.bind(this), 1000);
    }

    seekTo(sequenceNumber) {
        this.newPlaylistFileName();
        this.currentSequence = sequenceNumber;
        this.rewritePlaylistFile(true)
            .then(function () {
                this.onUrlChangeCallback(this.currentPlaylistUri());
                this.onLiveStatusChangeCallback(false);
            }.bind(this));
    }

    goLive() {
        this.newPlaylistFileName();
        this.currentSequence = null;
        this.rewritePlaylistFile(true)
            .then(function () {
                this.onUrlChangeCallback(this.currentPlaylistUri());
                this.onLiveStatusChangeCallback(true);
            }.bind(this));
    }

    onUrlChange(callback) {
        this.onUrlChangeCallback = callback;
    }

    onThumbnailListChange(callback) {
        this.onThumbnailListChangeCallback = callback;
    }

    onLiveStatusChange(callback) {
        this.onLiveStatusChangeCallback = callback;
    }

    newPlaylistFileName() {
        this.playlistFilename = 'playlist' + Math.random() + '.m3u8';
    }

    currentPlaylistUri() {
        return 'http://localhost:' + this.PORT + '/' + this.playlistFilename;
    }

    startWebServer() {
        var documentRoot = FileSystem.documentDirectory.replace('file://', '');
        this.webServer = new StaticServer(this.PORT, documentRoot, {localOnly : true});
        this.webServer.start();
    }

    refreshSegmentList()
    {
        return new Promise(function (resolve, reject) {
            fetch(this.basePath + 'segment_list?cachebust=' + Math.random())
                .then(response => response.text())
                .then((response) => {
                    var segmentList = response;
                    if (segmentList === "") {
                        return;
                    }

                    var segmentNames = segmentList.split("\n");
                    var segments = [];
                    for (var i = 0; i < segmentNames.length; i++) {
                        var segmentName = segmentNames[i];
                        var item = {
                            'videoFile': this.basePath + segmentName + '.ts',
                            'thumbnailFile': this.basePath + segmentName + '.jpg',
                            'sequence': i + 1,
                        };

                        segments.push(item);
                    }

                    this.segments = segments;
                    resolve();
                })
                .catch(reject);
        }.bind(this));
    }

    rewritePlaylistFile() {
        const keyInBase64 = hexToBase64(this.key);
        var playlistStartSequence;
        if (null !== this.currentSequence) {
            playlistStartSequence = this.currentSequence;
        } else {
            var tailSizeForLiveVideo = 4;
            playlistStartSequence = Math.max(1, this.segments.length - tailSizeForLiveVideo + 1);
        }

        var playlistFile = "#EXTM3U\n" +
            (null !== this.currentSequence ? "#EXT-X-PLAYLIST-TYPE:EVENT\n" : "") +
            "#EXT-X-VERSION:3\n" +
            "#EXT-X-TARGETDURATION:8\n" +
            "#EXT-X-ALLOW-CACHE:NO\n" +
            "#EXT-X-MEDIA-SEQUENCE:" + playlistStartSequence + "\n" +
            "#EXT-X-KEY:METHOD=AES-128,URI=\"data:text/plain;base64," + keyInBase64 + "\"\n";

        for (var i = 0; i < this.segments.length; i++) {
            var segment = this.segments[i];

            if (segment.sequence < playlistStartSequence) {
                continue;
            }
            playlistFile = playlistFile + "#EXTINF:8.333333,\n" +
                this.segments[i].videoFile + "?cachebust=" + this.playlistFilename + "\n";
        }

        var uri = FileSystem.documentDirectory + this.playlistFilename;
        return FileSystem.writeAsStringAsync(uri, playlistFile);
    }


}
