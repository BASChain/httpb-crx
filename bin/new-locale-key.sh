#!/bin/bash

read -p "Key: " key
read -p "Message: " message

dir=$(dirname $0)

cat $dir/../app/_locales/en/messages.json | \
	jq --arg foo bar ". + {\"${key}\": {\"message\": \"${message}\",\"description\":\"${message}\"}}" | \
	sponge $dir/../app/_locales/en/messages.json

tail -10 $dir/../app/_locales/en/messages.json