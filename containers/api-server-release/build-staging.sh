#!/bin/bash

docker build -t chriswininger/infinite-industries:api-server-staging --build-arg GIT_VERSION=development ./
