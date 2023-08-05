import { Opt, $query, match, ic, $update, nat32, Record, Vec, blob } from 'azle';
import { managementCanister } from 'azle/canisters/management';

let randomness: blob = Uint8Array.from([]);
import { sha256 } from 'js-sha256';

// This is a global variable that is stored on the heap
type Db = {
    users: {
        [id: string]: User;
    };
};

type User = Record<{
    id: string;
    username: string;
    age: nat32;
}>;

let db: Db = {
    users: {},
};

// Query calls complete quickly because they do not go through consensus
$query;
export function get( id: string): Opt<User> {
    const value = db.users[id];

    return value !== undefined ? Opt.Some(value) : Opt.None;
}

// Update calls take a few seconds to complete
// This is because they persist state changes and go through consensus
$update;
export async function set(username: string, age: nat32): Promise<string> {

    const id = sha256(await getRandomness())
    const user: User = {
        id,
        username,
        age,
    };

    db.users[id] = user;

    return id;
}

$query;
export function getUsers(): Vec<User> {
    return Object.values(db.users);
}

$update;
export async function getRandomness(): Promise<blob> {
    const result = await managementCanister.raw_rand().call();

    return match(result, {
        Ok: (ok) => {
            randomness = ok;
            return ok;
        },
        Err: (err) => ic.trap(err),
    });
}

$query;
export function randomHash(): string {
    return sha256(randomness);
}

$update;
export async function tecdsa(): Promise<blob> {

    const result = await managementCanister.ecdsa_public_key({
        canister_id: Opt.None,
        derivation_path: [],
        key_id: {
            curve: {
                secp256k1: null
            },
            name: 'dfx_test_key',
        },
    }).call();

    return match(result, {
        Ok: (ok) => ok.public_key,
        Err: (err) => ic.trap(err),
    });
}