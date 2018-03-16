#!/bin/bash

WD=$(readlink -f $(dirname "$BASH_SOURCE"))

cd "${WD}/.."

if [ $(which gcloud) != "" ]; then
  gcloud config set project "mdn-confluence"
  mkdir -p ./.local
  if [ -f ./.local/credentials.json ]; then
    echo "gcloud credentials found; skipping key generation"
  else
    gcloud iam service-accounts keys create \
      ./.local/credentials.json \
      --iam-account "mdn-confluence@appspot.gserviceaccount.com"
    if [ "${?}" != "0" ]; then
      echo "gcloud service account key creation failed; logging in"
      gcloud auth login
      if [ "${?}" != "0" ]; then
        echo "gcloud login failed"
      fi
      gcloud iam service-accounts keys create \
        ./.local/credentials.json \
        --iam-account "service-82759018549@firebase-rules.iam.gserviceaccount.com"
      if [ "${?}" != "0" ]; then
        echo "gcloud service account key creation failed"
      fi
    fi
  fi
else
  echo "gcloud not installed; skipping key generation"
fi
