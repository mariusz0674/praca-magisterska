- ```mvn -DskipTests clean package```
- ```npm ci``` ``` npm run build```
## generator
``` docker build -t pm-generator:latest .```
```
docker run --rm --name pm-generator \
  --network docker_default \
  -e SPRING_PROFILES_ACTIVE=docker \
  pm-generator:latest
```
## pooling
### BE 
```docker build -t pm-pooling-be:latest .```
```
docker run --rm --name pm-pooling-be \
  --network docker_default \
  -p 8071:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  pm-pooling-be:latest
```
### FE 


```docker build -t pm-pooling-fe:latest .```

```
docker run --rm --name pm-pooling-fe \
  --network docker_default \
  -p 4201:80 \
  pm-pooling-fe:latest
```

## SSE
### BE
```docker build -t pm-sse-be:latest .```
```
docker run --rm --name pm-sse-be \
  --network docker_default \
  -p 8073:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  pm-sse-be:latest
```
### FE


```docker build -t pm-sse-fe:latest .```

```
docker run --rm --name pm-sse-fe \
  --network docker_default \
  -p 4203:80 \
  pm-sse-fe:latest
```

## WebSocket
### BE
```docker build -t pm-ws-be:latest .```
```
docker run --rm --name pm-ws-be \
  --network docker_default \
  -p 8072:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  pm-ws-be:latest
```
### FE


```docker build -t pm-ws-fe:latest .```

```
docker run --rm --name pm-ws-fe \
  --network docker_default \
  -p 4202:80 \
  pm-ws-fe:latest
```
