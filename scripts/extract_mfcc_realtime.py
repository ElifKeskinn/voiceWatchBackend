# scripts/extract_mfcc_realtime.py
import sys
import json
import numpy as np
import librosa

def main():
    if len(sys.argv) < 3:
        print(json.dumps({"error": "Usage: extract_mfcc_realtime.py <raw_pcm_file> <sample_rate>"}))
        sys.exit(1)
    
    pcm_path = sys.argv[1]
    sr = int(sys.argv[2])

    try:
        # raw PCM 16-bit little-endian mono
        with open(pcm_path, 'rb') as f:
            raw_data = f.read()

        audio_data = np.frombuffer(raw_data, dtype=np.int16)
        # -1.0 ~ 1.0 arasına normalle
        audio_float = audio_data.astype(np.float32) / 32768.0

        # librosa.feature.mfcc -> (n_mfcc, time_frames)
        mfcc = librosa.feature.mfcc(y=audio_float, sr=sr, n_mfcc=40)
        mfcc_mean = mfcc.mean(axis=1)  # (40,)

        print(json.dumps(mfcc_mean.tolist()))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
