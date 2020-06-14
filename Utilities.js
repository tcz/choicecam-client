
export function hexToBase64(hex) {
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    var base64Codes = [];

    function appendCodeForSixBitCode(sixBitCode) {
        base64Codes.push(characters.substring(sixBitCode, sixBitCode + 1));
    }
    function appendPadding() {
        base64Codes.push('=');
    }

    var i = 0;
    var previousByte;
    var remainingBits = 0;
    while (true) {
        var byte = parseInt(hex.substring(i, i + 2), 16);
        switch (remainingBits) {
            case 0:
                appendCodeForSixBitCode(byte >>> 2);
                remainingBits = 2;
                break;
            case 2:
                appendCodeForSixBitCode(((previousByte & 3) << 4) |  (byte >>> 4));
                remainingBits = 4;
                break;
            case 4:
                appendCodeForSixBitCode(((previousByte & 15) << 2) |  (byte >>> 6));
                appendCodeForSixBitCode(byte & 63);
                remainingBits = 0;
        }


        previousByte = byte;
        i = i + 2;
        if (i >= hex.length) {
            switch (remainingBits) {
                case 2:
                    appendCodeForSixBitCode((byte & 3) << 4);
                    appendPadding();
                    appendPadding();
                    break;
                case 4:
                    appendCodeForSixBitCode((byte & 15) << 2);
                    appendPadding();
                    break;
            }
            break;
        }
    }

    return base64Codes.join("");
}
