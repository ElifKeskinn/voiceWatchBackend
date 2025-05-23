FROM node:18-buster-slim

# 1) Python3 ve ffmpeg kur, pip'i KALDIR
RUN apt-get update && \
    apt-get install -y \
      python3 \
      python3-numpy \
      python3-scipy \
      python3-librosa \
      python3-soundfile \
      ffmpeg \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Node bağımlılıklarını yükle
COPY package*.json ./
RUN npm install --omit=dev

# 3) Tüm uygulama kodunu kopyala
COPY . .

# 4) Uygulamayı başlat
CMD ["node", "index.js"]
