FROM node:18-buster-slim

# Sadece gerekenler: Python3, pip, derleyici başlıkları, soundfile için libsndfile, ffmpeg
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-dev \
      libsndfile1-dev \
      ffmpeg && \
    rm -rf /var/lib/apt/lists/* && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# requirements.txt içinde sadece: numpy, scipy, librosa, soundfile
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

COPY package*.json ./
RUN npm install --production --unsafe-perm
COPY . .

CMD ["node", "index.js"]
