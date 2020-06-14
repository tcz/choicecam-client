import React from 'react';
import ProviderForm from './ProviderForm'

class AwsProviderForm extends ProviderForm {
    constructor(props) {
        super(props);
    }

    getType() {
        return 'aws';
    }

    getTitle() {
        return 'Amazon AWS S3';
    }

    getFields() {
        return [
            {'name': 'bucket_name', 'label': 'Bucket name', 'default': 'choicecam'},
            {'name': 'region', 'label': 'Region', 'default': 'eu-west-1'},
            {'name': 'key', 'label': 'Key', 'default': 'choicecam'},
            {'name': 'secret', 'label': 'Secret', 'default': 'choicecam'},
        ]
    }

    getBackgroundColor() {
        return '#ff9a00';
    }

    getLogo() {
        return require('../../images/aws.png');
    }
}

export default AwsProviderForm;
