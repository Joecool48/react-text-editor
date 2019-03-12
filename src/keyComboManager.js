const SHIFT_SCAN_CODE = 16
const CAPS_LOCK_SCAN_CODE = 20

const CAPS_CHARACTER_PRIME_OFFSET = 256

class KeyComboManager {

    constructor(maxKeyCombo) {
        // set the max key combo to store
        this.maxKeyCombo = maxKeyCombo
        // a set of all the scancode keys for specials like shift and cntl
        this.specialKeysHeld = Set() // set based on scancodes

        this.keyComboArray = []
        // create the array for combos. array index 0 has the first key pressed,
        // and index 1 has 2 keys, etc. Resets after it reaches its max and the
        // entire array is hashed and checked if that macro is registered
        for (var i = 0; i < maxKeyCombo; i++) {
            this.keyComboArray.push([])
        }

        // table based on code
        this.shiftModLookup = {
            KeyA: 'A',
            KeyB: 'B',
            KeyC: 'C',
            KeyD: 'D',
            KeyE: 'E',
            KeyF: 'F',
            KeyG: 'G',
            KeyH: 'H',
            KeyI: 'I',
            KeyJ: 'J',
            KeyK: 'K',
            KeyL: 'L',
            KeyM: 'M',
            KeyN: 'N',
            KeyO: 'O',
            KeyP: 'P',
            KeyQ: 'Q',
            KeyR: 'R',
            KeyS: 'S',
            KeyT: 'T',
            KeyU: 'U',
            KeyV: 'V',
            KeyW: 'W',
            KeyX: 'X',
            KeyY: 'Y',
            KeyZ: 'Z',
            BackQuote: '~',
            Digit1: '!',
            Digit2: '@',
            Digit3: '#',
            Digit4: '$',
            Digit5: '%',
            Digit6: '^',
            Digit7: '&',
            Digit8: '*',
            Digit9: '(',
            Digit0: ')',
            Minus: '_',
            Equal: '+',
            BracketLeft: '{',
            BracketRight: '}',
            BackSlash: '|',
            SemiColon: ':',
            Quote: '"',
            Comma: '<',
            Period: '>',
            Slash: '?'
        }
    }
    // returns a matching combo satisfied for a given mode
    getHandlerForMode(mode) {
        for (var i = 0; i < this.keyComboArray.length; i++) {
            var mapVal = this.hashKeyCombo(this.keyComboArray[i])
            // if it exists, then return the function handler
            if (typeof(this.keyComboArray[mode][mapVal]) === 'undefined') return this.keyComboArray[mode][mapVal]
        }
    }

    // hashes the keycombo array by turning it into a null delimited string
    hashKeyCombo(comboArray) {
        var mapVal = ""
        // hash the array with keys seperated by null terminating strings
        for (var i = 0; i < comboArray.length; i++) {
            mapVal = mapVal + comboArray[i] + '\0'
        }
        return mapVal
    }
    // maps the mode to the combo which maps to the function keyHanlder called when that is in the map
    registerKeyCombo(comboArray, modeList, keyHandler) {
        var mapVal = hashKeyCombo(comboArray)
        for (var i = 0; i < modeList.length; i++) {
            this.keyComboArray[modeList[i]][mapVal] = keyHandler // map it to the function for each mode
        }
    }
    // unmaps the function from the combo in all the modes
    unregisterKeyCombo(comboArray, modeList) {
        var mapVal = hashKeyCombo(comboArray)
        for (var i = 0; i < modeList.length; i++) {
            delete this.keyComboArray[modeList][mapVal] // remove it from the map
        }
    }

    isRegularKey(event) {
        // check if in the valid displayable character struct
        return ("undefined" === typeof(this.shiftModLookup[event.code])) || event.key === "Space"
    }

    // should only be called if key is not special
    getRealKey(event) {
        // only shift it if the caps lock XOR shift is true
        if ((this.specialKeysHeld.has(SHIFT_SCAN_CODE) && !this.specialKeysHeld.has(CAPS_LOCK_SCAN_CODE)) || (!this.specialKeysHeld.has(SHIFT_SCAN_CODE) && this.specialKeysHeld.has(CAPS_LOCK_SCAN_CODE))) {
            return this.shiftModLookup[event.code] // use the code to get the shift version of the character
        }
        // otherwise dont modify and return the key
        return event.key
    }

    keyPressed(event) {
        if (!this.isRegularKey(event))
            this.specialKeysHeld.add(event.which)
        for (var i = 0; i < this.maxKeyCombo; i++) {
            if (this.isRegularKey(event)) {
                if (this.keyComboArray[i].length === i + 1) {
                    this.keyComboArray[i].clear() // wipe the array so that we can restart with the combo
                }
                this.keyComboArray[i].push(this.getRealKey(event)) // add the scancode
            }
        }
    }
    
    keyUnpressed(event) {
        if (!this.isRegularKey(event))
            this.specialKeysHeld.remove(event.which)
    }

}
