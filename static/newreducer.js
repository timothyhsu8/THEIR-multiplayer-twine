var socket = io();

// User connects
socket.on('connect', () => {
    // console.log("CONNECT SOCKET ON", socket.id);
    socket.emit('new user', socket.id);

    // If this is the first time a user is connecting, assign them a userId in local storage
    if (localStorage.getItem('userId') === null) {
        localStorage.setItem('userId', socket.id);
        SugarCube.State.setVar('$userId', socket.id);
    }

    // Returning user, get correct user state from database
    else {
        let userId = localStorage.getItem('userId')
        SugarCube.State.setVar('$userId', userId);
    }
})

socket.on('new connection', (gstate) => {
    // console.log('CLIENT, getting server state', gstate);
    store.dispatch({type: 'UPDATEGAME', payload: gstate})
    store.dispatch({type: 'UPDATESTORE', payload: gstate})
})

// Incoming difference, update your state and store
socket.on('difference', (state) => {
    store.dispatch({type: 'UPDATEGAME', payload:state})
    store.dispatch({type: 'UPDATESTORE', payload: state})
})

function reducer(state, action){
    if(typeof state === 'undefined'){
        return {...state, ...SugarCube.State.variables}
    }
    switch(action.type){
        case 'UPDATESTORE':
            console.log('Updating Store')
            socket.emit('difference', {...state, ...action.payload})
            return {...state, ...action.payload}
        case 'UPDATEGAME':
            console.log('Updating Game');
            updateSugarCubeState(action.payload);
            return
        default:
            return state
    }
}

var store = Redux.createStore(reducer);

setInterval(update, 100)    // Check for differences and send a socket event to the server with your current state if differences are found 

function update(){
    // If differences between SugarCube state and store detected, update your store and the other clients
    if(!_.isEqual(SugarCube.State.variables, store.getState())){
        let diff = difference(SugarCube.State.variables, store.getState());
        console.log("DIFF:", difference(SugarCube.State.variables, store.getState()));
        store.dispatch({type: 'UPDATESTORE', payload: diff});
        updateSugarCubeState(store.getState());
    }
}

function printVars(){
    console.log("STORE:", store.getState());
    console.log("SUGARCUBE:", SugarCube.State.variables);
}

function difference(object, base) {
	function changes(object, base) {
		return _.transform(object, function(result, value, key) {
			if (!_.isEqual(value, base[key])) {
				result[key] = (_.isObject(value) && _.isObject(base[key])) ? changes(value, base[key]) : value;
			}
		});
	}
	return changes(object, base);
}

function updateSugarCubeState(new_state) {
    for (const [key, value] of Object.entries(new_state)) {
        SugarCube.State.variables[key] = value
    }
    SugarCube.Engine.show()
}

function printUser() {
    const userId = SugarCube.State.variables.userId
    console.log(`User is ${userId}`)
    console.log(SugarCube.State.variables.users[userId])
}