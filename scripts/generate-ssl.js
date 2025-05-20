const forge = require('node-forge');
const fs = require('fs');
const path = require('path');

// Create ssl directory if it doesn't exist
const sslDir = path.join(__dirname, '../ssl');
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
}

// Generate a new key pair
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();

// Set certificate details
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
    name: 'commonName',
    value: 'localhost'
}, {
    name: 'countryName',
    value: 'US'
}, {
    shortName: 'ST',
    value: 'State'
}, {
    name: 'localityName',
    value: 'City'
}, {
    name: 'organizationName',
    value: 'Test'
}, {
    shortName: 'OU',
    value: 'Test'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Self-sign the certificate
cert.sign(keys.privateKey);

// Convert to PEM format
const privateKeyPem = forge.pki.privateKeyToPem(keys.privateKey);
const certificatePem = forge.pki.certificateToPem(cert);

// Save the files
fs.writeFileSync(path.join(sslDir, 'private.key'), privateKeyPem);
fs.writeFileSync(path.join(sslDir, 'certificate.crt'), certificatePem);

console.log('SSL certificates generated successfully!'); 