FROM node:18-buster-slim

# 1) Sistem bağımlılıkları
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-pip python3-dev \
      libsndfile1-dev ffmpeg && \
    rm -rf /var/lib/apt/lists/* && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# 2) Node.js bağımlılıkları (cache için ayrı katman)
COPY package.json package-lock.json* ./
RUN npm install --production --unsafe-perm

# 3) Python requirements (cache için ayrı katman)
COPY requirements.txt ./
RUN pip3 install --no-cache-dir --upgrade pip && \
    pip3 install --no-cache-dir -r requirements.txt

# 4) Uygulama kodunu kopyala
COPY . .

# 5) Başlat
CMD ["node", "index.js"]
