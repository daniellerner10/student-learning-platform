const forge = require('node-forge');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Read the certificate
const certPath = path.join(__dirname, '../ssl/certificate.crt');
const certPem = fs.readFileSync(certPath, 'utf8');

// Convert PEM to DER format
const certDer = forge.util.encode64(forge.pem.decode(certPem)[0].body);

// Create a temporary .cer file
const tempCertPath = path.join(__dirname, '../ssl/temp.cer');
fs.writeFileSync(tempCertPath, Buffer.from(certDer, 'base64'));

try {
    // Install the certificate in the Windows certificate store
    execSync(`certutil -addstore -f "ROOT" "${tempCertPath}"`, { stdio: 'inherit' });
    console.log('Certificate installed successfully in the Windows certificate store!');
} catch (error) {
    console.error('Error installing certificate:', error);
} finally {
    // Clean up the temporary file
    fs.unlinkSync(tempCertPath);
} 