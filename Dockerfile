FROM node:18-buster-slim

# 1) Python3, pip, derleyici araçları, ffmpeg ve libsndfile1-dev
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-dev \
      build-essential \
      libsndfile1-dev \
      ffmpeg \
      pkg-config && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Python bağımlılıklarını yükle
#    requirements.txt içinde: numpy, scipy, librosa, soundfile
COPY requirements.txt .
RUN pip3 install --no-cache-dir -r requirements.txt

# 3) Node.js bağımlılıkları
COPY package*.json ./
RUN npm install --omit=dev

# 4) Kalan kodu kopyala
COPY . .

# 5) Uygulamayı çalıştır
CMD ["node", "index.js"]
