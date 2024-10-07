1. Create network: docker network create elastic
2. docker pull docker.elastic.co/elasticsearch/elasticsearch:8.15.2
3. docker run --name es-bitback --net elastic -p 9200:9200 -p 9300:9300 -it docker.elastic.co/elasticsearch/elasticsearch:8.15.2

✅ Elasticsearch security features have been automatically configured!
✅ Authentication is enabled and cluster connections are encrypted.

ℹ️ Password for the elastic user (reset with `bin/elasticsearch-reset-password -u elastic`):
62s-UczbR-Wtt9QL=Cca

ℹ️ HTTP CA certificate SHA-256 fingerprint:
1c29d8428031ede9f7565940e5c06367beccffe9d93385f60cd12fe34552f647

ℹ️ Configure Kibana to use this cluster:
• Run Kibana and click the configuration link in the terminal when Kibana starts.
• Copy the following enrollment token and paste it into Kibana in your browser (valid for the next 30 minutes):
eyJ2ZXIiOiI4LjE0LjAiLCJhZHIiOlsiMTcyLjIyLjAuMjo5MjAwIl0sImZnciI6IjFjMjlkODQyODAzMWVkZTlmNzU2NTk0MGU1YzA2MzY3YmVjY2ZmZTlkOTMzODVmNjBjZDEyZmUzNDU1MmY2NDciLCJrZXkiOiJ2YkxSWlpJQlluOHpEbmFYNG1IQTpBTk8tX3lJa1RzSzhUV19rYnJneS13In0=

ℹ️ Configure other nodes to join this cluster:
• Copy the following enrollment token and start new Elasticsearch nodes with `bin/elasticsearch --enrollment-token <token>` (valid for the next 30 minutes):
eyJ2ZXIiOiI4LjE0LjAiLCJhZHIiOlsiMTcyLjIyLjAuMjo5MjAwIl0sImZnciI6IjFjMjlkODQyODAzMWVkZTlmNzU2NTk0MGU1YzA2MzY3YmVjY2ZmZTlkOTMzODVmNjBjZDEyZmUzNDU1MmY2NDciLCJrZXkiOiJ2N0xSWlpJQlluOHpEbmFYNG1IQjpHTTNwNUI4UlRrV2tIeV82NXdGZzVRIn0=

# go to: https://localhost:9200/

Nên cài KIBANA để quản lý trên UI cho dễ.

4. docker pull docker.elastic.co/kibana/kibana:8.15.2
5. docker run --name kib-bitback --net elastic -p 5601:5601 docker.elastic.co/kibana/kibana:8.15.2
6. Enrollment token:
7. Go to devtool in manager
8. Insert data vào elastic search xong để mà search
9.
