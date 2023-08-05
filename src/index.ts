import { Opt, $query, $update, nat32, Record } from 'azle';

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
export function set(key: string, value: string): void {
    db[key] = value;
}