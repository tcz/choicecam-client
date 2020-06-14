import React from 'react';
import ProviderForm from './ProviderForm'

class DigitalOceanProviderForm extends ProviderForm {
    constructor(props) {
        super(props);
    }

    getType() {
        return 'digitalocean';
    }

    getTitle() {
        return 'Digital Ocean Spaces';
    }

    getFields() {
        return [
            {'name': 'bucketName', 'label': 'Bucket name'},
            {'name': 'region', 'label': 'Region', 'default': 'eu-west-1'},
            {'name': 'key', 'label': 'Key'},
            {'name': 'secret', 'label': 'Secret'},
        ]
    }

    getBackgroundColor() {
        return '#006aff'
    }

    getLogo() {
        return require('../../images/digitalocean.png');
    }
}

export default DigitalOceanProviderForm;
