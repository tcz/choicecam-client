import React from 'react';
import ProviderForm from './ProviderForm'

class AzureProviderForm extends ProviderForm {
    constructor(props) {
        super(props);
    }

    getType() {
        return 'azure';
    }

    getTitle() {
        return 'Microsoft Azure Blob Storage';
    }

    getFields() {
        return [
            {'name': 'container_name', 'label': 'Container name', 'default': 'choicecam'},
            {'name': 'connection_string', 'label': 'Connection string'},
            {'name': 'secret', 'label': 'Secret'},
        ]
    }

    getBackgroundColor() {
        return '#7eba01'
    }

    getLogo() {
        return require('../../images/azure.png');
    }
}

export default AzureProviderForm;
