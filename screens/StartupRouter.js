import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import {readConfig, deleteConfig} from '../Configuration'

class StartupRouter extends React.Component {

    static firstRun = true;

    componentDidMount() {
        if (StartupRouter.firstRun) {
            Promise.all([
                deleteConfig('base_path'),
                deleteConfig('symmetric_key'),
            ]).then(function() {
                this.routeBasedOnConfig();
                StartupRouter.firstRun = false;
            }.bind(this));
        } else {
            this.routeBasedOnConfig();
        }
    }

    routeBasedOnConfig() {
        const navigation = this.props.navigation;

        Promise.all([
            readConfig('base_path'),
            readConfig('symmetric_key'),
        ]).then((values) => {
            var basePath = values[0];
            var symmetricKey = values[1];

            if (symmetricKey && basePath) {
                navigation.navigate('Configured', {
                    symmetricKey: symmetricKey,
                    basePath: basePath,
                });
                return;
            }

            navigation.navigate('Unconfigured');
        });
    }

    render() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
}

export default StartupRouter;
