let fs = require('fs');
let Client = require('ssh2-sftp-client');
let sftp = new Client();

const remotePath = '/';
const logFolder = '../../INTEGRACAO_FTP/LOG';
const EventEmitter = require('events');
EventEmitter.defaultMaxListeners = 25;


function enviarArquivos() {
    sftp.connect({
        host: '',
        port: '',
        password: '',
        username: '',
        algorithms: {
            kex: [
                "diffie-hellman-group1-sha1",
                "ecdh-sha2-nistp256",
                "ecdh-sha2-nistp384",
                "ecdh-sha2-nistp521",
                "diffie-hellman-group-exchange-sha256",
                "diffie-hellman-group14-sha1"
            ],
            cipher: [
                "3des-cbc",
                "aes128-ctr",
                "aes192-ctr",
                "aes256-ctr",
                "aes128-gcm",
                "aes128-gcm@openssh.com",
                "aes256-gcm",
                "aes256-gcm@openssh.com"
            ],
            serverHostKey: [
                "ssh-rsa",
                "ecdsa-sha2-nistp256",
                "ecdsa-sha2-nistp384",
                "ecdsa-sha2-nistp521"
            ],
            hmac: [
                "hmac-sha2-256",
                "hmac-sha2-512",
                "hmac-sha1"
            ]
        },
    }).then(() => {
        console.log('-------------------------------------');
        console.log('Exportador de arquivos para o FTP')
        console.log('-------------------------------------');
        console.log('Conectado ao servidor!')
        return sftp.list('/');
    }).then(() => {
        console.log('Listando arquivos da pasta')
        return fs.promises.readdir('../../INTEGRACAO_FTP/');
    }).then((files) => {
        // Filtrar apenas arquivos com extensão .txt
        console.log('Filtrando arquivos a serem enviados')
        const txtFiles = files.filter(file => file.endsWith('.TXT'));

        // Enviar arquivos via SFTP
        console.log('Enviando arquivos para a FTP, por favor aguarde...')
        return Promise.all(txtFiles.map(file => {
            return sftp.put(`../../INTEGRACAO_FTP/${file}`, `${remotePath}/${file}`);
        }));
    }).then(() => {
        console.log('Arquivos enviados com sucesso!');
        return fs.promises.readdir('../../INTEGRACAO_FTP/');
    }).then((files) => {
        console.log('Movendo arquivos enviados para a pasta de LOG')
        return Promise.all(files.map(file => {
            if (file.endsWith('.TXT')) {
                return fs.promises.rename(`../../INTEGRACAO_FTP/${file}`, `${logFolder}/${file}`);
            }
        }))
    }).then(() => {
        console.log('Arquivos movidos com sucesso!')
        sftp.end();
        console.log('Conexão encerrada! Bye bye!');
        console.log('-------------------------------------');
        console.log('Proximo envio em 24 horas');
    }).catch((err) => {
        console.error(err);
        sftp.end();
    }).catch(err => {
        console.log(err, 'catch error');
    });
}
enviarArquivos();
setInterval(enviarArquivos, 24 * 60 * 60 * 1000); // 24 horas em milissegundos
