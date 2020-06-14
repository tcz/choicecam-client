import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import Input from '../Input';
import Button from '../Button';
import { vw, vh, vmin, vmax } from 'react-native-expo-viewport-units';

class ProviderForm extends React.Component {

    constructor(props) {
        super(props);
        this.credentials = {};
        this.state = {
            expanded: false,
        };

        const fields = this.getFields();
        for (var i = 0; i < fields.length; i++) {
            var defaultValue = fields[i].default !== undefined ? fields[i].default : '';
            this.credentials[fields[i].name] = defaultValue;
        }
    }

    handleSave() {
        if (this.props.onSave) {
            this.props.onSave({
                type: this.getType(),
                credentials: this.credentials
            });
        }
    }

    onToggle() {
        this.setState({expanded: !this.state.expanded});
        console.log(this.state.expanded);
    }

    render() {
        const title = this.getTitle();
        const fields = this.getFields();
        const backgroundColor = this.getBackgroundColor();
        const logo = this.getLogo();

        var fieldElements = [];
        for (var i = 0; i < fields.length; i++) {
            var defaultValue = fields[i].default !== undefined ? fields[i].default : '';
            fieldElements.push(
                <Input
                    label={fields[i].label}
                    defaultValue={defaultValue}
                    onChangeText={function(name, component) {
                        return function(text) {
                            component.credentials[name] = text;
                        }
                    }(fields[i].name, this)}
                />
            );
        }

        return (
            <View style={[styles.container, {backgroundColor: backgroundColor}]}>
                <TouchableOpacity style={styles.titleButton} onPress={this.onToggle.bind(this)}>
                    <Image style={styles.logo} source={logo} />
                    <Text style={styles.title}>{title}</Text>
                </TouchableOpacity>
                <View style={[styles.formView, this.state.expanded ? undefined : styles.hidden]}>
                    {fieldElements}
                    <Button
                        text="Save"
                        onPress={this.handleSave.bind(this)}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius:10,
        borderWidth: 0,
        marginTop: vw(5),
        marginLeft: vw(5),
        marginRight: vw(5),
        padding: vw(5),
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    title: {
        fontSize: 20,
        color: '#fff'
    },
    titleButton: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    logo: {
        width: 35,
        height: 35,
        marginRight: 17,
    },
    hidden: {
        display: 'none',
    },
    formView: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
});

export default ProviderForm;
