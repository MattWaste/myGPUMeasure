#!/bin/bash
sqld --db gpu_db.db --http-listen-addr 127.0.0.1:8080 --http-cors-domain "*" --http-auth development 