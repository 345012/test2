
[参考](https://blog.csdn.net/qq_35178316/article/details/119612596)

openssl genrsa -des3 -out myRootCA.key 2048

openssl req -x509 -new -nodes -key myRootCA.key -sha256 -days 1024 -out myRootCA.pem

openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <(cat server.cnf)  

openssl x509 -req -in server.csr -CA myRootCA.pem -CAkey myRootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext
