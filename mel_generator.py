import sys
import json
import numpy as np
import librosa

EXPECTED_TIME_STEPS = 63  # Modelin beklediği uzunluk

try:
    input_data = sys.stdin.read()
    audio = np.array(json.loads(input_data), dtype=np.float32)

    mel = librosa.feature.melspectrogram(
        y=audio,
        sr=16000,
        n_fft=1024,
        hop_length=256,
        n_mels=128
    )

    log_mel = librosa.power_to_db(mel)

    # 🔧 timeSteps ayarı: [128 x 63]
    if log_mel.shape[1] > EXPECTED_TIME_STEPS:
        log_mel = log_mel[:, :EXPECTED_TIME_STEPS]  # Kes
    elif log_mel.shape[1] < EXPECTED_TIME_STEPS:
        pad_width = EXPECTED_TIME_STEPS - log_mel.shape[1]
        log_mel = np.pad(log_mel, ((0, 0), (0, pad_width)), mode='constant')  # Pad et

    print(json.dumps(log_mel.tolist()))
except Exception as e:
    print(str(e), file=sys.stderr)
    sys.exit(1)
