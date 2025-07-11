#!/bin/bash

REGISTRY="ghcr.io"
REPOSITORY="ownyourdata"
CONTAINER="intermediary-frontend"
TAG="latest"

# read commandline options
BUILD_CLEAN=false
DOCKER_UPDATE=false
BUILD_ARM=false
PLATFORM="linux/amd64"
BUILD_X86=true
BUILD_LOCAL=false
DOCKERFILE="./docker/Dockerfile"

while [ $# -gt 0 ]; do
    case "$1" in
        --clean*)
            BUILD_CLEAN=true
            ;;
        --dockerhub*)
            DOCKER_UPDATE=true
            ;;
        --arm*)
            BUILD_X86=false
            BUILD_ARM=true
            PLATFORM="linux/arm64"
            DOCKERFILE="${DOCKERFILE}.arm64v8"
            TAG="arm64v8"
            ;;
        --x86*)
            BUILD_X86=true
            PLATFORM="linux/amd64"
            DOCKERFILE="${DOCKERFILE}.x86"
            ;;
        *)
            printf "unknown option(s)\n"
            if [ "${BASH_SOURCE[0]}" != "${0}" ]; then
                return 1
            else
                exit 1
            fi
    esac
    shift
done

if $BUILD_CLEAN; then
    docker build --platform $PLATFORM --no-cache -f $DOCKERFILE -t  $REGISTRY/$REPOSITORY/$CONTAINER:$TAG .
else
    docker build --platform $PLATFORM -f $DOCKERFILE -t $REGISTRY/$REPOSITORY/$CONTAINER:$TAG .
fi

if $DOCKER_UPDATE; then
    docker push $REGISTRY/$REPOSITORY/$CONTAINER:$TAG
fi
