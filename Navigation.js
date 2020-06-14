import React from 'react';
import {
    createSwitchNavigator,
    createAppContainer,
} from 'react-navigation';

import { createStackNavigator } from 'react-navigation-stack';

import CameraMonitor from './screens/CameraMonitor';
import CodeScanner from './screens/CodeScanner';
import StartupRouter from './screens/StartupRouter';
import DeviceSearch from './screens/DeviceSearch';
import DeviceSetup from "./screens/DeviceSetup";

const ConfigureStack = createStackNavigator({
    CodeScanner: {
        screen: CodeScanner,
        navigationOptions: {
            headerTitle: 'Scan Camera QR Code',
        },
    },
    DeviceSearch: {
        screen: DeviceSearch,
        navigationOptions: {
            headerShown: false,
        },
    },
    DeviceSetup: {
        screen: DeviceSetup,
        navigationOptions: {
            headerTitle: 'Select your storage provider',
        },
    },
});

const AppNavigator = createAppContainer(createSwitchNavigator({
    StartupRouter: {
        screen: StartupRouter,
    },
    Unconfigured: {
        screen: ConfigureStack,
    },
    Configured: {
        screen: CameraMonitor,
    },
}));

export default AppNavigator;
