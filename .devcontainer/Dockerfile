FROM ghcr.io/twin-digital/devcontainer-nodejs:main

# Suppress an apt-key warning about standard out not being a terminal. Use in this script is safe.
ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=DontWarn

ENV NVM_DIR /home/devuser/.nvm
ENV DEFAULT_NODE_VERSION 14

# install packages needed for electron development
RUN sudo apt-get update && \
  export DEBIAN_FRONTEND=noninteractive && \
  sudo -E apt-get -y install --no-install-recommends \
    libasound2 \
    libatk-adaptor \
    libgtk-3-0 \
    libnss3 \
    openbox \
    xorg 
