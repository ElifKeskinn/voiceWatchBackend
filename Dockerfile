FROM node:18-buster-slim

# 1) Python3, pip, ffmpeg, numpy & scipy paketlerini apt ile kur
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-numpy \
      python3-scipy \
      ffmpeg \
      libsndfile1 \
      build-essential && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Sadece Python’a özel eksik bağımlılıkları pip ile yükle
#    (librosa ve pysoundfile için)
RUN pip3 install --no-cache-dir librosa soundfile

# 3) Node.js bağımlılıklarını yükle
COPY package*.json ./
RUN npm install --omit=dev

# 4) Uygulama kodunu kopyala
COPY . .

# 5) Başlat
CMD ["node", "index.js"]
