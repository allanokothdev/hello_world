import { Opt, $query, $update } from 'azle';

// This is a global variable that is stored on the heap
type Db = {
    [key: string]: string,
};

let db: Db = {};

// Query calls complete quickly because they do not go through consensus
$query;
export function get( key: string): Opt<string> {
    const value = db[key];

    return value !== undefined ? Opt.Some(value) : Opt.None;
}

// Update calls take a few seconds to complete
// This is because they persist state changes and go through consensus
$update;
export function set(key: string, value: string): void {
    db[key] = value;
}