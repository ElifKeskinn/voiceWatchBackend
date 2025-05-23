# melgenerator.py

import sys
import json
import numpy as np
import librosa

EXPECTED_TIME_STEPS = 63  # Modelin beklediği uzunluk

def main():
    if len(sys.argv) < 3:
        print("Usage: melgenerator.py <input.json> <output.json>", file=sys.stderr)
        sys.exit(1)

    input_path  = sys.argv[1]
    output_path = sys.argv[2]

    # 1) JSON’dan oku
    audio = np.array(json.load(open(input_path, 'r')), dtype=np.float32)

    # 2) Mel-spectrogram oluştur
    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=16000,
        n_fft=1024,
        hop_length=256,
        n_mels=128
    )
    log_mel = librosa.power_to_db(mel)

    # 3) Zamana göre kes/pad
    if log_mel.shape[1] > EXPECTED_TIME_STEPS:
        log_mel = log_mel[:, :EXPECTED_TIME_STEPS]
    elif log_mel.shape[1] < EXPECTED_TIME_STEPS:
        pad_width = EXPECTED_TIME_STEPS - log_mel.shape[1]
        log_mel = np.pad(log_mel, ((0,0),(0,pad_width)), mode='constant')

    # 4) Sonucu dosyaya yaz
    with open(output_path, 'w') as f:
        json.dump(log_mel.tolist(), f)

if __name__ == '__main__':
    try:
        main()
    except Exception as e:
        print(e, file=sys.stderr)
        sys.exit(1)
