import * as SecureStore from 'expo-secure-store';

export async function readConfig(key) {
    return await SecureStore.getItemAsync(key);
}

export async function writeConfig(key, value) {
    await SecureStore.setItemAsync(
        key,
        value,
        {
            keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK
        }
    );
}

export async function deleteConfig(key) {
    return await SecureStore.deleteItemAsync(key);
}
