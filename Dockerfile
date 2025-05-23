FROM node:18-buster-slim

# 1) Python, pip, derleyici araçları, ffmpeg, soundfile ve BLAS/LAPACK kütüphaneleri
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 \
      python3-pip \
      python3-dev \
      build-essential \
      libsndfile1-dev \
      ffmpeg \
      pkg-config \
      libblas-dev \
      liblapack-dev \
      gfortran && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 2) Pip'i güncelle ve önce soundfile'ı yükle (libsndfile zaten apt ile var)
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir soundfile

# 3) Sonra librosa'yı yükle (bu aşamada numba, scipy vs. bağımlılıkları da wheel olarak gelecek)
RUN pip3 install --no-cache-dir librosa

# 4) Node.js bağımlılıklarını yükle
COPY package*.json ./
RUN npm install --omit=dev

# 5) Kalan kodu kopyala
COPY . .

# 6) Uygulamayı çalıştır
CMD ["node", "index.js"]
