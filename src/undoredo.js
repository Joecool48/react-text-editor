import StoreState from "./storestate"
// global array of states that can be undoed and redoed
class UndoRedo {
    constructor() {
        this.stateArray = []
    }
// pushes a state object to the array
   addRecentState(state) {
       this.stateArray.push(state)
   }

   removeRecentState() {
       this.stateArray.pop()
   }
}
export default UndoRedo
