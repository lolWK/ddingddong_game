import {
	ref,
	onValue,
	remove,
	update,
	db,
	onChildAdded,
	set,
	onChildRemoved,
} from '../firebase/firebase.js';

import { store } from './store.js';
import { getRandomSafeSpot, getKeyString, randomFromArray } from './helper.js';

function placeCoin() {
	const { x, y } = getRandomSafeSpot();
	const coinRef = ref(db, `coins/${getKeyString(x, y)}`);
	set(coinRef, {
		x,
		y,
	});

	const coinTimeouts = [2000, 3000, 4000, 5000];
	setTimeout(() => {
		placeCoin();
	}, randomFromArray(coinTimeouts));
}

export function setupCoin(gameContainer) {
	const allCoinsRef = ref(db, 'coins');
	const coinElements = store.getState().coinElements;

	store.setState({ allCoinsRef });

	onValue(store.getState().allCoinsRef, (snapshot) => {
		console.log(store.getState().allCoinsRef);
		let coins = snapshot.val() || {};
		store.setState({ coins });
	});

	onChildAdded(allCoinsRef, (snapshot) => {
		const coin = snapshot.val();
		const key = getKeyString(coin.x, coin.y);
		const coins = store.getState().coins;

		coins[key] = true;
		const coinElement = createCoinElement(coin, key, coinElements);
		console.log(coinElement);
		gameContainer.appendChild(coinElement);
	});

	onChildRemoved(allCoinsRef, (snapshot) => {
		const { x, y } = snapshot.val();
		const keyToRemove = getKeyString(x, y);
		gameContainer.removeChild(coinElements[keyToRemove]);
		delete coinElements[keyToRemove];
	});

	placeCoin();
}