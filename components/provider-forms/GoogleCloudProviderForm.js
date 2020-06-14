import React from 'react';
import ProviderForm from './ProviderForm'

class GoogleCloudProviderForm extends ProviderForm {
    constructor(props) {
        super(props);
    }

    getType() {
        return 'googlecloud';
    }

    getTitle() {
        return 'Google Cloud Storage';
    }

    getFields() {
        return [
            {'name': 'bucketName', 'label': 'Bucket name'},
            {'name': 'key', 'label': 'Key'},
            {'name': 'secret', 'label': 'Secret'},
        ]
    }

    getBackgroundColor() {
        return '#4d8df5'
    }

    getLogo() {
        return require('../../images/googlecloud.png');
    }
}

export default GoogleCloudProviderForm;
