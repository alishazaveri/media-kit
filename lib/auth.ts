export const SALT_ROUNDS = 12;

// Valid bcrypt hash used as a timing dummy — bcrypt.compare against this when
// a user isn't found, so "unknown email" and "wrong password" take the same
// time and can't be distinguished by an attacker measuring response latency.
export const DUMMY_HASH = "$2b$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy";
