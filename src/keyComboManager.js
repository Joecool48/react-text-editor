//const SHIFT_SCAN_CODE = 16
//const CAPS_LOCK_SCAN_CODE = 20

const START_MODE = "Insert"

class KeyComboManager {

    constructor(maxKeyCombo, stateChangeCallback) {
        // set the max key combo to store
        this.maxKeyCombo = maxKeyCombo
        // a set of all the scancode keys for specials like shift and cntl
        this.specialKeysHeld = new Set() // set based on scancodes

        this.keyComboArray = []

        this.registeredHandlers = new Map()

        this.mode = START_MODE
        
        // array of numbers preceding a macro
        this.numbers = []

        // create the array for combos. array index 0 has the first key pressed,
        // and index 1 has 2 keys, etc. Resets after it reaches its max and the
        // entire array is hashed and checked if that macro is registered
        for (var i = 0; i < maxKeyCombo; i++) {
            this.keyComboArray.push([])
        }
        this.line = 0
        this.col = 0
        // a flag on whether to flush the buffers that keep track of the commands
        this.flushCommandBuffers = false

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
        // register the function to call when the mode changes
        if (stateChangeCallback !== undefined) {
            this.stateChangeCallback = stateChangeCallback
        }
    }
    
    convertArrayToNumber(arr) {
        console.log(arr)
        var num = 0
        var multiplier = 1
        for (var i = arr.length - 1; i >= 0; i--) {
            num += parseInt(arr[i]) * multiplier
            multiplier *= 10
        }
        return num
    }
    clearKeyCombo() {
        for (var i = 0; i < this.maxKeyCombo; i++) {
            this.keyComboArray[i] = []
        }
    }
    // returns a matching combo satisfied for a given mode
    getHandlerForMode() {
        for (var i = 0; i < this.keyComboArray.length; i++) {
            var mapVal = this.hashKeyCombo(this.keyComboArray[i])
            // if it exists, then return the function handler
            if (this.registeredHandlers.has(this.mode) && this.registeredHandlers.get(this.mode).has(mapVal)) {     

                var num = 1
                // repeat only works in non-insert modes
                if (this.numbers.length !== 0 && this.mode !== "Insert") {
                    num = this.convertArrayToNumber(this.numbers)
                }
                this.numbers = []

                this.clearKeyCombo()
                console.log("Repeated: ", mapVal, num, "times") 
//                return this.registeredHandlers.get(this.mode).get(mapVal) 
                return {
                    handler: this.registeredHandlers.get(this.mode).get(mapVal),
                    multiplier: num
                }

            }
        }
        return undefined
    }

    setMode(mode) {
        this.mode = mode
        this.stateChangeCallback(mode, this.line, this.col)
    }
    setCursorPos(line, col) {
        this.line = line
        this.col = col
        this.stateChangeCallback(this.mode, line, col)
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
        var mapVal = this.hashKeyCombo(comboArray)
        for (var i = 0; i < modeList.length; i++) {
            if (!this.registeredHandlers.has(modeList[i])) {
                this.registeredHandlers.set(modeList[i], new Map())
            }

            this.registeredHandlers.set(modeList[i], this.registeredHandlers.get(modeList[i]).set(mapVal, keyHandler)) // map it to the function for each mode
        }
    }
    // unmaps the function from the combo in all the modes
    unregisterKeyCombo(comboArray, modeList) {
        var mapVal = this.hashKeyCombo(comboArray)
        for (var i = 0; i < modeList.length; i++) {
            if (this.registeredHandlers.has(modeList[i]) && this.registeredHandlers.get(modeList[i]).has(mapVal))
                var newMap = this.registeredHandlers.get(modeList[i]) // remove it from the map
                delete newMap.delete(mapVal)
                this.registeredHandlers.set(modeList[i], newMap)
        }
    }

    isRegularKey(event) {
        // check if in the valid displayable character struct
        return event.key !== "Shift" && event.key !== "CapsLock"
    }

    // should only be called if key is not special
    getRealKey(event) {
        return event.key
    }
    
    isNumber(event) {
        return event.key >= 0 && event.key <= 9
    }
    keyPressed(event) {
        // get the number of times to complete the action
        if (this.isNumber(event)) {
            this.numbers.push(event.key)
            return
        }
        if (!this.isRegularKey(event))
            this.specialKeysHeld.add(event.which)
        for (var i = 0; i < this.maxKeyCombo; i++) {
            if (!this.isRegularKey(event)) {
                // flush the buffers
                this.keyComboArray[i] = []
                continue
            }
            else if (this.isRegularKey(event)) {
                if (this.keyComboArray[i].length === i + 1 || this.flushCommandBuffers) {
                    this.keyComboArray[i] = [] // wipe the array so that we can restart with the combo
                }
                this.keyComboArray[i].push(this.getRealKey(event)) // add the scancode
            }
        }
        this.flushCommandBuffers = false

    }

    keyUnpressed(event) {
        if (!this.isRegularKey(event))
            this.specialKeysHeld.delete(event.which)
    }

}

export default KeyComboManager
