const crypto = require('crypto');

function generatePassword(username, accountno, partnerpassword, timestamp) {
    const data = username + accountno + partnerpassword + timestamp;
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}

export default generatePassword