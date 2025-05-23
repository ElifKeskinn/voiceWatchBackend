FROM node:18-buster-slim

# 1) Temel ve Python bağımlılıkları (pip vs. önceki adımlarda eklendiğini varsayıyoruz)
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      python3 python3-pip python3-dev \
      build-essential \
      libsndfile1-dev \
      ffmpeg \
      pkg-config \
      libblas-dev liblapack-dev gfortran \
      libssl-dev \            
      libpng-dev \              
      libcairo2-dev libpango1.0-dev \  
      libjpeg-dev librsvg2-dev &&  \
    rm -rf /var/lib/apt/lists/* && \
    ln -s /usr/bin/python3 /usr/bin/python

WORKDIR /app

# 2) Python bağımlılıkları
COPY requirements.txt ./
RUN pip3 install --no-cache-dir -r requirements.txt

# 3) Node bağımlılıklarını copy+install ile ayır
COPY package.json package-lock.json ./
RUN npm ci --only=production --unsafe-perm

# 4) Uygulama kodunu kopyala
COPY . .

CMD ["node", "index.js"]
