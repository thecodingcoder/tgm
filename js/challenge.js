let z_c = 0;   // Number variable
let zz = "";    // String variable
let z_i = 0;    // Number variable
let z_h = 0;    // Number variable
window.hash_z_s = 8;
window.hash_diff = 64;
function z_ch2(hash_diff) {
    // Iterate from 0 to hash_diff - 1 (i.e., chLoop)
    for (let loopindex = 0; loopindex < hash_diff; loopindex++) {
        // Assign `tournamentToken` to zz (this is likely a string you want to use)
        zz = window.gameToken;  // Assuming `tournamentToken` is a string defined elsewhere

        // Set loop index
        z_i = loopindex;

        // Get the character code at the loop index
        z_c = zz.charCodeAt(z_i);

        // Perform hash operation (left-shifting and updating z_h)
        z_h = (z_h << window.hash_z_s) - z_h + z_c;

        // Ensure z_h is an integer (bitwise OR with 0)
        z_h |= 0;
    }

    // Return the final value of z_h
    return z_h;
}