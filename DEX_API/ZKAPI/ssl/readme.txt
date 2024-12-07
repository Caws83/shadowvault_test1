
Info for replaceing the SSL Cert.
Cert located in /etc/nginx/ssl
sudo su -- gain root access if needed

1) goto https://decoder.link/result
2) input .crt file
3) go down to nginx bundle and save the file
4) rename it server.crt
5) replace server.crt in this folder
6) aquire private key from namecheap ssl/tsl in cpanel for the specific ssl cert.
7) make file server.key with RSA info
8) replace server.key in this folder

3) run -  sudo systemctl restart nginx
