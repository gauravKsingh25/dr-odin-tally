docker rmi -f $(docker images -q)
docker tag odin_server:latest odin_server:previous
docker tag odin_client:latest odin_client:previous
docker-compose up -d --build

